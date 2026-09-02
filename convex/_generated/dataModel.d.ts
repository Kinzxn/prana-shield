/* eslint-disable */
/**
 * Generated `dataModel` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  DataModelFromSchemaDefinition,
} from "convex/server";
import type schema from "../schema.js";

/**
 * The names of all of your Convex tables.
 */
export type TableNames =
  | "patches"
  | "environmentalNodes"
  | "meshNodes"
  | "alertLog";

/**
 * The type of your Convex data model.
 */
export type DataModel = DataModelFromSchemaDefinition<typeof schema>;
