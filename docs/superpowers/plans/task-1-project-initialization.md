# Task 1: Project Initialization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Initialize the BetterTicket bot project with essential configuration files and dependencies.

**Architecture:** Node.js environment using TypeScript for type safety, Prisma for database ORM, and Discord.js for bot interaction.

**Tech Stack:** Node.js, TypeScript, npm, Prisma, Discord.js, dotenv.

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

- [ ] **Step 4: Install dependencies**

Run: `npm install`
Expected: `node_modules` and `package-lock.json` created, `prisma generate` runs (might fail if no schema exists yet, but that's okay for now).

- [ ] **Step 5: Verify setup**

Run: `ls -l package.json tsconfig.json .env.example node_modules`

- [ ] **Step 6: Initial commit**

Run: `git add . && git commit -m "chore: initial project setup"`
