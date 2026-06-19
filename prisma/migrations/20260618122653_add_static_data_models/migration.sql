-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "badgeColor" TEXT,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "scope" TEXT NOT NULL DEFAULT 'state',
ALTER COLUMN "stateId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Scheme" ADD COLUMN     "badgeColor" TEXT,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "extra" JSONB,
ADD COLUMN     "hasPanLogic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nameLocal" TEXT,
ADD COLUMN     "scope" TEXT NOT NULL DEFAULT 'state',
ALTER COLUMN "stateId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Scholarship" ADD COLUMN     "badgeColor" TEXT,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "nameLocal" TEXT,
ADD COLUMN     "scope" TEXT NOT NULL DEFAULT 'state',
ALTER COLUMN "stateId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "State" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capital" TEXT,
    "region" TEXT,
    "color" TEXT,
    "emoji" TEXT,
    "schemes" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL DEFAULT 'state',

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "District" (
    "id" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GovSector" (
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,

    CONSTRAINT "GovSector_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "GovEmployee" (
    "id" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "designation" TEXT,
    "department" TEXT,
    "sector" TEXT,
    "salary" INTEGER,
    "joiningDate" TEXT,
    "pan" TEXT,
    "district" TEXT,
    "grade" TEXT,
    "serviceType" TEXT,

    CONSTRAINT "GovEmployee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrivateOrg" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "gst" TEXT,
    "sector" TEXT,
    "stateId" TEXT,
    "stateName" TEXT,
    "district" TEXT,
    "city" TEXT,
    "employees" INTEGER,
    "founded" INTEGER,
    "icon" TEXT,
    "color" TEXT,
    "adminPassword" TEXT,
    "description" TEXT,

    CONSTRAINT "PrivateOrg_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "District_stateId_idx" ON "District"("stateId");

-- CreateIndex
CREATE UNIQUE INDEX "GovEmployee_pan_key" ON "GovEmployee"("pan");

-- CreateIndex
CREATE INDEX "GovEmployee_stateId_idx" ON "GovEmployee"("stateId");

-- CreateIndex
CREATE INDEX "PrivateOrg_stateId_idx" ON "PrivateOrg"("stateId");

-- CreateIndex
CREATE INDEX "Exam_scope_idx" ON "Exam"("scope");

-- CreateIndex
CREATE INDEX "Scheme_scope_idx" ON "Scheme"("scope");

-- CreateIndex
CREATE INDEX "Scholarship_scope_idx" ON "Scholarship"("scope");
