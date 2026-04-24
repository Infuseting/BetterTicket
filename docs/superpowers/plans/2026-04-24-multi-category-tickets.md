# Multi-Category Ticket System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a category-based ticketing system where users select a category from a dropdown, and each category has its own moderator role.

**Architecture:** Update the database to support categories. Extend core interaction handling to support select menus. Refactor the ticket creation flow to use categories for permissions and welcome messages.

**Tech Stack:** TypeScript, discord.js, Prisma, SQLite

---

### Task 1: Database Migration

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Update Prisma Schema**
Add `Category` model and update `Ticket` model. Remove `StaffRole`.

```prisma
model Category {
  id      String   @id @default(uuid())
  name    String
  emoji   String
  roleId  String
  guildId String
  tickets Ticket[]
}

model Ticket {
  id          String    @id @default(uuid())
  channelId   String    @unique
  authorId    String
  guildId     String
  subject     String
  description String
  status      String    @default("OPEN")
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  locale      String    @default("en")
  categoryId  String?
  category    Category? @relation(fields: [categoryId], references: [id])
}

// Remove StaffRole model
```

- [ ] **Step 2: Run Prisma Migration**
Run: `npx prisma migrate dev --name add_categories`

- [ ] **Step 3: Commit**
```bash
git add prisma/schema.prisma
git commit -m "db: add Category model and link it to Ticket"
```

---

### Task 4: Command `/config-category`

**Files:**
- Create: `src/commands/config-category.ts`
- Modify: `src/locales/en.json`, `src/locales/fr.json`
- Delete: `src/commands/config.ts`

- [ ] **Step 1: Add Locales**
Add strings for category management.

- [ ] **Step 2: Implement `/config-category`**
Create the command with `add`, `remove`, and `list` subcommands.

- [ ] **Step 3: Remove old config**
Delete `src/commands/config.ts`.

- [ ] **Step 4: Commit**
```bash
git add src/commands/config-category.ts src/locales/*.json
git rm src/commands/config.ts
git commit -m "feat: add /config-category command and remove deprecated config"
```

---

### Task 2: Core Select Menu Support

**Files:**
- Modify: `src/core/BaseHandler.ts`
- Modify: `src/core/InteractionManager.ts`

- [ ] **Step 1: Update `BaseHandler.ts`**
Add `SelectMenuHandler`.

```typescript
import { StringSelectMenuInteraction } from 'discord.js';
// ...
export interface SelectMenuHandler {
  customId: string;
  execute(interaction: StringSelectMenuInteraction): Promise<void>;
}
```

- [ ] **Step 2: Update `InteractionManager.ts`**
Add collection and routing for select menus.

```typescript
// ...
private selects = new Collection<string, SelectMenuHandler>();
// ...
await this.loadHandlers('../interactions/selects', this.selects, 'customId');
// ...
async handleSelect(interaction: StringSelectMenuInteraction) {
  const handler = this.selects.get(interaction.customId);
  if (handler) await handler.execute(interaction);
}
```

- [ ] **Step 3: Update `src/index.ts`**
Add `isStringSelectMenu()` check.

- [ ] **Step 4: Commit**
```bash
git add src/core/BaseHandler.ts src/core/InteractionManager.ts src/index.ts
git commit -m "refactor: add core support for select menu interactions"
```

---

### Task 3: Refactor Ticket Creation Flow

**Files:**
- Modify: `src/services/TicketService.ts`
- Modify: `src/interactions/buttons/OpenTicket.ts`
- Create: `src/interactions/selects/CategorySelect.ts`

- [ ] **Step 1: Update `TicketService.ts`**
Modify `createTicket` to accept `categoryId` and use category permissions.

- [ ] **Step 2: Refactor `OpenTicket.ts`**
Change it to fetch categories and send a select menu instead of a modal.

- [ ] **Step 3: Create `CategorySelect.ts`**
Handle the selection and call `TicketService.createTicket`.

- [ ] **Step 4: Commit**
```bash
git add src/services/TicketService.ts src/interactions/buttons/OpenTicket.ts src/interactions/selects/CategorySelect.ts
git commit -m "feat: implement category-based ticket creation flow"
```

---

### Task 5: Final Verification

- [ ] **Step 1: Run Build and Tests**
Run: `npm run build && npm test`
Expected: PASS

- [ ] **Step 2: Deploy Commands**
Run: `npx ts-node src/deploy-commands.ts`
Expected: SUCCESS

- [ ] **Step 3: Commit**
```bash
git commit --allow-empty -m "chore: finalize multi-category ticket system"
```
