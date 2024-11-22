import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Default settings that match the schema requirements
const defaultSettings = {
  theme: "light",
  emailNotifications: true,
  currency: "USD",
  dateFormat: "MM/DD/YYYY",
  timeZone: "America/Los_Angeles",
};

export const getOrCreateUser = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called getOrCreateUser without authentication present");
    }

    try {
      // Check if we've already stored this identity before using the index
      let user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
        .first();

      // If no user found by tokenIdentifier, try to find by email
      if (!user && identity.email) {
        user = await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", identity.email))
          .first();

        // If found by email, update the tokenIdentifier
        if (user) {
          await ctx.db.patch(user._id, {
            tokenIdentifier: identity.tokenIdentifier,
            lastUpdatedAt: new Date().toISOString(),
          });
        }
      }

      if (user !== null) {
        // If we've seen this identity before but the profile has changed, patch the value
        const updates: any = {};
        if (user.name !== identity.name) updates.name = identity.name;
        if (user.email !== identity.email) updates.email = identity.email;
        if (user.picture !== identity.pictureUrl) updates.picture = identity.pictureUrl;
        
        // Update last login time
        updates.lastLoginAt = new Date().toISOString();
        
        if (Object.keys(updates).length > 0) {
          await ctx.db.patch(user._id, updates);
        }
        return user._id;
      }

      // If it's a new identity, create a new document
      const now = new Date().toISOString();
      const newUser = {
        name: identity.name || "",
        email: identity.email || "",
        picture: identity.pictureUrl || "",
        tokenIdentifier: identity.tokenIdentifier,
        // Profile fields with empty defaults
        company: "",
        title: "",
        phone: "",
        address: "",
        bio: "",
        // Settings with required fields
        settings: defaultSettings,
        // Metadata
        createdAt: now,
        lastLoginAt: now,
        lastUpdatedAt: now
      };

      try {
        const userId = await ctx.db.insert("users", newUser);
        return userId;
      } catch (insertError) {
        throw new Error("Failed to create new user record");
      }
    } catch (error) {
      throw new Error("Failed to create or retrieve user");
    }
  },
});

export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      console.log("No identity found in getCurrentUser");
      return null;
    }

    const { tokenIdentifier, email } = identity;
    
    try {
      // First, try to find the user by tokenIdentifier
      let user = await ctx.db
        .query("users")
        .withIndex("by_token", (q) => q.eq("tokenIdentifier", tokenIdentifier))
        .first();

      if (!user && email) {
        // If no user found by token, try email
        user = await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", email))
          .first();
        
        if (user) {
          // Update the token identifier if found by email
          user = await ctx.db.patch(user._id, {
            tokenIdentifier,
            lastUpdatedAt: new Date().toISOString(),
          });
        } else {
          // If no user found at all, try to create one
          const userId = await ctx.db.insert("users", {
            name: identity.name || "",
            email: email,
            picture: identity.pictureUrl || "",
            tokenIdentifier,
            company: "",
            title: "",
            phone: "",
            address: "",
            bio: "",
            settings: defaultSettings,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            lastUpdatedAt: new Date().toISOString(),
          });
          user = await ctx.db.get(userId);
        }
      }

      return user;
    } catch (error) {
      console.error("Error in getCurrentUser:", error);
      throw new Error("Failed to fetch user data");
    }
  },
});

export const updateProfile = mutation({
  args: {
    company: v.optional(v.string()),
    title: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called updateProfile without authentication present");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const updates = {
      ...args,
      lastUpdatedAt: new Date().toISOString(),
    };

    await ctx.db.patch(user._id, updates);
    return user._id;
  },
});
