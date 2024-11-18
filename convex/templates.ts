import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getTemplates = query({
  handler: async (ctx) => {
    return await ctx.db.query("templates").collect();
  },
});

export const createTemplate = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
        price: v.number(),
      })
    ),
    total_amount: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("templates", {
      ...args,
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
        quantity: v.number(),
        price: v.number(),
      })
    ),
    total_amount: v.number(),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    return await ctx.db.patch(id, rest);
  },
});

export const deleteTemplate = mutation({
  args: { id: v.id("templates") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
}); 