import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getClients = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      console.log("No identity found");
      return [];
    }

    console.log("Identity found:", {
      subject: identity.subject,
      tokenIdentifier: identity.tokenIdentifier,
    });

    // Get all clients for this user
    const clients = await ctx.db
      .query("clients")
      .filter((q) => 
        q.eq(q.field("userId"), identity.tokenIdentifier)
      )
      .collect();

    console.log("Found clients:", clients.length);
    return clients;
  },
});

export const createClient = mutation({
  args: {
    company: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("Creating client...");
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      console.log("No identity in createClient");
      throw new Error("Unauthorized");
    }

    console.log("Create client identity:", {
      subject: identity.subject,
      tokenIdentifier: identity.tokenIdentifier
    });

    const client = {
      ...args,
      userId: identity.tokenIdentifier,
      createdAt: Date.now(),
    };

    console.log("Creating client with data:", client);
    
    const id = await ctx.db.insert("clients", client);
    console.log("Created client with ID:", id);
    return id;
  },
});

export const updateClient = mutation({
  args: {
    id: v.id("clients"),
    company: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    console.log("Updating client...");
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      console.log("No identity in updateClient");
      throw new Error("Unauthorized");
    }

    console.log("Update client identity:", {
      subject: identity.subject,
      tokenIdentifier: identity.tokenIdentifier
    });

    const { id, ...rest } = args;
    const client = await ctx.db.get(id);
    if (!client || client.userId !== identity.subject) {
      console.log("Client not found or unauthorized");
      throw new Error("Not found or unauthorized");
    }
    console.log("Updating client with data:", rest);
    return await ctx.db.patch(id, rest);
  },
});

export const deleteClient = mutation({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    console.log("Deleting client...");
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      console.log("No identity in deleteClient");
      throw new Error("Unauthorized");
    }

    console.log("Delete client identity:", {
      subject: identity.subject,
      tokenIdentifier: identity.tokenIdentifier
    });

    const client = await ctx.db.get(args.id);
    if (!client || client.userId !== identity.subject) {
      console.log("Client not found or unauthorized");
      throw new Error("Not found or unauthorized");
    }
    console.log("Deleting client with ID:", args.id);
    return await ctx.db.delete(args.id);
  },
});

export const getClientById = query({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    console.log("Getting client by ID...");
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      console.log("No identity in getClientById");
      throw new Error("Unauthorized");
    }

    console.log("Get client by ID identity:", {
      subject: identity.subject,
      tokenIdentifier: identity.tokenIdentifier
    });

    const client = await ctx.db.get(args.id);
    if (!client || client.userId !== identity.subject) {
      console.log("Client not found or unauthorized");
      throw new Error("Not found or unauthorized");
    }
    console.log("Found client with ID:", args.id);
    return client;
  },
});