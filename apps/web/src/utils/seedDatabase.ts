import { db, Tables } from "../lib/database";
import { supabase } from "../lib/supabase";
import { seedClients, seedProducts, seedInvoices, seedProjects } from "../data/seedData";

export async function seedDatabase() {
  try {
    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      throw new Error('User not authenticated');
    }
    const userId = session.user.id;

    // Clear existing data
    await supabase.from('projects').delete().eq('user_id', userId);
    await supabase.from('invoices').delete().eq('user_id', userId);
    await supabase.from('products').delete().eq('user_id', userId);
    await supabase.from('clients').delete().eq('user_id', userId);

    // Insert seed data
    const createdClients: Tables['clients'][] = [];
    for (const client of seedClients) {
      const result = await db.clients.create({
        ...client,
        user_id: userId
      });
      if (result?.id) createdClients.push(result as Tables['clients']);
    }

    // Create projects with client references
    for (let i = 0; i < seedProjects.length; i++) {
      const project = seedProjects[i];
      const clientIndex = i % createdClients.length;
      await db.projects.create({
        name: project.name,
        description: project.description,
        status: project.status,
        budget: project.budget,
        start_date: project.start_date,
        end_date: project.end_date,
        user_id: userId,
        client_id: createdClients[clientIndex].id
      });
    }

    for (const product of seedProducts) {
      await db.products.create({
        ...product,
        user_id: userId
      });
    }

    for (const invoice of seedInvoices) {
      const clientIndex = 0;
      await db.invoices.create({
        ...invoice,
        user_id: userId,
        client_id: createdClients[clientIndex].id
      });
    }

    return true;
  } catch (error) {
    return false;
  }
}