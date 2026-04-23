# Database Setup (Prisma) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Setup Prisma ORM with SQLite and create a database client utility.

**Architecture:** Prisma will manage the schema and migrations. A singleton instance of `PrismaClient` will be provided in `src/db.ts` for use throughout the application.

**Tech Stack:** Prisma, SQLite, TypeScript.

---

### Task 1: Environment and Schema Setup

**Files:**
- Create: `.env`
- Create: `prisma/schema.prisma`

- [ ] **Step 1: Create .env file**
Create `.env` from `.env.example` if it doesn't exist.
```bash
cp .env.example .env
```

- [ ] **Step 2: Define Prisma Schema**
Create `prisma/schema.prisma` with the following content:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model GuildConfig {
  guildId      String @id
  staffRoleId  String?
}

model Ticket {
  id          Int      @id @default(autoincrement())
  channelId   String   @unique
  authorId    String
  guildId     String
  subject     String
  description String
  status      String   // OPEN, CLOSED
  locale      String
  createdAt   DateTime @default(now())
}
```

- [ ] **Step 3: Commit initial files**
```bash
git add .env.example .gitignore prisma/schema.prisma
git commit -m "chore: add prisma schema"
```

### Task 2: Database Migration and Client

**Files:**
- Create: `src/db.ts`
- Generate: `prisma/dev.db` (via migration)

- [ ] **Step 1: Run Prisma Migration**
Run the migration to create the database and generate the Prisma client.
Run: `npx prisma migrate dev --name init`
Expected: Success message and creation of `prisma/migrations` and `prisma/dev.db`.

- [ ] **Step 2: Create Database Client Utility**
Create `src/db.ts`:
```typescript
import { PrismaClient } from '@prisma/client';
export const db = new PrismaClient();
```

- [ ] **Step 3: Verify Client Generation**
Check if `@prisma/client` is accessible (no ts errors in `src/db.ts`).

- [ ] **Step 4: Commit and Finish**
```bash
git add prisma/migrations src/db.ts
git commit -m "feat: setup prisma client and run initial migration"
```
