import { ButtonInteraction, ChatInputCommandInteraction, ModalSubmitInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder, StringSelectMenuInteraction } from 'discord.js';

export interface CommandHandler {
  data: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

export interface ButtonHandler {
  customId: string;
  execute(interaction: ButtonInteraction): Promise<void>;
}

export interface ModalHandler {
  customId: string;
  execute(interaction: ModalSubmitInteraction): Promise<void>;
}

export interface SelectMenuHandler {
  customId: string;
  execute(interaction: StringSelectMenuInteraction): Promise<void>;
}
