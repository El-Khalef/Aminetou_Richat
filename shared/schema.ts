import { pgTable, text, serial, integer, timestamp, boolean, varchar } from "drizzle-orm/pg-core";
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

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  organizationName: varchar("organization_name", { length: 255 }).notNull(),
  contactPerson: varchar("contact_person", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  address: text("address"),
  legalStatus: varchar("legal_status", { length: 100 }),
  structureType: varchar("structure_type", { length: 50 }).default("Privé"), // "État", "Institution publique", "Privé"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  fundingOpportunityId: integer("funding_opportunity_id").references(() => fundingOpportunities.id).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("En cours"),
  submissionDate: timestamp("submission_date").defaultNow().notNull(),
  assignedConsultant: varchar("assigned_consultant", { length: 255 }),
  completionScore: integer("completion_score").default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").references(() => applications.id).notNull(),
  documentType: varchar("document_type", { length: 100 }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileSize: integer("file_size"),
  fileType: varchar("file_type", { length: 50 }),
  uploadDate: timestamp("upload_date").defaultNow().notNull(),
  isRequired: boolean("is_required").default(true),
  status: varchar("status", { length: 50 }).notNull().default("Soumis"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertFundingOpportunitySchema = createInsertSchema(fundingOpportunities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertFundingOpportunity = z.infer<typeof insertFundingOpportunitySchema>;
export type FundingOpportunity = typeof fundingOpportunities.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
