# Ticket Transcripts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate a visual HTML transcript when a ticket is archived and send it via DM to the ticket owner.

**Architecture:** Create a `TranscriptService` to handle fetching messages and rendering them into a Tailwind-styled HTML document. Update the `ArchiveTicket` interaction to trigger this process before deleting the channel.

**Tech Stack:** discord.js, Prisma, Tailwind CSS (CDN).

---

### Task 1: TranscriptService Base Implementation

**Files:**
- Create: `src/services/TranscriptService.ts`
- Create: `src/services/__tests__/TranscriptService.spec.ts`

- [ ] **Step 1: Create the TranscriptService class**
Implement a basic service that can fetch messages from a channel and generate a minimal HTML.

- [ ] **Step 2: Add basic test**
Verify that the service fetches messages and returns a buffer.

- [ ] **Step 3: Run tests**
Run: `npm test src/services/__tests__/TranscriptService.spec.ts`
Expected: PASS

- [ ] **Step 4: Commit**
```bash
git add src/services/TranscriptService.ts src/services/__tests__/TranscriptService.spec.ts
git commit -m "feat: basic transcript service implementation"
```

---

### Task 2: Advanced HTML Rendering (Mentions & Styles)

**Files:**
- Modify: `src/services/TranscriptService.ts`

- [ ] **Step 1: Implement mention parsing**
Update the service to replace raw mentions (`<@ID>`, `<@&ID>`, `<#ID>`) with styled spans.

- [ ] **Step 2: Add image support**
Render attachments in the HTML if they are images, or provide a link otherwise.

- [ ] **Step 3: Update main generate method**
Combine everything into a polished Discord-like template using Tailwind CSS.

- [ ] **Step 4: Commit**
```bash
git add src/services/TranscriptService.ts
git commit -m "feat: add mention parsing and images to transcript"
```

---

### Task 3: Trigger Transcript on Archive

**Files:**
- Modify: `src/interactions/buttons/ArchiveTicket.ts`

- [ ] **Step 1: Update ArchiveTicket to fetch ticket author and generate transcript**
Modify the `execute` method to generate the transcript, build the Embed (matching the reference image), and send the DM before deleting the channel.

- [ ] **Step 2: Manual testing**
Verify the full flow: Create ticket -> Messages -> Archive -> DM received -> HTML correct.

- [ ] **Step 3: Commit**
```bash
git add src/interactions/buttons/ArchiveTicket.ts
git commit -m "feat: send transcript via DM on archive"
```
