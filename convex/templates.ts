import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getTemplates = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    return await ctx.db
      .query("templates")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .order("desc")
      .collect();
  },
});

export const createTemplate = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.float64(),
        price: v.float64(),
      })
    ),
    total_amount: v.float64(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    return await ctx.db.insert("templates", {
      ...args,
      userId: identity.subject,
      createdAt: Date.now(),
    });
  },
});

export const updateTemplate = mutation({
  args: {
    id: v.id("templates"),
    name: v.string(),
    description: v.string(),
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.float64(),
        price: v.float64(),
      })
    ),
    total_amount: v.float64(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const { id, ...rest } = args;
    const template = await ctx.db.get(id);
    if (!template || template.userId !== identity.subject) {
      throw new Error("Not found or unauthorized");
    }
    return await ctx.db.patch(id, rest);
  },
});

export const deleteTemplate = mutation({
  args: { id: v.id("templates") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const template = await ctx.db.get(args.id);
    if (!template || template.userId !== identity.subject) {
      throw new Error("Not found or unauthorized");
    }
    return await ctx.db.delete(args.id);
  },
});