-- CreateTable
CREATE TABLE "invitations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_email" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "barbershop_id" TEXT NOT NULL,
    "user_id" TEXT,
    CONSTRAINT "invitations_barbershop_id_fkey" FOREIGN KEY ("barbershop_id") REFERENCES "barbershops" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "invitations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "invitations_user_email_barbershop_id_status_key" ON "invitations"("user_email", "barbershop_id", "status");
