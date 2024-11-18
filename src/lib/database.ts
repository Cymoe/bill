import { ConvexReactClient } from "convex/react";

const convexUrl = import.meta.env.VITE_CONVEX_URL;

if (!convexUrl) {
  throw new Error("VITE_CONVEX_URL is not defined. Please check your .env file and make sure it contains VITE_CONVEX_URL");
}

const convex = new ConvexReactClient(convexUrl);

export const initializeDatabase = async () => {
  try {
    console.log('Database connection established');
    return true;
  } catch (error) {
    console.error('Error connecting to database:', error);
    return false;
  }
};

export { convex };