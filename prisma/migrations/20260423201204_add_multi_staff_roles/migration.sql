-- CreateTable
CREATE TABLE "StaffRole" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guildId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "StaffRole_guildId_roleId_key" ON "StaffRole"("guildId", "roleId");
