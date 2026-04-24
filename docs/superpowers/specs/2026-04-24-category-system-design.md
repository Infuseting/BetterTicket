# Specification: Multi-Category Ticket System

Implement a flexible ticket system where users choose a category from a dropdown menu, and each category has its own dedicated staff role.

## 1. Goal
Replace the global staff configuration with a category-based system. Each category defines its own name, emoji, and associated moderator role.

## 2. Structural Changes

### 2.1 Database (Prisma)
- **New Model `Category`**:
    - `id`: String (UUID)
    - `name`: String
    - `emoji`: String
    - `roleId`: String (Staff role for this category)
    - `guildId`: String
- **Update `Ticket`**:
    - Add `categoryId` (String, optional) to track which category created the ticket.
- **Remove `StaffRole`**: This model is deprecated in favor of category-specific roles.

### 2.2 Core Extensions
- **`BaseHandler.ts`**: Add `SelectMenuHandler` interface.
- **`InteractionManager.ts`**: Add support for dynamic loading and routing of `StringSelectMenuInteraction`.

### 2.3 Command: `/config-category`
A new command to manage categories:
- `add [name] [emoji] [role]`: Creates a new category.
- `remove [name]`: Deletes a category.
- `list`: Displays all configured categories for the guild.

### 2.4 Interaction Flow
1. **Button "Open Ticket"**: Instead of showing a modal, it fetches all categories from the DB and sends a Select Menu interaction.
2. **Category Selection**: The user selects a category.
3. **Ticket Creation**: The bot immediately creates the ticket channel.
    - **Permissions**: Only the User and the Role assigned to that specific category can see the channel.
    - **Welcome Message**: Pings the specific staff role.

## 3. Implementation Strategy

1. **Database Migration**: Update schema and run `prisma migrate dev`.
2. **Select Menu Support**: Extend `BaseHandler` and `InteractionManager`.
3. **Configuration Command**: Implement `/config-category`.
4. **Refactor `OpenTicket`**: Change from Modal trigger to Select Menu trigger.
5. **New `CategorySelect` Handler**: Process the selection and call `TicketService`.
6. **Update `TicketService`**: Adapt permissions and logic for category-based creation.

## 4. Success Criteria
- Admins can add/remove categories with specific roles.
- Users see a localized select menu when opening a ticket.
- Tickets are created with correct permissions (User + Category-specific Role).
- Global `StaffRole` logic is completely removed.
