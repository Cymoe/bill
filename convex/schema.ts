import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  bills: defineTable({
    userId: v.optional(v.string()),
    amount: v.float64(),
    description: v.string(),
    dueDate: v.string(),
    createdAt: v.float64(),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("overdue")
    )),
  }),
  
  clients: defineTable({
    userId: v.optional(v.string()),
    company: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    createdAt: v.float64(),
  }),

  products: defineTable({
    userId: v.optional(v.string()),
    name: v.string(),
    description: v.string(),
    price: v.float64(),
    unit: v.string(),
    createdAt: v.float64(),
  }),

  templates: defineTable({
    userId: v.optional(v.string()),
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
    createdAt: v.float64(),
  }),

  invoices: defineTable({
    userId: v.optional(v.string()),
    number: v.string(),
    clientId: v.id("clients"),
    date: v.string(),
    dueDate: v.string(),
    items: v.array(
      v.object({
        productId: v.id("products"),
        quantity: v.float64(),
        price: v.float64(),
      })
    ),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("paid"),
      v.literal("overdue")
    ),
    total_amount: v.float64(),
    createdAt: v.float64(),
  }),
});