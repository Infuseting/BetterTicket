# Specification: Unified SOLID Architecture Refactor

Refactor the bot's interaction handling to eliminate manual routing (if/else), improve performance, and strictly follow SOLID principles.

## 1. Goal
Centralize all interaction routing (Commands, Buttons, Modals) into a dynamic manager to ensure O(1) lookup speed and high maintainability.

## 2. Structural Changes

### 2.1 Core Handlers (`src/core/BaseHandler.ts`)
Standardize all interaction interfaces:
- `CommandHandler`: Requires `data: SlashCommandBuilder` and `execute(interaction: ChatInputCommandInteraction)`.
- `ButtonHandler`: Requires `customId: string` and `execute(interaction: ButtonInteraction)`.
- `ModalHandler`: Requires `customId: string` and `execute(interaction: ModalSubmitInteraction)`.

### 2.2 Dynamic Command Loading
- Migrate all commands in `src/commands/` from exported functions to default exported classes.
- Update `InteractionManager.ts` to automatically discover and load files in `src/commands/`.

### 2.3 Unified Routing (`src/index.ts`)
- Remove all `if/else` logic for command routing.
- Delegate all `InteractionCreate` events directly to the `InteractionManager`.

### 2.4 Automated Deployment (`src/deploy-commands.ts`)
- Refactor the deployment script to dynamically load command data from the `src/commands/` directory instead of manual imports.

## 3. Implementation Strategy

1. **Interfaces**: Update `BaseHandler.ts` with the new `CommandHandler` interface.
2. **Command Migration**: Refactor existing commands into classes.
3. **Manager Upgrade**: Enhance `InteractionManager` to support commands and provide a `getCommandData()` method for deployment.
4. **Integration**: Clean up `index.ts` and `deploy-commands.ts`.

## 4. Success Criteria
- The bot starts and loads all handlers (Commands, Buttons, Modals) dynamically.
- Slash commands work correctly without any manual checks in `index.ts`.
- `deploy-commands.ts` successfully registers all commands found in the folder.
- Performance: Interaction lookup is O(1) through `Map` collections.
