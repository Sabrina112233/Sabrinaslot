import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const gifJobs = pgTable("gif_jobs", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  settings: text("settings").notNull(), // JSON string
  status: text("status").notNull().default("processing"), // processing, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGifJobSchema = createInsertSchema(gifJobs).pick({
  filename: true,
  settings: true,
  status: true,
});

export const gifSettingsSchema = z.object({
  speed: z.number().min(100).max(2000).default(150),
  loop: z.number().min(0).max(10).default(0),
  quality: z.enum(["low", "medium", "high"]).default("high"),
  width: z.number().optional(),
  height: z.number().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertGifJob = z.infer<typeof insertGifJobSchema>;
export type GifJob = typeof gifJobs.$inferSelect;
export type GifSettings = z.infer<typeof gifSettingsSchema>;
