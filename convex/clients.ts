import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getClients = query({
  handler: async (ctx) => {
    return await ctx.db.query("clients").collect();
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
    return await ctx.db.insert("clients", {
      ...args,
      createdAt: Date.now(),
    });
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
    const { id, ...rest } = args;
    return await ctx.db.patch(id, rest);
  },
});

export const deleteClient = mutation({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

export const getClientById = query({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
}); 