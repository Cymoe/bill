import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getInvoices = query({
  handler: async (ctx) => {
    return await ctx.db.query("invoices").collect();
  },
});

export const getInvoiceById = query({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createInvoice = mutation({
  args: {
    number: v.string(),
    clientId: v.id("clients"),
    date: v.string(),
    dueDate: v.string(),
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
        price: v.number(),
      })
    ),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("paid"),
      v.literal("overdue")
    ),
    total_amount: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("invoices", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const updateInvoice = mutation({
  args: {
    id: v.id("invoices"),
    number: v.string(),
    clientId: v.id("clients"),
    date: v.string(),
    dueDate: v.string(),
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.number(),
        price: v.number(),
      })
    ),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("paid"),
      v.literal("overdue")
    ),
    total_amount: v.number(),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    return await ctx.db.patch(id, rest);
  },
});

export const deleteInvoice = mutation({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
}); 