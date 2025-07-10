-- =============================================
-- Richat Funding Tracker - Database Schema
-- =============================================
-- Base de données PostgreSQL pour le suivi des opportunités de financement
-- Généré à partir du schéma Drizzle ORM

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS "users" (
    "id" serial PRIMARY KEY NOT NULL,
    "username" varchar(255) NOT NULL UNIQUE,
    "password" varchar(255) NOT NULL,
    "email" varchar(255) NOT NULL UNIQUE,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Table des opportunités de financement
CREATE TABLE IF NOT EXISTS "funding_opportunities" (
    "id" serial PRIMARY KEY NOT NULL,
    "title" varchar(500) NOT NULL,
    "funding_program" varchar(255) NOT NULL,
    "description" text NOT NULL,
    "eligibility_criteria" text NOT NULL,
    "min_amount" integer,
    "max_amount" integer,
    "currency" varchar(10) DEFAULT 'EUR' NOT NULL,
    "deadline" timestamp,
    "application_url" varchar(1000),
    "contact_email" varchar(255),
    "sectors" text[] DEFAULT '{}' NOT NULL,
    "funding_type" varchar(50) NOT NULL,
    "status" varchar(20) DEFAULT 'Ouvert' NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Table des clients
CREATE TABLE IF NOT EXISTS "clients" (
    "id" serial PRIMARY KEY NOT NULL,
    "organization_name" varchar(255) NOT NULL,
    "contact_person" varchar(255) NOT NULL,
    "email" varchar(255) NOT NULL,
    "phone" varchar(20),
    "address" text,
    "legal_status" varchar(100),
    "structure_type" varchar(100),
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Table des candidatures/dossiers
CREATE TABLE IF NOT EXISTS "applications" (
    "id" serial PRIMARY KEY NOT NULL,
    "client_id" integer NOT NULL,
    "funding_opportunity_id" integer NOT NULL,
    "status" varchar(50) DEFAULT 'Brouillon' NOT NULL,
    "submission_date" timestamp DEFAULT now() NOT NULL,
    "assigned_consultant" varchar(255),
    "completion_score" integer DEFAULT 0 NOT NULL,
    "notes" text,
    "requested_amount" integer,
    "funding_type" varchar(50),
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Table des documents
CREATE TABLE IF NOT EXISTS "documents" (
    "id" serial PRIMARY KEY NOT NULL,
    "application_id" integer NOT NULL,
    "document_type" varchar(255) NOT NULL,
    "file_name" varchar(500) NOT NULL,
    "file_size" integer,
    "file_type" varchar(50),
    "upload_date" timestamp DEFAULT now() NOT NULL,
    "is_required" boolean DEFAULT false NOT NULL,
    "status" varchar(50) DEFAULT 'En attente' NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- =============================================
-- Contraintes de clés étrangères
-- =============================================

-- Référence client dans applications
ALTER TABLE "applications" ADD CONSTRAINT "applications_client_id_clients_id_fk" 
FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE;

-- Référence opportunité de financement dans applications
ALTER TABLE "applications" ADD CONSTRAINT "applications_funding_opportunity_id_funding_opportunities_id_fk" 
FOREIGN KEY ("funding_opportunity_id") REFERENCES "funding_opportunities"("id") ON DELETE CASCADE;

-- Référence application dans documents
ALTER TABLE "documents" ADD CONSTRAINT "documents_application_id_applications_id_fk" 
FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE;

-- =============================================
-- Index pour améliorer les performances
-- =============================================

-- Index sur les champs de recherche fréquente
CREATE INDEX IF NOT EXISTS "idx_funding_opportunities_status" ON "funding_opportunities" ("status");
CREATE INDEX IF NOT EXISTS "idx_funding_opportunities_funding_type" ON "funding_opportunities" ("funding_type");
CREATE INDEX IF NOT EXISTS "idx_funding_opportunities_deadline" ON "funding_opportunities" ("deadline");
CREATE INDEX IF NOT EXISTS "idx_applications_status" ON "applications" ("status");
CREATE INDEX IF NOT EXISTS "idx_applications_client_id" ON "applications" ("client_id");
CREATE INDEX IF NOT EXISTS "idx_applications_funding_opportunity_id" ON "applications" ("funding_opportunity_id");
CREATE INDEX IF NOT EXISTS "idx_clients_structure_type" ON "clients" ("structure_type");

-- =============================================
-- Données d'exemple pour le développement
-- =============================================

-- Insertion des opportunités de financement
INSERT INTO "funding_opportunities" ("title", "funding_program", "description", "eligibility_criteria", "min_amount", "max_amount", "currency", "deadline", "sectors", "funding_type", "status") VALUES
('GCF - Simplified Approval Process', 'Guichet permanent du GCF', 'Processus d''approbation simplifié du GCF pour les projets climatiques', 'Organisations mauritaniennes travaillant sur l''adaptation climatique', 50000, 10000000, 'USD', '2025-12-31 23:59:59', ARRAY['Environnement', 'Agriculture', 'Energie'], 'Don', 'Ouvert'),
('MAF Call 2025', 'Mauritania Africa Foundation', 'Appel à projets 2025 de la Fondation Mauritanie Afrique', 'PME mauritaniennes et organisations locales', 5000, 50000, 'EUR', '2025-07-23 23:59:59', ARRAY['Développement économique', 'Innovation'], 'Subvention', 'Ouvert'),
('AfDB Private Sector Development', 'Banque Africaine de Développement', 'Financement pour le développement du secteur privé', 'PME et grandes entreprises africaines', 100000, 5000000, 'USD', NULL, ARRAY['Industrie', 'Services'], 'Prêt', 'Ouvert'),
('EU Climate Fund', 'Union Européenne', 'Fonds européen pour le climat en Afrique', 'Gouvernements et organisations internationales', 1000000, 50000000, 'EUR', '2025-09-15 23:59:59', ARRAY['Environnement', 'Climat'], 'Don', 'Ouvert');

-- Insertion des clients
INSERT INTO "clients" ("organization_name", "contact_person", "email", "phone", "address", "legal_status", "structure_type") VALUES
('Association Verte Mauritanie', 'Aminata Sow', 'aminata@vertmauritanie.org', '+222 45 67 89 01', 'Nouakchott, Mauritanie', 'Association', 'État'),
('Coopérative des Pêcheurs', 'Mohamed Vall', 'm.vall@pecheurs.mr', '+222 36 78 90 12', 'Nouadhibou, Mauritanie', 'Coopérative', 'Privé'),
('Initiative Jeunesse Climat', 'Aicha Mint Ahmed', 'aicha@jeunesseClimat.mr', '+222 22 33 44 55', 'Rosso, Mauritanie', 'ONG', 'Institution publique');

-- Insertion des applications
INSERT INTO "applications" ("client_id", "funding_opportunity_id", "status", "assigned_consultant", "completion_score", "notes", "requested_amount", "funding_type") VALUES
(1, 1, 'En cours', 'Sarah Martin', 75, 'Dossier bien avancé, documentation complète', 250000, 'Don'),
(2, 2, 'Soumis', 'Ahmed Hassan', 90, 'Dossier finalisé et soumis', 35000, 'Subvention'),
(3, 1, 'Brouillon', 'Fatima Bint', 45, 'Dossier en cours de préparation', 180000, 'Don');

-- Insertion des documents
INSERT INTO "documents" ("application_id", "document_type", "file_name", "file_size", "file_type", "is_required", "status") VALUES
(1, 'Statuts de l''organisation', 'statuts_association.pdf', 850000, 'pdf', true, 'Soumis'),
(1, 'Plan d''affaires', 'business_plan_mauritanie.pdf', 1200000, 'pdf', true, 'Soumis'),
(1, 'Budget prévisionnel', 'budget_previsionnel.xlsx', 450000, 'xlsx', true, 'Soumis'),
(2, 'Registre de commerce', 'registre_commerce.pdf', 680000, 'pdf', true, 'Soumis'),
(2, 'Étude de faisabilité', 'etude_faisabilite.pdf', 920000, 'pdf', true, 'Soumis'),
(2, 'Cofinancement bancaire', 'cofinancement_banque.pdf', 340000, 'pdf', true, 'Soumis'),
(2, 'Relevé d''identité bancaire', 'rib_cooperative.pdf', 125000, 'pdf', true, 'Soumis'),
(3, 'Projet détaillé', 'projet_climat_jeunesse.pdf', 1100000, 'pdf', true, 'Soumis'),
(3, 'Identité du représentant légal', 'cni_aicha.pdf', 210000, 'pdf', true, 'Soumis');

-- =============================================
-- Fonctions utilitaires (optionnel)
-- =============================================

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_funding_opportunities_updated_at BEFORE UPDATE ON "funding_opportunities" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON "clients" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON "applications" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Instructions d'utilisation
-- =============================================

-- Pour exécuter ce script :
-- 1. Créer une base de données : CREATE DATABASE richat_funding_tracker;
-- 2. Se connecter à la base : \c richat_funding_tracker
-- 3. Exécuter ce script : \i database_schema.sql
-- 
-- Ou en une commande :
-- psql -U username -d richat_funding_tracker -f database_schema.sql

-- =============================================
-- Fin du script
-- =============================================