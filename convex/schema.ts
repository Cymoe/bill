import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    picture: v.string(),
    tokenIdentifier: v.string(),
    // Profile fields
    company: v.optional(v.string()),
    title: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    bio: v.optional(v.string()),
    // Settings
    settings: v.object({
      theme: v.string(),
      emailNotifications: v.boolean(),
      currency: v.string(),
      dateFormat: v.string(),
      timeZone: v.string(),
    }),
    // Metadata
    createdAt: v.string(),
    lastLoginAt: v.string(),
    lastUpdatedAt: v.string(),
  }).index("by_token", ["tokenIdentifier"]).index("by_email", ["email"]),

  bills: defineTable({
    userId: v.id("users"),
    amount: v.float64(),
    description: v.string(),
    dueDate: v.string(),
    createdAt: v.string(),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("overdue")
    )),
  }).index("by_user", ["userId"]),
  
  clients: defineTable({
    userId: v.id("users"),
    company: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    createdAt: v.string(),
  }).index("by_user", ["userId"]),

  products: defineTable({
    userId: v.optional(v.string()),
    name: v.string(),
    description: v.string(),
    price: v.float64(),
    unit: v.string(),
    createdAt: v.string(),
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
    createdAt: v.string(),
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
    createdAt: v.string(),
  }),
});