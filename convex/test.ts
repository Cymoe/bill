import { query } from "./_generated/server";

export const testAuth = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    console.log("Test Auth - Server Identity:", JSON.stringify(identity, null, 2));
    return {
      authenticated: !!identity,
      identity,
    };
  },
});
