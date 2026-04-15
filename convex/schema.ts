import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  identifications: defineTable({
    userId: v.id("users"),
    imageBase64: v.string(),
    breed: v.string(),
    confidence: v.string(),
    description: v.string(),
    traits: v.array(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),
});
