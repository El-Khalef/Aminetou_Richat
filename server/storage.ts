import { 
  fundingOpportunities, 
  users, 
  clients, 
  applications, 
  documents,
  type User, 
  type InsertUser, 
  type FundingOpportunity, 
  type InsertFundingOpportunity,
  type Client,
  type InsertClient,
  type Application,
  type InsertApplication,
  type Document,
  type InsertDocument 
} from "@shared/schema";
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
    deadline?: string;
    searchTerm?: string;
    fonds?: string;
    sortBy?: string;
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

  // Applications (dossiers)
  getApplications(): Promise<Array<{
    id: number;
    client: Client;
    fundingOpportunity: FundingOpportunity;
    status: string;
    submissionDate: string;
    assignedConsultant?: string;
    completionScore: number;
    notes?: string;
    documents: Document[];
  }>>;
  getApplication(id: number): Promise<Application | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplication(id: number, application: Partial<InsertApplication>): Promise<Application>;
  deleteApplication(id: number): Promise<void>;

  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client>;

  // Documents
  getDocumentsByApplication(applicationId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<void>;
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
    deadline?: string;
    searchTerm?: string;
    fonds?: string;
    sortBy?: string;
  }): Promise<FundingOpportunity[]> {
    const conditions: any[] = [];
    
    if (filters?.sector) {
      conditions.push(sql`${filters.sector} = ANY(${fundingOpportunities.sectors})`);
    }
    
    if (filters?.fundingType && filters.fundingType !== 'all') {
      conditions.push(sql`${fundingOpportunities.fundingType} ILIKE ${'%' + filters.fundingType + '%'}`);
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
      conditions.push(sql`${fundingOpportunities.deadline} ILIKE ${'%' + filters.deadline + '%'}`);
    }
    
    // Filtre par terme de recherche (titre, description, program)
    if (filters?.searchTerm) {
      conditions.push(sql`(
        ${fundingOpportunities.title} ILIKE ${'%' + filters.searchTerm + '%'} OR
        ${fundingOpportunities.description} ILIKE ${'%' + filters.searchTerm + '%'} OR
        ${fundingOpportunities.fundingProgram} ILIKE ${'%' + filters.searchTerm + '%'}
      )`);
    }
    
    // Filtre par fonds (funding_program)
    if (filters?.fonds && filters.fonds !== 'all') {
      let fondPattern = filters.fonds;
      if (filters.fonds === 'GCF') {
        fondPattern = 'GCF';
      } else if (filters.fonds === 'GEF') {
        fondPattern = 'GEF';
      } else if (filters.fonds === 'CIF') {
        fondPattern = 'CIF';
      }
      conditions.push(sql`${fundingOpportunities.fundingProgram} ILIKE ${'%' + fondPattern + '%'}`);
    }
    
    let query = db.select().from(fundingOpportunities);
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Tri
    if (filters?.sortBy === 'title') {
      return await query.orderBy(asc(fundingOpportunities.title));
    } else if (filters?.sortBy === 'title_desc') {
      return await query.orderBy(desc(fundingOpportunities.title));
    } else if (filters?.sortBy === 'deadline') {
      return await query.orderBy(asc(fundingOpportunities.deadline));
    } else if (filters?.sortBy === 'amount') {
      return await query.orderBy(desc(fundingOpportunities.maxAmount));
    } else if (filters?.sortBy === 'recent') {
      return await query.orderBy(desc(fundingOpportunities.createdAt));
    } else {
      return await query.orderBy(asc(fundingOpportunities.deadline));
    }
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

  // Applications (dossiers)
  async getApplications(): Promise<Array<{
    id: number;
    client: Client;
    fundingOpportunity: FundingOpportunity;
    status: string;
    submissionDate: string;
    assignedConsultant?: string;
    completionScore: number;
    notes?: string;
    documents: Document[];
  }>> {
    // Retourner des données exemple pour l'instant
    return [
      {
        id: 1,
        client: {
          id: 1,
          organizationName: "Association Verte Mauritanie",
          contactPerson: "Aminata Sow",
          email: "aminata@vertmauritanie.org",
          phone: "+222 45 67 89 01",
          address: "Nouakchott, Mauritanie",
          legalStatus: "Association",
          structureType: "État",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        fundingOpportunity: {
          id: 8,
          title: "GCF - Simplified Approval Process",
          fundingProgram: "Guichet permanent du GCF",
          description: "Processus d'approbation simplifié du GCF",
          eligibilityCriteria: "Organisations locales",
          requiredDocuments: "Statuts, budget, plan d'affaires",
          externalLink: null,
          minAmount: 10000,
          maxAmount: 10000000,
          fundingType: "Don",
          status: "Ouvert",
          sectors: ["Environnement", "Climat"],
          deadline: "Aucune - Ouvert en continu",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        status: "En cours",
        submissionDate: "2025-01-05T10:00:00Z",
        assignedConsultant: undefined,
        completionScore: 65,
        notes: "Dossier en cours de finalisation",
        documents: [
          {
            id: 1,
            applicationId: 1,
            documentType: "Statuts juridiques",
            fileName: "statuts_association.pdf",
            fileSize: 245000,
            fileType: "pdf",
            uploadDate: new Date(),
            isRequired: true,
            status: "Soumis",
            createdAt: new Date(),
          },
          {
            id: 2,
            applicationId: 1,
            documentType: "Budget prévisionnel",
            fileName: "budget_previsionnel_2025.xlsx",
            fileSize: 89000,
            fileType: "xlsx",
            uploadDate: new Date(),
            isRequired: true,
            status: "Soumis",
            createdAt: new Date(),
          },
          {
            id: 3,
            applicationId: 1,
            documentType: "Plan d'affaires",
            fileName: "business_plan_mauritanie.pdf",
            fileSize: 1200000,
            fileType: "pdf",
            uploadDate: new Date(),
            isRequired: true,
            status: "Soumis",
            createdAt: new Date(),
          },
        ],
      },
      {
        id: 2,
        client: {
          id: 2,
          organizationName: "Coopérative des Pêcheurs",
          contactPerson: "Mohamed Vall",
          email: "m.vall@pecheurs.mr",
          phone: "+222 36 78 90 12",
          address: "Nouadhibou, Mauritanie",
          legalStatus: "Coopérative",
          structureType: "Privé",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        fundingOpportunity: {
          id: 9,
          title: "GEF - Least Developed Countries Fund",
          fundingProgram: "Fonds GEF",
          description: "Fonds pour les pays les moins avancés",
          eligibilityCriteria: "Pays moins avancés",
          requiredDocuments: "Documents complets requis",
          externalLink: null,
          minAmount: 5000,
          maxAmount: 50000000,
          fundingType: "Don",
          status: "Ouvert",
          sectors: ["Environnement", "Développement"],
          deadline: "Soumissions continues - Council 2 fois/an",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        status: "Prêt",
        submissionDate: "2025-01-03T14:30:00Z",
        assignedConsultant: "Dr. Fatima Bint",
        completionScore: 95,
        notes: "Dossier complet, prêt pour soumission",
        documents: [
          {
            id: 4,
            applicationId: 2,
            documentType: "Statuts juridiques",
            fileName: "statuts_cooperative.pdf",
            fileSize: 180000,
            fileType: "pdf",
            uploadDate: new Date(),
            isRequired: true,
            status: "Soumis",
            createdAt: new Date(),
          },
          {
            id: 5,
            applicationId: 2,
            documentType: "Budget prévisionnel",
            fileName: "budget_2025_peche.xlsx",
            fileSize: 95000,
            fileType: "xlsx",
            uploadDate: new Date(),
            isRequired: true,
            status: "Soumis",
            createdAt: new Date(),
          },
          {
            id: 6,
            applicationId: 2,
            documentType: "Plan d'affaires",
            fileName: "plan_affaires_peche.pdf",
            fileSize: 890000,
            fileType: "pdf",
            uploadDate: new Date(),
            isRequired: true,
            status: "Soumis",
            createdAt: new Date(),
          },
          {
            id: 7,
            applicationId: 2,
            documentType: "Preuves de cofinancement",
            fileName: "cofinancement_banque.pdf",
            fileSize: 340000,
            fileType: "pdf",
            uploadDate: new Date(),
            isRequired: true,
            status: "Soumis",
            createdAt: new Date(),
          },
          {
            id: 8,
            applicationId: 2,
            documentType: "Relevé d'identité bancaire",
            fileName: "rib_cooperative.pdf",
            fileSize: 125000,
            fileType: "pdf",
            uploadDate: new Date(),
            isRequired: true,
            status: "Soumis",
            createdAt: new Date(),
          },
        ],
      },
      {
        id: 3,
        client: {
          id: 3,
          organizationName: "Initiative Jeunesse Climat",
          contactPerson: "Aicha Mint Ahmed",
          email: "aicha@jeunesseClimat.mr",
          phone: "+222 22 33 44 55",
          address: "Rosso, Mauritanie",
          legalStatus: "ONG",
          structureType: "Institution publique",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        fundingOpportunity: {
          id: 10,
          title: "CIF - Climate Investment Funds",
          fundingProgram: "Programme CIF",
          description: "Fonds d'investissement climatique",
          eligibilityCriteria: "Projets climatiques",
          requiredDocuments: "Documentation technique requise",
          externalLink: null,
          minAmount: 1000000,
          maxAmount: 500000000,
          fundingType: "Prêt",
          status: "Ouvert",
          sectors: ["Climat", "Énergie"],
          deadline: "Approche programmatique",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        status: "En cours",
        submissionDate: "2025-01-07T09:15:00Z",
        assignedConsultant: undefined,
        completionScore: 35,
        notes: "Plusieurs documents manquants",
        documents: [
          {
            id: 9,
            applicationId: 3,
            documentType: "Plan d'affaires",
            fileName: "plan_jeunesse_climat.pdf",
            fileSize: 650000,
            fileType: "pdf",
            uploadDate: new Date(),
            isRequired: true,
            status: "Soumis",
            createdAt: new Date(),
          },
          {
            id: 10,
            applicationId: 3,
            documentType: "Identité du représentant légal",
            fileName: "cni_aicha.pdf",
            fileSize: 210000,
            fileType: "pdf",
            uploadDate: new Date(),
            isRequired: true,
            status: "Soumis",
            createdAt: new Date(),
          },
        ],
      },
    ];
  }

  async getApplication(id: number): Promise<Application | undefined> {
    // Méthode exemple
    return undefined;
  }

  async createApplication(application: InsertApplication): Promise<Application> {
    const [newApplication] = await db
      .insert(applications)
      .values(application)
      .returning();
    return newApplication;
  }

  async updateApplication(id: number, application: Partial<InsertApplication>): Promise<Application> {
    const [updatedApplication] = await db
      .update(applications)
      .set({ ...application, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    return updatedApplication;
  }

  async deleteApplication(id: number): Promise<void> {
    await db.delete(applications).where(eq(applications.id, id));
  }

  // Clients
  async getClients(): Promise<Client[]> {
    return await db.select().from(clients).orderBy(asc(clients.organizationName));
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [newClient] = await db
      .insert(clients)
      .values(client)
      .returning();
    return newClient;
  }

  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client> {
    const [updatedClient] = await db
      .update(clients)
      .set({ ...client, updatedAt: new Date() })
      .where(eq(clients.id, id))
      .returning();
    return updatedClient;
  }

  // Documents
  async getDocumentsByApplication(applicationId: number): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.applicationId, applicationId))
      .orderBy(asc(documents.documentType));
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db
      .insert(documents)
      .values(document)
      .returning();
    return newDocument;
  }

  async deleteDocument(id: number): Promise<void> {
    await db.delete(documents).where(eq(documents.id, id));
  }
}

export const storage = new DatabaseStorage();
