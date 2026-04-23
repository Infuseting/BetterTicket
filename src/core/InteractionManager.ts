import { ButtonInteraction, ModalSubmitInteraction, Collection } from 'discord.js';
import { ButtonHandler, ModalHandler } from './BaseHandler';
import path from 'path';
import fs from 'fs';

export class InteractionManager {
  private buttons = new Collection<string, ButtonHandler>();
  private modals = new Collection<string, ModalHandler>();

  async loadInteractions() {
    const buttonPath = path.join(__dirname, '../interactions/buttons');
    const modalPath = path.join(__dirname, '../interactions/modals');

    if (fs.existsSync(buttonPath)) {
      const files = fs.readdirSync(buttonPath).filter(f => f.endsWith('.ts') || f.endsWith('.js'));
      for (const file of files) {
        const handlerClass = (await import(path.join(buttonPath, file))).default;
        if (handlerClass) {
          const handler = new handlerClass();
          this.buttons.set(handler.customId, handler);
          console.log(`Loaded button handler: ${handler.customId}`);
        }
      }
    }

    if (fs.existsSync(modalPath)) {
      const files = fs.readdirSync(modalPath).filter(f => f.endsWith('.ts') || f.endsWith('.js'));
      for (const file of files) {
        const handlerClass = (await import(path.join(modalPath, file))).default;
        if (handlerClass) {
          const handler = new handlerClass();
          this.modals.set(handler.customId, handler);
          console.log(`Loaded modal handler: ${handler.customId}`);
        }
      }
    }
  }

  async handleButton(interaction: ButtonInteraction) {
    const handler = this.buttons.get(interaction.customId);
    if (handler) {
      await handler.execute(interaction);
    }
  }

  async handleModal(interaction: ModalSubmitInteraction) {
    const handler = this.modals.get(interaction.customId);
    if (handler) {
      await handler.execute(interaction);
    }
  }
}

export const interactionManager = new InteractionManager();
