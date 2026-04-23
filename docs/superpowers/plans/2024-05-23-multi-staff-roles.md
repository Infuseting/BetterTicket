# Multi-Staff Roles Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow servers to configure multiple staff roles that will have access to tickets.

**Architecture:** 
1. Update Prisma schema to move staff roles to a separate table.
2. Update `/config-staff` command to support adding, removing, and listing roles.
3. Update ticket creation logic to fetch all staff roles and apply permission overwrites for each.

**Tech Stack:** TypeScript, Discord.js, Prisma (SQLite)

---

### Task 1: Prisma Schema Update

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Update schema.prisma**

```prisma
model GuildConfig {
  guildId      String @id
}

model StaffRole {
  id      Int    @id @default(autoincrement())
  guildId String
  roleId  String

  @@unique([guildId, roleId])
}
```

- [ ] **Step 2: Run Prisma migration**

Run: `npx prisma migrate dev --name add_multi_staff_roles`
Expected: Migration successful and `node_modules/.prisma/client` updated.

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: update prisma schema for multi-staff roles"
```

### Task 2: Translations Update

**Files:**
- Modify: `src/locales/en.json`
- Modify: `src/locales/fr.json`

- [ ] **Step 1: Update en.json**

Add these keys:
```json
  "config_staff_add_success": "Staff role {roleName} added.",
  "config_staff_remove_success": "Staff role {roleName} removed.",
  "config_staff_list_title": "Staff Roles",
  "config_staff_list_empty": "No staff roles configured.",
  "config_staff_already_exists": "Role {roleName} is already a staff role.",
  "config_staff_not_found": "Role {roleName} is not a staff role."
```

- [ ] **Step 2: Update fr.json**

Add these keys:
```json
  "config_staff_add_success": "Rôle du personnel {roleName} ajouté.",
  "config_staff_remove_success": "Rôle du personnel {roleName} supprimé.",
  "config_staff_list_title": "Rôles du personnel",
  "config_staff_list_empty": "Aucun rôle du personnel configuré.",
  "config_staff_already_exists": "Le rôle {roleName} est déjà un rôle du personnel.",
  "config_staff_not_found": "Le rôle {roleName} n'est pas un rôle du personnel."
```

- [ ] **Step 3: Commit**

```bash
git add src/locales/en.json src/locales/fr.json
git commit -m "feat: add translations for multi-staff roles"
```

### Task 3: Command Update

**Files:**
- Modify: `src/commands/config.ts`

- [ ] **Step 1: Update SlashCommandBuilder and execute function**

```typescript
import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { db } from '../db';
import { t } from '../i18n';

export const data = new SlashCommandBuilder()
	.setName('config-staff')
	.setDescription(t('config_staff_description', 'en'))
	.addSubcommand(subcommand =>
		subcommand.setName('add')
			.setDescription('Add a staff role')
			.addRoleOption(option => option.setName('role').setDescription('The role to add').setRequired(true)))
	.addSubcommand(subcommand =>
		subcommand.setName('remove')
			.setDescription('Remove a staff role')
			.addRoleOption(option => option.setName('role').setDescription('The role to remove').setRequired(true)))
	.addSubcommand(subcommand =>
		subcommand.setName('list')
			.setDescription('List all staff roles'))
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function execute(interaction: ChatInputCommandInteraction) {
	const subcommand = interaction.options.getSubcommand();
	const guildId = interaction.guildId;
	const locale = interaction.locale || 'en';

	if (!guildId) {
		await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
		return;
	}

	if (subcommand === 'add') {
		const role = interaction.options.getRole('role', true);
		
		const existing = await db.staffRole.findFirst({
			where: { guildId, roleId: role.id }
		});

		if (existing) {
			await interaction.reply({ 
				content: t('config_staff_already_exists', locale, { roleName: role.name }), 
				ephemeral: true 
			});
			return;
		}

		await db.staffRole.create({
			data: { guildId, roleId: role.id }
		});

		await interaction.reply({ 
			content: t('config_staff_add_success', locale, { roleName: role.name }), 
			ephemeral: true 
		});
	} else if (subcommand === 'remove') {
		const role = interaction.options.getRole('role', true);

		const existing = await db.staffRole.findFirst({
			where: { guildId, roleId: role.id }
		});

		if (!existing) {
			await interaction.reply({ 
				content: t('config_staff_not_found', locale, { roleName: role.name }), 
				ephemeral: true 
			});
			return;
		}

		await db.staffRole.delete({
			where: { id: existing.id }
		});

		await interaction.reply({ 
			content: t('config_staff_remove_success', locale, { roleName: role.name }), 
			ephemeral: true 
		});
	} else if (subcommand === 'list') {
		const roles = await db.staffRole.findMany({
			where: { guildId }
		});

		if (roles.length === 0) {
			await interaction.reply({ 
				content: t('config_staff_list_empty', locale), 
				ephemeral: true 
			});
			return;
		}

		const roleList = roles.map(r => `<@&${r.roleId}>`).join('\n');
		await interaction.reply({ 
			content: `**${t('config_staff_list_title', locale)}**\n${roleList}`, 
			ephemeral: true 
		});
	}
}
```

- [ ] **Step 2: Commit**

```bash
git add src/commands/config.ts
git commit -m "feat: update /config-staff with subcommands"
```

### Task 4: Bot Logic Update

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Update ticket opening logic in interaction.isModalSubmit()**

Replace the current staff role fetching and permission logic.

```typescript
        // Get staff roles from DB
        const staffRoles = await db.staffRole.findMany({
          where: { guildId: guild.id }
        });

        // Permissions
        const permissionOverwrites: any[] = [
          {
            id: guild.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: interaction.user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
          }
        ];

        staffRoles.forEach(role => {
          permissionOverwrites.push({
            id: role.roleId,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
          });
        });

        // Create channel
        const channel = await guild.channels.create({
          name: `ticket-${interaction.user.username}`,
          type: ChannelType.GuildText,
          permissionOverwrites
        });

        // ... (save to DB)

        // Send Welcome Message
        // ... (embed creation)

        const staffMentions = staffRoles.map(r => `<@&${r.roleId}>`).join(' ');

        await channel.send({
          content: `<@${interaction.user.id}> ${staffMentions}`,
          embeds: [welcomeEmbed],
          components: [row]
        });
```

- [ ] **Step 2: Commit**

```bash
git add src/index.ts
git commit -m "feat: support multiple staff roles in ticket creation"
```

### Task 5: Final Validation

- [ ] **Step 1: Build the project**

Run: `npm run build`
Expected: Build successful.

- [ ] **Step 2: Verify commands registration**

Run: `npm run deploy`
Expected: Commands deployed successfully.
