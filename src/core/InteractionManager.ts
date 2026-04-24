import { ButtonInteraction, ModalSubmitInteraction, ChatInputCommandInteraction, Collection, StringSelectMenuInteraction } from 'discord.js';
import { ButtonHandler, ModalHandler, CommandHandler, SelectMenuHandler } from './BaseHandler';
import path from 'path';
import fs from 'fs';

export class InteractionManager {
  private buttons = new Collection<string, ButtonHandler>();
  private modals = new Collection<string, ModalHandler>();
  private commands = new Collection<string, CommandHandler>();
  private selects = new Collection<string, SelectMenuHandler>();

  async loadInteractions() {
    await this.loadHandlers('../interactions/buttons', this.buttons, 'customId');
    await this.loadHandlers('../interactions/modals', this.modals, 'customId');
    await this.loadHandlers('../interactions/selects', this.selects, 'customId');
    await this.loadHandlers('../commands', this.commands, 'name', true);
  }

  private async loadHandlers(relativePath: string, collection: Collection<string, any>, keyProp: string, isCommand = false) {
    const fullPath = path.join(__dirname, relativePath);
    if (!fs.existsSync(fullPath)) return;

    const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.ts') || f.endsWith('.js'));
    for (const file of files) {
      const handlerClass = (await import(path.join(fullPath, file))).default;
      if (handlerClass) {
        const handler = new handlerClass();
        const key = isCommand ? (handler.data as any).name : handler[keyProp];
        collection.set(key, handler);
        console.log(`Loaded handler: ${key}`);
      }
    }
  }

  async handleButton(interaction: ButtonInteraction) {
    const handler = this.buttons.get(interaction.customId);
    if (handler) await handler.execute(interaction);
  }

  async handleModal(interaction: ModalSubmitInteraction) {
    const handler = this.modals.get(interaction.customId);
    if (handler) await handler.execute(interaction);
  }

  async handleCommand(interaction: ChatInputCommandInteraction) {
    const handler = this.commands.get(interaction.commandName);
    if (handler) await handler.execute(interaction);
  }

  async handleSelect(interaction: StringSelectMenuInteraction) {
    const handler = this.selects.get(interaction.customId);
    if (handler) await handler.execute(interaction);
  }

  getCommandData() {
    return this.commands.map(cmd => cmd.data.toJSON());
  }
}

export const interactionManager = new InteractionManager();
