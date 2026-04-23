# BetterTicket Fix & Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the `CommandInteractionOptionNotFound` error and ensure the bot is running the latest code without deprecation warnings.

**Architecture:** We will verify the command structure, ensure all strings are correctly handled, and force a rebuild/re-deployment of the bot.

**Tech Stack:** TypeScript, discord.js, Docker.

---

### Task 1: Code Verification & Clean Build

**Files:**
- Modify: `src/commands/config.ts`
- Modify: `src/index.ts`

- [ ] **Step 1: Verify src/commands/config.ts content**
- [ ] **Step 2: Run a clean build**
- [ ] **Step 3: Deploy commands globally again**
- [ ] **Step 4: Commit any final tweaks**

---

### Task 2: Docker Update & Restart

- [ ] **Step 1: Rebuild the Docker image**
- [ ] **Step 2: Restart the container**
- [ ] **Step 3: Verification**
