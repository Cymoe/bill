import dotenv from 'dotenv';
dotenv.config();

import { ConvexClient } from "convex/browser";
import { api } from "../convex/_generated/api";

const convexUrl = process.env.VITE_CONVEX_URL || 'https://default-url.convex.cloud';

async function seed() {
  console.log("Starting database seeding...");
  console.log("Using Convex URL:", convexUrl);
  
  const client = new ConvexClient(convexUrl);
  
  try {
    // Create clients
    console.log("Creating clients...");
    const clients = await Promise.all([
      client.mutation(api.clients.createClient, {
        company: "Acme Corp",
        name: "John Doe",
        email: "john@acme.com",
        phone: "555-0123",
        address: "123 Main St\nCity, ST 12345"
      }),
      client.mutation(api.clients.createClient, {
        company: "TechStart Inc",
        name: "Jane Smith",
        email: "jane@techstart.com",
        phone: "555-0124",
        address: "456 Tech Ave\nValley, ST 12346"
      }),
      client.mutation(api.clients.createClient, {
        company: "Global Solutions Ltd",
        name: "Mike Johnson",
        email: "mike@globalsolutions.com",
        phone: "555-0125",
        address: "789 Business Rd\nMetro, ST 12347"
      }),
      client.mutation(api.clients.createClient, {
        company: "Creative Minds",
        name: "Sarah Wilson",
        email: "sarah@creativeminds.com",
        phone: "555-0126",
        address: "321 Design Blvd\nArtCity, ST 12348"
      })
    ]);

    // Create products
    console.log("Creating products...");
    const products = await Promise.all([
      client.mutation(api.products.createProduct, {
        name: "Web Development",
        description: "Professional web development services",
        price: 150,
        unit: "hour"
      }),
      client.mutation(api.products.createProduct, {
        name: "UI/UX Design",
        description: "User interface and experience design",
        price: 1500.00,
        unit: "project"
      }),
      client.mutation(api.products.createProduct, {
        name: "Mobile App Development",
        description: "Native mobile application development",
        price: 175,
        unit: "hour"
      }),
      client.mutation(api.products.createProduct, {
        name: "SEO Optimization",
        description: "Search engine optimization services",
        price: 800,
        unit: "month"
      }),
      client.mutation(api.products.createProduct, {
        name: "Cloud Infrastructure Setup",
        description: "AWS/GCP/Azure infrastructure configuration",
        price: 2500,
        unit: "project"
      })
    ]);

    // Create templates
    console.log("Creating templates...");
    const templates = await Promise.all([
      client.mutation(api.templates.createTemplate, {
        name: "Web Development Package",
        description: "Standard web development package including design and development",
        items: [
          {
            productId: products[0],
            quantity: 40,
            price: 150
          },
          {
            productId: products[1],
            quantity: 1,
            price: 1500
          }
        ],
        total_amount: 7500
      }),
      client.mutation(api.templates.createTemplate, {
        name: "Mobile App Starter",
        description: "Basic mobile app development package",
        items: [
          {
            productId: products[2],
            quantity: 60,
            price: 175
          },
          {
            productId: products[1],
            quantity: 1,
            price: 1500
          }
        ],
        total_amount: 12000
      }),
      client.mutation(api.templates.createTemplate, {
        name: "Digital Marketing Bundle",
        description: "Complete digital marketing setup with SEO",
        items: [
          {
            productId: products[3],
            quantity: 3,
            price: 800
          },
          {
            productId: products[4],
            quantity: 1,
            price: 2500
          }
        ],
        total_amount: 4900
      })
    ]);

    // Create invoices
    console.log("Creating invoices...");
    const invoices = await Promise.all([
      client.mutation(api.invoices.createInvoice, {
        number: "INV-001",
        clientId: clients[0],
        date: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          {
            productId: products[0],
            quantity: 10,
            price: 150
          },
          {
            productId: products[1],
            quantity: 1,
            price: 1500
          }
        ],
        status: "draft",
        total_amount: 3000
      }),
      client.mutation(api.invoices.createInvoice, {
        number: "INV-002",
        clientId: clients[1],
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          {
            productId: products[2],
            quantity: 20,
            price: 175
          }
        ],
        status: "sent",
        total_amount: 3500
      }),
      client.mutation(api.invoices.createInvoice, {
        number: "INV-003",
        clientId: clients[2],
        date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          {
            productId: products[3],
            quantity: 3,
            price: 800
          },
          {
            productId: products[4],
            quantity: 1,
            price: 2500
          }
        ],
        status: "paid",
        total_amount: 4900
      })
    ]);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  } finally {
    await client.close();
  }
}

seed().catch(console.error);