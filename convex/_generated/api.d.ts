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
  anyApi,
} from "convex/server";
import type * as patches from "../patches.js";
import type * as environment from "../environment.js";
import type * as mesh from "../mesh.js";
import type * as alerts from "../alerts.js";
import type * as seed from "../seed.js";

declare const fullApi: ApiFromModules<{
  patches: typeof patches;
  environment: typeof environment;
  mesh: typeof mesh;
  alerts: typeof alerts;
  seed: typeof seed;
}>;

export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
