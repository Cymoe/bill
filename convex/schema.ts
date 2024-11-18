import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  clients: defineTable({
    company: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    createdAt: v.number(),
  }),

  products: defineTable({
    name: v.string(),
    description: v.string(),
    price: v.number(),
    unit: v.string(),
    createdAt: v.number(),
  }),

  invoices: defineTable({
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
    createdAt: v.number(),
  }),

  templates: defineTable({
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
    createdAt: v.number(),
  }),
}); 