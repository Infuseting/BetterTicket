import { TextChannel } from 'discord.js';

export class TranscriptService {
  async generate(channel: TextChannel): Promise<Buffer> {
    const messages = await channel.messages.fetch({ limit: 100 });
    const sortedMessages = Array.from(messages.values()).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    let html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Transcript - ${channel.name}</title>
    <style>
        body { font-family: sans-serif; background: #36393f; color: #dcddde; padding: 20px; }
        .message { margin-bottom: 15px; border-bottom: 1px solid #4f545c; padding-bottom: 10px; }
        .author { font-weight: bold; color: #fff; margin-right: 10px; }
        .timestamp { color: #72767d; font-size: 0.8em; }
        .content { margin-top: 5px; white-space: pre-wrap; }
    </style>
</head>
<body>
    <h1>Transcript for ${channel.name}</h1>
    <div id="messages">
`;

    for (const msg of sortedMessages) {
      html += `
        <div class="message">
            <span class="author">${msg.author.tag}</span>
            <span class="timestamp">${msg.createdAt.toLocaleString()}</span>
            <div class="content">${msg.content}</div>
        </div>
      `;
    }

    html += `
    </div>
</body>
</html>
`;

    return Buffer.from(html);
  }
}

export const transcriptService = new TranscriptService();
