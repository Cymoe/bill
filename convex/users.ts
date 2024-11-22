import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// User settings type with defaults
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

    // Check if we've already stored this identity before
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
      .first();

    if (user !== null) {
      // If we've seen this identity before but the profile has changed, patch the value
      const updates: any = {};
      if (user.name !== identity.name) updates.name = identity.name;
      if (user.email !== identity.email) updates.email = identity.email;
      if (user.picture !== identity.pictureUrl) updates.picture = identity.pictureUrl;
      
      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(user._id, updates);
      }
      return user._id;
    }

    // If it's a new identity, create a new document
    return await ctx.db.insert("users", {
      name: identity.name,
      email: identity.email,
      picture: identity.pictureUrl,
      tokenIdentifier: identity.tokenIdentifier,
      // Profile fields
      company: "",
      title: "",
      phone: "",
      address: "",
      bio: "",
      // Settings with defaults
      settings: defaultSettings,
      // Metadata
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
    });
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
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Only update fields that were provided
    const updates = Object.fromEntries(
      Object.entries(args).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(user._id, updates);
    }

    return user._id;
  },
});

export const updateSettings = mutation({
  args: {
    theme: v.optional(v.string()),
    emailNotifications: v.optional(v.boolean()),
    currency: v.optional(v.string()),
    dateFormat: v.optional(v.string()),
    timeZone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Merge new settings with existing ones
    const currentSettings = user.settings ?? defaultSettings;
    const newSettings = { ...currentSettings };
    
    Object.entries(args).forEach(([key, value]) => {
      if (value !== undefined) {
        (newSettings as any)[key] = value;
      }
    });

    await ctx.db.patch(user._id, { 
      settings: newSettings,
      lastUpdatedAt: Date.now(),
    });

    return newSettings;
  },
});

export const getUser = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    return user;
  },
});

export const getCurrentUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
      .first();

    return user;
  },
});
