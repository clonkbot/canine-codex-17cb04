import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("identifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(20);
  },
});

export const create = mutation({
  args: {
    imageBase64: v.string(),
    breed: v.string(),
    confidence: v.string(),
    description: v.string(),
    traits: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.db.insert("identifications", {
      userId,
      imageBase64: args.imageBase64,
      breed: args.breed,
      confidence: args.confidence,
      description: args.description,
      traits: args.traits,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("identifications") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const identification = await ctx.db.get(args.id);
    if (!identification || identification.userId !== userId) {
      throw new Error("Not found");
    }
    await ctx.db.delete(args.id);
  },
});
