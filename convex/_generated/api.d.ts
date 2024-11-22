/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as bills from "../bills.js";
import type * as clients from "../clients.js";
import type * as invoices from "../invoices.js";
import type * as products from "../products.js";
import type * as seed from "../seed.js";
import type * as templates from "../templates.js";
import type * as test from "../test.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  bills: typeof bills;
  clients: typeof clients;
  invoices: typeof invoices;
  products: typeof products;
  seed: typeof seed;
  templates: typeof templates;
  test: typeof test;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
