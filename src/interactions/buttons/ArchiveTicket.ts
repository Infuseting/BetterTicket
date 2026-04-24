import { ButtonInteraction, TextChannel, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { ButtonHandler } from '../../core/BaseHandler';
import { ticketService } from '../../services/TicketService';
import { transcriptService } from '../../services/TranscriptService';
import { t } from '../../i18n';

export default class ArchiveTicket implements ButtonHandler {
  customId = 'archive_ticket';

  async execute(interaction: ButtonInteraction) {
    const channel = interaction.channel as TextChannel;
    const locale = interaction.locale;
    await interaction.reply({ content: t('ticket_archiving', locale) });

    try {
      const ticket = await ticketService.getTicketByChannel(channel.id);
      if (ticket) {
        const { buffer, participantIds } = await transcriptService.generate(channel, locale);
        const attachment = new AttachmentBuilder(buffer, { name: `transcript-${channel.name}.html` });

        const participants = Array.from(participantIds).map(id => `<@${id}>`).join(', ');
        const author = await interaction.client.users.fetch(ticket.authorId);

        const transcriptEmbed = new EmbedBuilder()
          .setTitle(`${author.tag} (${author.id})`)
          .addFields(
            { name: t('ticket_owner', locale), value: `<@${author.id}>`, inline: true },
            { name: t('ticket_name', locale), value: `🟢 ${channel.name}`, inline: true },
            { name: t('ticket_channel', locale), value: `<#${channel.id}>`, inline: true },
            { name: t('ticket_panel', locale), value: 'Support', inline: true },
            { name: t('ticket_transcript_direct', locale), value: t('ticket_transcript_attached', locale), inline: true },
            { name: t('ticket_transcript_users', locale), value: participants || t('ticket_none', locale) }
          )
          .setColor(0x2F3136);

        try {
          await author.send({
            embeds: [transcriptEmbed],
            files: [attachment]
          });
          await interaction.followUp({ content: t('ticket_transcript_sent_dm', locale, { user: author.tag }), ephemeral: true });
        } catch (error) {
          console.error(`Could not send transcript DM to ${author.tag}:`, error);
          await interaction.followUp({ content: t('ticket_transcript_dm_failed', locale, { user: author.tag }), ephemeral: true });
        }
      }
    } catch (error) {
      console.error('Error during transcript generation/sending:', error);
    }

    await ticketService.archiveTicket(channel);
  }
}
