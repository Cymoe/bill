import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getInvoices = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    return await ctx.db
      .query("invoices")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .order("desc")
      .collect();
  },
});

export const getInvoiceById = query({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const invoice = await ctx.db.get(args.id);
    if (!invoice || invoice.userId !== identity.subject) {
      throw new Error("Not found or unauthorized");
    }

    return invoice;
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    return await ctx.db.insert("invoices", {
      ...args,
      userId: identity.subject,
      createdAt: new Date().toISOString(),
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const { id, ...rest } = args;
    const invoice = await ctx.db.get(id);
    if (!invoice || invoice.userId !== identity.subject) {
      throw new Error("Not found or unauthorized");
    }

    return await ctx.db.patch(id, rest);
  },
});

export const deleteInvoice = mutation({
  args: { id: v.id("invoices") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const invoice = await ctx.db.get(args.id);
    if (!invoice || invoice.userId !== identity.subject) {
      throw new Error("Not found or unauthorized");
    }

    return await ctx.db.delete(args.id);
  },
});