-- CreateTable
CREATE TABLE "GovAdmin" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "stateName" TEXT NOT NULL,
    "emoji" TEXT,
    "level" TEXT NOT NULL DEFAULT 'state',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GovAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GovAdmin_username_key" ON "GovAdmin"("username");
