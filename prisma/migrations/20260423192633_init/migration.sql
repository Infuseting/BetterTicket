-- CreateTable
CREATE TABLE "GuildConfig" (
    "guildId" TEXT NOT NULL PRIMARY KEY,
    "staffRoleId" TEXT
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "channelId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_channelId_key" ON "Ticket"("channelId");
