import { api } from "../../convex/_generated/api";
import { convex } from "../lib/database";
import { seedClients, seedProducts, seedInvoices } from "../data/seedData";

export async function seedDatabase() {
  try {
    // Clear existing data
    const clients = await convex.query(api.clients.getClients);
    const products = await convex.query(api.products.getProducts);
    const invoices = await convex.query(api.invoices.getInvoices);

    // Delete existing data
    for (const invoice of invoices) {
      await convex.mutation(api.invoices.deleteInvoice, { id: invoice._id });
    }
    for (const product of products) {
      await convex.mutation(api.products.deleteProduct, { id: product._id });
    }
    for (const client of clients) {
      await convex.mutation(api.clients.deleteClient, { id: client._id });
    }

    // Insert seed data
    for (const client of seedClients) {
      await convex.mutation(api.clients.createClient, {
        ...client,
        createdAt: Date.now()
      });
    }

    for (const product of seedProducts) {
      await convex.mutation(api.products.createProduct, product);
    }

    for (const invoice of seedInvoices) {
      await convex.mutation(api.invoices.createInvoice, invoice);
    }

    console.log('Database seeded successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
}