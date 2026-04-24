# Specification: Ticket Transcripts

Implementation of a transcript generation system for BetterTicket. When a ticket is archived, the bot generates a visual HTML file of the conversation and sends it to the ticket owner via DM.

## 1. Goal
Provide users and staff with a permanent, visually appealing record of ticket discussions after the Discord channel is deleted.

## 2. Functional Requirements
- **Trigger**: Activates when the "Archive Ticket" button is clicked.
- **Data Collection**: Fetch all messages from the channel before deletion.
- **HTML Rendering**: 
    - Use Tailwind CSS (CDN) for styling.
    - Mimic Discord's dark mode aesthetic.
    - Support user avatars, timestamps, and message content.
    - Render mentions (users, roles, channels) with Discord-like styling.
    - Display images sent in the ticket.
- **Delivery**:
    - Send an Embed to the ticket author's DMs.
    - Attach the generated HTML file.
    - Embed should follow the design provided in the reference image.

## 3. Technical Architecture

### 3.1 Components
- `TranscriptService`: New service to handle message fetching and HTML generation.
- `ArchiveTicket` (Interaction): Updated to invoke the transcript generation before channel deletion.
- `TicketService`: Updated to provide necessary data for the transcript.

### 3.2 Data Flow
1. Fetch `Ticket` data from database to find the author.
2. Fetch all messages from the `TextChannel`.
3. Process messages:
    - Identify unique participants.
    - Format text (markdown to basic HTML, mentions to spans).
    - Map attachment URLs.
4. Generate HTML string using a template literals approach.
5. Create a Discord `AttachmentBuilder` from the HTML string.
6. Send DM to user with Embed + Attachment.
7. Delete the channel.

## 4. Design Specs (HTML/CSS)
- **Framework**: Tailwind CSS v3 (via CDN).
- **Theme**: Dark mode (Background: `#313338`, Text: `#DBDEE1`).
- **Mentions**:
    - Users: `@Name` with light blue background.
    - Roles: `@Role` with light green/grey background.
    - Channels: `#Channel` with hashtag icon style.

## 5. Success Criteria
- A ticket can be archived without errors.
- The user receives a DM with a valid HTML file.
- The HTML file, when opened, looks like a Discord conversation.
- Mentions are displayed as mentions, not as raw IDs.
