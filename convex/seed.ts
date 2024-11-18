import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // Seed Clients
    const client1 = await ctx.db.insert("clients", {
      company: "Acme Corp",
      name: "John Doe",
      email: "john@acme.com",
      phone: "555-0123",
      address: "123 Main St\nCity, ST 12345",
      createdAt: Date.now()
    });

    const client2 = await ctx.db.insert("clients", {
      company: "TechStart Inc",
      name: "Sarah Johnson",
      email: "accounts@techstart.com",
      phone: "(555) 987-6543",
      address: "456 Innovation Blvd",
      createdAt: Date.now()
    });

    // Seed Products
    const product1 = await ctx.db.insert("products", {
      name: "Web Development",
      description: "Professional web development services",
      price: 150,
      unit: "hour",
      createdAt: Date.now()
    });

    const product2 = await ctx.db.insert("products", {
      name: "UI/UX Design",
      description: "User interface and experience design",
      price: 1500.00,
      unit: "project",
      createdAt: Date.now()
    });

    // Seed Invoice
    await ctx.db.insert("invoices", {
      number: "INV-001",
      clientId: client1,
      date: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      items: [
        {
          productId: product1,
          quantity: 10,
          price: 150
        }
      ],
      status: "draft",
      total_amount: 1500,
      createdAt: Date.now()
    });

    return "Database seeded successfully!";
  },
}); 