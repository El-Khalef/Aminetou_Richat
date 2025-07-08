import { fundingOpportunities, users, type User, type InsertUser, type FundingOpportunity, type InsertFundingOpportunity } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, sql, desc, asc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Funding opportunities
  getFundingOpportunities(filters?: {
    sector?: string;
    fundingType?: string;
    minAmount?: number;
    maxAmount?: number;
    status?: string;
    deadline?: Date;
  }): Promise<FundingOpportunity[]>;
  getFundingOpportunity(id: number): Promise<FundingOpportunity | undefined>;
  createFundingOpportunity(opportunity: InsertFundingOpportunity): Promise<FundingOpportunity>;
  updateFundingOpportunity(id: number, opportunity: Partial<InsertFundingOpportunity>): Promise<FundingOpportunity>;
  deleteFundingOpportunity(id: number): Promise<void>;
  getFundingStatistics(): Promise<{
    totalOpen: number;
    totalPending: number;
    totalAmount: number;
    thisWeek: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getFundingOpportunities(filters?: {
    sector?: string;
    fundingType?: string;
    minAmount?: number;
    maxAmount?: number;
    status?: string;
    deadline?: Date;
  }): Promise<FundingOpportunity[]> {
    const conditions: any[] = [];
    
    if (filters?.sector) {
      conditions.push(sql`${filters.sector} = ANY(${fundingOpportunities.sectors})`);
    }
    
    if (filters?.fundingType) {
      conditions.push(eq(fundingOpportunities.fundingType, filters.fundingType));
    }
    
    if (filters?.status) {
      conditions.push(eq(fundingOpportunities.status, filters.status));
    }
    
    if (filters?.minAmount) {
      conditions.push(gte(fundingOpportunities.minAmount, filters.minAmount));
    }
    
    if (filters?.maxAmount) {
      conditions.push(lte(fundingOpportunities.maxAmount, filters.maxAmount));
    }
    
    if (filters?.deadline) {
      conditions.push(lte(fundingOpportunities.deadline, filters.deadline));
    }
    
    const baseQuery = db.select().from(fundingOpportunities);
    
    if (conditions.length > 0) {
      return await baseQuery.where(and(...conditions)).orderBy(desc(fundingOpportunities.createdAt));
    }
    
    return await baseQuery.orderBy(desc(fundingOpportunities.createdAt));
  }

  async getFundingOpportunity(id: number): Promise<FundingOpportunity | undefined> {
    const [opportunity] = await db.select().from(fundingOpportunities).where(eq(fundingOpportunities.id, id));
    return opportunity || undefined;
  }

  async createFundingOpportunity(opportunity: InsertFundingOpportunity): Promise<FundingOpportunity> {
    const [created] = await db
      .insert(fundingOpportunities)
      .values({
        ...opportunity,
        updatedAt: new Date(),
      })
      .returning();
    return created;
  }

  async updateFundingOpportunity(id: number, opportunity: Partial<InsertFundingOpportunity>): Promise<FundingOpportunity> {
    const [updated] = await db
      .update(fundingOpportunities)
      .set({
        ...opportunity,
        updatedAt: new Date(),
      })
      .where(eq(fundingOpportunities.id, id))
      .returning();
    return updated;
  }

  async deleteFundingOpportunity(id: number): Promise<void> {
    await db.delete(fundingOpportunities).where(eq(fundingOpportunities.id, id));
  }

  async getFundingStatistics(): Promise<{
    totalOpen: number;
    totalPending: number;
    totalAmount: number;
    thisWeek: number;
  }> {
    const [openCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(fundingOpportunities)
      .where(eq(fundingOpportunities.status, "Ouvert"));

    const [pendingCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(fundingOpportunities)
      .where(eq(fundingOpportunities.status, "À venir"));

    const [totalAmount] = await db
      .select({ 
        sum: sql<number>`coalesce(sum(${fundingOpportunities.maxAmount}), 0)::int`
      })
      .from(fundingOpportunities)
      .where(eq(fundingOpportunities.status, "Ouvert"));

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [thisWeekCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(fundingOpportunities)
      .where(gte(fundingOpportunities.createdAt, oneWeekAgo));

    return {
      totalOpen: openCount?.count || 0,
      totalPending: pendingCount?.count || 0,
      totalAmount: totalAmount?.sum || 0,
      thisWeek: thisWeekCount?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
