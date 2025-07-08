# Mauritanie Funding Tracker

## Overview

This is a full-stack web application for tracking funding opportunities in Mauritania. The application is built with React frontend and Express backend, featuring a PostgreSQL database for data persistence. It allows users to browse, filter, and manage funding opportunities with detailed information about grants, subsidies, and other financial support programs.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with custom styling
- **Styling**: Tailwind CSS with custom design system
- **Form Management**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom configuration

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Driver**: Neon serverless PostgreSQL
- **API Design**: RESTful endpoints for CRUD operations
- **Validation**: Zod schemas for request/response validation
- **Session Management**: Express sessions with PostgreSQL store

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Database Provider**: Neon serverless PostgreSQL
- **Schema Management**: Drizzle Kit for migrations
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### Database Schema
The application uses two main entities:
- **Users**: Basic user management with username/password authentication
- **Funding Opportunities**: Core entity containing funding details including title, program, description, eligibility criteria, amounts, deadlines, and sectors

### API Endpoints
- `GET /api/funding-opportunities` - Retrieve funding opportunities with filtering
- `GET /api/funding-opportunities/:id` - Get specific funding opportunity
- `POST /api/funding-opportunities` - Create new funding opportunity
- `PUT /api/funding-opportunities/:id` - Update funding opportunity
- `DELETE /api/funding-opportunities/:id` - Delete funding opportunity
- `GET /api/funding-statistics` - Get dashboard statistics

### Frontend Pages
- **Dashboard**: Main page with statistics and filtered funding opportunities
- **Add Funding**: Form for creating new funding opportunities
- **Funding Detail**: Detailed view of individual funding opportunities
- **Not Found**: 404 error page

### UI Components
- **FundingCard**: Display funding opportunities in card format
- **FundingFilters**: Filter interface for searching opportunities
- **StatisticsCards**: Dashboard statistics display
- **Navigation**: Application navigation bar

## Data Flow

1. **Client Requests**: React components make API calls using TanStack Query
2. **API Layer**: Express routes handle requests and validate data with Zod
3. **Business Logic**: Storage layer processes business logic and database operations
4. **Database**: Drizzle ORM executes queries against PostgreSQL
5. **Response**: Data flows back through the same layers to the client

### Filtering and Search
The application supports filtering by:
- Sector (multiple sectors per opportunity)
- Funding type (Don, Subvention, Prêt, Mixte)
- Amount range (min/max)
- Status (Ouvert, À venir, Fermé)
- Deadline dates

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React, React DOM, React Hook Form, TanStack Query
- **UI Libraries**: Radix UI components, Tailwind CSS, Lucide icons
- **Backend**: Express.js, Drizzle ORM, Neon PostgreSQL
- **Validation**: Zod for schema validation
- **Date Handling**: date-fns for date manipulation

### Development Dependencies
- **Build Tools**: Vite, esbuild, TypeScript
- **Development**: tsx for TypeScript execution
- **Replit Integration**: Replit-specific plugins and tools

## Deployment Strategy

### Production Build
- **Frontend**: Built with Vite, outputs to `dist/public`
- **Backend**: Bundled with esbuild, outputs to `dist`
- **Database**: Migrations handled by Drizzle Kit

### Environment Configuration
- **Database**: Requires `DATABASE_URL` environment variable
- **Development**: Uses Vite dev server with HMR
- **Production**: Serves static files from Express

### Scripts
- `dev`: Development server with hot reload
- `build`: Production build for both frontend and backend
- `start`: Production server
- `db:push`: Push database schema changes

## Changelog

- July 08, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.