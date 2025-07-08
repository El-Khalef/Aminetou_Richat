import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFundingOpportunitySchema } from "@shared/schema";
import { z } from "zod";

const filtersSchema = z.object({
  sector: z.string().optional(),
  fundingType: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  status: z.string().optional(),
  deadline: z.string().optional(),
  searchTerm: z.string().optional(),
  fonds: z.string().optional(),
  sortBy: z.string().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all funding opportunities with optional filters
  app.get("/api/funding-opportunities", async (req, res) => {
    try {
      const filters = filtersSchema.safeParse(req.query);
      const opportunities = await storage.getFundingOpportunities(
        filters.success ? filters.data : undefined
      );
      res.json(opportunities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch funding opportunities" });
    }
  });

  // Get single funding opportunity
  app.get("/api/funding-opportunities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const opportunity = await storage.getFundingOpportunity(id);
      if (!opportunity) {
        return res.status(404).json({ message: "Funding opportunity not found" });
      }
      res.json(opportunity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch funding opportunity" });
    }
  });

  // Create new funding opportunity
  app.post("/api/funding-opportunities", async (req, res) => {
    try {
      const validation = insertFundingOpportunitySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid data", errors: validation.error.errors });
      }

      const opportunity = await storage.createFundingOpportunity(validation.data);
      res.status(201).json(opportunity);
    } catch (error) {
      res.status(500).json({ message: "Failed to create funding opportunity" });
    }
  });

  // Update funding opportunity
  app.put("/api/funding-opportunities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validation = insertFundingOpportunitySchema.partial().safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid data", errors: validation.error.errors });
      }

      const opportunity = await storage.updateFundingOpportunity(id, validation.data);
      res.json(opportunity);
    } catch (error) {
      res.status(500).json({ message: "Failed to update funding opportunity" });
    }
  });

  // Delete funding opportunity
  app.delete("/api/funding-opportunities/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFundingOpportunity(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete funding opportunity" });
    }
  });

  // Get funding statistics
  app.get("/api/funding-statistics", async (req, res) => {
    try {
      const statistics = await storage.getFundingStatistics();
      res.json(statistics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Applications (dossiers) routes
  app.get("/api/applications", async (req, res) => {
    try {
      const applications = await storage.getApplications();
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  app.get("/api/applications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const application = await storage.getApplication(id);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.json(application);
    } catch (error) {
      console.error("Error fetching application:", error);
      res.status(500).json({ error: "Failed to fetch application" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
