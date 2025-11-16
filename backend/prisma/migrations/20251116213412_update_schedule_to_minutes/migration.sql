/*
  Warnings:

  - You are about to alter the column `close_time` on the `barber_schedules` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `open_time` on the `barber_schedules` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `ending_time` on the `breaking_times` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `starting_time` on the `breaking_times` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_barber_schedules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "days_of_week" TEXT NOT NULL,
    "open_time" INTEGER NOT NULL,
    "close_time" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "barbershop_id" TEXT NOT NULL,
    CONSTRAINT "barber_schedules_barbershop_id_fkey" FOREIGN KEY ("barbershop_id") REFERENCES "barbershops" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_barber_schedules" ("barbershop_id", "close_time", "createdAt", "days_of_week", "id", "open_time", "updatedAt") SELECT "barbershop_id", "close_time", "createdAt", "days_of_week", "id", "open_time", "updatedAt" FROM "barber_schedules";
DROP TABLE "barber_schedules";
ALTER TABLE "new_barber_schedules" RENAME TO "barber_schedules";
CREATE TABLE "new_breaking_times" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "starting_time" INTEGER NOT NULL,
    "ending_time" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "schedule_id" TEXT NOT NULL,
    CONSTRAINT "breaking_times_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "barber_schedules" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_breaking_times" ("createdAt", "ending_time", "id", "schedule_id", "starting_time", "updatedAt") SELECT "createdAt", "ending_time", "id", "schedule_id", "starting_time", "updatedAt" FROM "breaking_times";
DROP TABLE "breaking_times";
ALTER TABLE "new_breaking_times" RENAME TO "breaking_times";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
