import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const fundingOpportunities = pgTable("funding_opportunities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  fundingProgram: text("funding_program").notNull(),
  description: text("description").notNull(),
  eligibilityCriteria: text("eligibility_criteria").notNull(),
  requiredDocuments: text("required_documents").notNull(),
  externalLink: text("external_link"),
  deadline: text("deadline").notNull(),
  minAmount: integer("min_amount"),
  maxAmount: integer("max_amount"),
  fundingType: text("funding_type").notNull(), // Don, Subvention, Prêt, Mixte
  status: text("status").notNull(), // Ouvert, À venir, Fermé
  sectors: text("sectors").array().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertFundingOpportunitySchema = createInsertSchema(fundingOpportunities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertFundingOpportunity = z.infer<typeof insertFundingOpportunitySchema>;
export type FundingOpportunity = typeof fundingOpportunities.$inferSelect;
