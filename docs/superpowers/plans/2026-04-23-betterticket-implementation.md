# BetterTicket Bot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Discord ticket bot with i18n support, Prisma/SQLite persistence, and a full ticket lifecycle (Open -> Closed -> Re-open -> Archive), fully containerized.

**Architecture:** Modular TypeScript structure with dedicated handlers for commands and interactions. Uses Discord's locale system for automatic translations.

**Tech Stack:** TypeScript, discord.js, Prisma, SQLite, Docker.

---

### Task 1: Project Initialization

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.env.example`

- [ ] **Step 1: Create package.json with dependencies**
```json
{
  "name": "betterticket",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "postinstall": "prisma generate"
  },
  "dependencies": {
    "@prisma/client": "^5.12.1",
    "discord.js": "^14.14.1",
    "dotenv": "^16.4.5"
  },
  "devDependencies": {
    "@types/node": "^20.12.7",
    "prisma": "^5.12.1",
    "ts-node": "^10.9.2",
    "typescript": "^5.4.5"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "CommonJS",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create .env.example**
```env
DISCORD_TOKEN=your_token_here
CLIENT_ID=your_client_id_here
DATABASE_URL="file:./dev.db"
```

- [ ] **Step 4: Install dependencies and commit**
Run: `npm install`
Run: `git add . && git commit -m "chore: initial project setup"`

---

### Task 2: Database Setup (Prisma)

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/db.ts`

- [ ] **Step 1: Define Prisma Schema**
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

- [ ] **Step 2: Generate Prisma Client and DB**
Run: `npx prisma migrate dev --name init`

- [ ] **Step 3: Create Database Client Utility**
```typescript
import { PrismaClient } from '@prisma/client';
export const db = new PrismaClient();
```

- [ ] **Step 4: Commit**
Run: `git add . && git commit -m "feat: setup prisma schema and client"`

---

### Task 3: Internationalization (i18n)

**Files:**
- Create: `src/locales/en.json`
- Create: `src/locales/fr.json`
- Create: `src/i18n.ts`

- [ ] **Step 1: Create English translations**
```json
{
  "TICKET_SETUP_TITLE": "Contact Support",
  "TICKET_SETUP_DESC": "Click the button below to open a ticket.",
  "OPEN_TICKET": "Open Ticket",
  "MODAL_TITLE": "Create Ticket",
  "MODAL_SUBJECT": "Subject",
  "MODAL_DESCRIPTION": "Describe your issue",
  "TICKET_OPENED": "Ticket opened! A staff member will be with you shortly.",
  "CLOSE_TICKET": "Close Ticket",
  "REOPEN_TICKET": "Re-open",
  "ARCHIVE_TICKET": "Archive",
  "STAFF_CONFIG_SUCCESS": "Staff role updated to <@&{roleId}>"
}
```

- [ ] **Step 2: Create French translations**
```json
{
  "TICKET_SETUP_TITLE": "Contacter le Support",
  "TICKET_SETUP_DESC": "Cliquez sur le bouton ci-dessous pour ouvrir un ticket.",
  "OPEN_TICKET": "Ouvrir un ticket",
  "MODAL_TITLE": "Créer un ticket",
  "MODAL_SUBJECT": "Sujet",
  "MODAL_DESCRIPTION": "Décrivez votre problème",
  "TICKET_OPENED": "Ticket ouvert ! Un membre du staff va vous répondre.",
  "CLOSE_TICKET": "Fermer le ticket",
  "REOPEN_TICKET": "Réouvrir",
  "ARCHIVE_TICKET": "Archiver",
  "STAFF_CONFIG_SUCCESS": "Rôle staff mis à jour : <@&{roleId}>"
}
```

- [ ] **Step 3: Create i18n Utility**
```typescript
import en from './locales/en.json';
import fr from './locales/fr.json';

const translations: any = { en, fr };

export function t(key: string, locale: string = 'en', vars: Record<string, string> = {}) {
  const lang = locale.startsWith('fr') ? 'fr' : 'en';
  let text = translations[lang][key] || translations['en'][key] || key;
  
  for (const [vKey, vValue] of Object.entries(vars)) {
    text = text.replace(`{${vKey}}`, vValue);
  }
  return text;
}
```

- [ ] **Step 4: Commit**
Run: `git add . && git commit -m "feat: add i18n support"`

---

### Task 4: Basic Bot Skeleton

**Files:**
- Create: `src/index.ts`

- [ ] **Step 1: Implement basic client and event listener**
```typescript
import { Client, GatewayIntentBits, Events } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
```

- [ ] **Step 2: Commit**
Run: `git add . && git commit -m "feat: basic bot bootstrap"`
