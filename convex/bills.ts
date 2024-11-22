import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Example of a protected mutation that requires authentication
export const createBill = mutation({
  args: {
    amount: v.number(),
    description: v.string(),
    dueDate: v.string(),
  },
  handler: async (ctx, args) => {
    // Get the user's identity token
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const userId = identity.subject;

    // Create a new bill associated with the authenticated user
    const bill = await ctx.db.insert("bills", {
      userId,
      amount: args.amount,
      description: args.description,
      dueDate: args.dueDate,
      createdAt: new Date().toISOString(),
    });

    return bill;
  },
});

// Example of a protected query that requires authentication
export const getUserBills = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if (!identity) {
      return [];
    }

    const userId = identity.subject;

    // Get all bills for the authenticated user
    const bills = await ctx.db
      .query("bills")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .collect();

    return bills;
  },
});
