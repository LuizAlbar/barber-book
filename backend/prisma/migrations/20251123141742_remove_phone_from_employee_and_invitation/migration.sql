/*
  Warnings:

  - You are about to drop the column `phone_number` on the `employees` table. All the data in the column will be lost.
  - You are about to drop the column `phone_number` on the `invitations` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_employees" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "user_id" TEXT NOT NULL,
    "barbershop_id" TEXT NOT NULL,
    CONSTRAINT "employees_barbershop_id_fkey" FOREIGN KEY ("barbershop_id") REFERENCES "barbershops" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "employees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_employees" ("barbershop_id", "createdAt", "id", "role", "updatedAt", "user_id") SELECT "barbershop_id", "createdAt", "id", "role", "updatedAt", "user_id" FROM "employees";
DROP TABLE "employees";
ALTER TABLE "new_employees" RENAME TO "employees";
CREATE TABLE "new_invitations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "barbershop_id" TEXT NOT NULL,
    "user_id" TEXT,
    CONSTRAINT "invitations_barbershop_id_fkey" FOREIGN KEY ("barbershop_id") REFERENCES "barbershops" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "invitations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_invitations" ("barbershop_id", "createdAt", "id", "role", "status", "updatedAt", "user_email", "user_id") SELECT "barbershop_id", "createdAt", "id", "role", "status", "updatedAt", "user_email", "user_id" FROM "invitations";
DROP TABLE "invitations";
ALTER TABLE "new_invitations" RENAME TO "invitations";
CREATE INDEX "invitations_user_email_barbershop_id_idx" ON "invitations"("user_email", "barbershop_id");
CREATE UNIQUE INDEX "invitations_user_email_barbershop_id_status_key" ON "invitations"("user_email", "barbershop_id", "status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
