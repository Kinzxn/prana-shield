/* eslint-disable */
/**
 * Generated `server` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import {
  queryGeneric,
  mutationGeneric,
  actionGeneric,
} from "convex/server";
import type { DataModel } from "./dataModel.js";

/**
 * Define a query in this Convex app's public API.
 */
export const query = queryGeneric as typeof queryGeneric & {
  <Output>(func: { args?: any; handler: (ctx: any, args: any) => Output | Promise<Output> }): any;
};

/**
 * Define a mutation in this Convex app's public API.
 */
export const mutation = mutationGeneric as typeof mutationGeneric & {
  <Output>(func: { args?: any; handler: (ctx: any, args: any) => Output | Promise<Output> }): any;
};

/**
 * Define an action in this Convex app's public API.
 */
export const action = actionGeneric as typeof actionGeneric & {
  <Output>(func: { args?: any; handler: (ctx: any, args: any) => Output | Promise<Output> }): any;
};
