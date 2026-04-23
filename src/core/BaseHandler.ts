import { ButtonInteraction, ModalSubmitInteraction } from 'discord.js';

export interface InteractionHandler {
  customId: string;
  execute(interaction: ButtonInteraction | ModalSubmitInteraction): Promise<void>;
}

export interface ButtonHandler extends InteractionHandler {
  execute(interaction: ButtonInteraction): Promise<void>;
}

export interface ModalHandler extends InteractionHandler {
  execute(interaction: ModalSubmitInteraction): Promise<void>;
}
