import { TextChannel, Message, Collection } from 'discord.js';

export class TranscriptService {
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private parseMentions(content: string): string {
    // User mentions: <@ID> or <@!ID>
    content = content.replace(/&lt;@!?(\d+)&gt;/g, '<span class="mention text-[#5865F2] bg-[#5865F2]/10 px-1 rounded cursor-pointer hover:bg-[#5865F2] hover:text-white transition-colors">@$1</span>');
    // Role mentions: <@&ID>
    content = content.replace(/&lt;@&amp;(\d+)&gt;/g, '<span class="mention text-[#43B581] bg-[#43B581]/10 px-1 rounded cursor-pointer hover:bg-[#43B581] hover:text-white transition-colors">@$1</span>');
    // Channel mentions: <#ID>
    content = content.replace(/&lt;#(\d+)&gt;/g, '<span class="mention text-[#5865F2] bg-[#5865F2]/10 px-1 rounded cursor-pointer hover:bg-[#5865F2] hover:text-white transition-colors font-medium">#$1</span>');
    return content;
  }

  async generate(channel: TextChannel): Promise<Buffer> {
    const allMessages: Message[] = [];
    let lastId: string | undefined;

    while (true) {
      const options: any = { limit: 100 };
      if (lastId) options.before = lastId;

      const messages: Collection<string, Message> = await channel.messages.fetch(options);
      if (messages.size === 0) break;

      allMessages.push(...Array.from(messages.values()));
      lastId = messages.last()?.id;

      if (messages.size < 100) break;
    }

    const sortedMessages = allMessages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Transcript - ${this.escapeHtml(channel.name)}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background-color: #313338; color: #DBDEE1; }
        .mention { font-weight: 500; }
    </style>
</head>
<body class="font-sans antialiased">
    <div class="max-w-4xl mx-auto p-4 md:p-8">
        <div class="border-b border-[#41434a] pb-6 mb-8">
            <h1 class="text-3xl font-bold text-white mb-2">Transcript for #${this.escapeHtml(channel.name)}</h1>
            <p class="text-[#949BA4]">Generated on ${new Date().toLocaleString()}</p>
        </div>

        <div id="messages" class="space-y-4">
`;

    for (const msg of sortedMessages) {
      const escapedContent = this.escapeHtml(msg.content);
      const parsedContent = this.parseMentions(escapedContent);
      
      let attachmentsHtml = '';
      if (msg.attachments.size > 0) {
        attachmentsHtml = '<div class="mt-2 flex flex-wrap gap-2">';
        for (const attachment of msg.attachments.values()) {
          if (attachment.contentType?.startsWith('image/')) {
            attachmentsHtml += `
              <div class="rounded-lg overflow-hidden border border-[#41434a] max-w-sm">
                <img src="${attachment.url}" alt="Attachment" class="max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity">
              </div>`;
          } else {
            attachmentsHtml += `
              <a href="${attachment.url}" target="_blank" class="flex items-center gap-2 bg-[#2b2d31] border border-[#41434a] p-3 rounded-lg hover:bg-[#35373c] transition-colors text-sm text-[#00A8FC]">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172-2.172a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 115.656-5.656L10 8.828l1.414 1.414-1.414 1.414z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                ${this.escapeHtml(attachment.name || 'Download Attachment')}
              </a>`;
          }
        }
        attachmentsHtml += '</div>';
      }

      html += `
        <div class="flex flex-col group py-1">
            <div class="flex items-baseline gap-2">
                <span class="font-semibold text-white hover:underline cursor-pointer">${this.escapeHtml(msg.author.tag)}</span>
                <span class="text-xs text-[#949BA4]">${msg.createdAt.toLocaleString()}</span>
            </div>
            <div class="text-[#DBDEE1] whitespace-pre-wrap leading-relaxed">${parsedContent}</div>
            ${attachmentsHtml}
        </div>
      `;
    }

    html += `
        </div>
        <div class="mt-12 pt-8 border-t border-[#41434a] text-center text-xs text-[#949BA4]">
            End of transcript for #${this.escapeHtml(channel.name)}
        </div>
    </div>
</body>
</html>
`;

    return Buffer.from(html);
  }
}

export const transcriptService = new TranscriptService();
