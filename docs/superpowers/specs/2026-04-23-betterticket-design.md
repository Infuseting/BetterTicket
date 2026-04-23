# Design Spec: BetterTicket Bot

**Date:** 2026-04-23
**Status:** Draft
**Author:** Gemini CLI

## 1. Goal
Build a robust, scalable Discord Ticket Bot with internationalization (FR/EN), Docker support, and a complete ticket lifecycle management system.

## 2. Core Features
- **Admin Configuration**: Slash command to set the Staff role ID.
- **Ticket Setup**: Slash command to send the entry point (Embed + Button).
- **Internationalization (i18n)**: Automatic translation of UI (Modals, Buttons, Messages) based on the user's Discord locale (French/English support).
- **Ticket Lifecycle**:
    - **Open**: User fills a modal (Subject, Description). Private channel created.
    - **Closed**: User access revoked. Staff can review.
    - **Re-open**: Restore user access.
    - **Archive**: Final deletion of the channel.
- **Database**: Prisma with SQLite for persistence.
- **Deployment**: Dockerized application with GitHub Actions for automated CI/CD to GHCR.

## 3. Technical Stack
- **Language**: TypeScript
- **Library**: discord.js (v14+)
- **ORM**: Prisma
- **Database**: SQLite (local file, easy for Docker volumes)
- **Container**: Docker + GitHub Actions (CI)

## 4. Data Model (Prisma)
```prisma
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
  locale      String   // fr, en
  createdAt   DateTime @default(now())
}
```

## 5. User Flows

### 5.1 Opening a Ticket
1. User clicks **"Open Ticket"** button.
2. Bot detects locale (e.g., `fr`).
3. Bot shows Modal with fields:
    - **Subject** (Short text)
    - **Description** (Paragraph)
4. Bot creates a private channel `ticket-xxxx`.
5. Permissions: `@everyone` (None), `Author` (Read/Write), `StaffRole` (Read/Write).

### 5.2 Closing/Archiving
1. User or Staff clicks **"Close"**.
2. Bot removes `Author` from channel permissions.
3. Bot sends message in channel with **"Re-open"** and **"Archive"** buttons.
4. Staff clicks **"Archive"** -> Channel is deleted, Ticket updated in DB.

## 6. Implementation Plan (High-Level)
1. Initialize Node.js project with TypeScript and Prisma.
2. Setup Discord Bot client and Interaction handlers.
3. Implement i18n system.
4. Create Slash Commands (`/config-staff`, `/ticket-setup`).
5. Build Ticket logic (Buttons, Modals, Permissions).
6. Create Dockerfile and GitHub Action workflow.

## 7. Success Criteria
- Bot responds in the correct language.
- Staff role can be configured and persists after restart.
- Tickets follow the full lifecycle correctly.
- Docker image builds and runs successfully.
