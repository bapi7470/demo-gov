-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "dob" TEXT,
    "gender" TEXT,
    "mobile" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT,
    "aadhaar" TEXT,
    "pan" TEXT,
    "category" TEXT,
    "education" TEXT,
    "occupation" TEXT,
    "employmentStatus" TEXT,
    "annualIncome" TEXT,
    "address" TEXT,
    "state" TEXT,
    "district" TEXT,
    "bankAccount" TEXT,
    "ifsc" TEXT,
    "rationCard" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "refNo" TEXT NOT NULL,
    "userId" TEXT,
    "stateId" TEXT,
    "schemeId" TEXT,
    "schemeName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Submitted',
    "statusHistory" JSONB NOT NULL DEFAULT '[]',
    "formData" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("refNo")
);

-- CreateTable
CREATE TABLE "CustomScheme" (
    "id" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "benefit" TEXT,
    "eligibility" TEXT,
    "documents" JSONB NOT NULL DEFAULT '[]',
    "deadline" TEXT,
    "category" TEXT,
    "formFields" JSONB NOT NULL DEFAULT '[]',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomScheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomExam" (
    "id" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TEXT,
    "lastDate" TEXT,
    "fee" TEXT,
    "eligibility" TEXT,
    "posts" INTEGER,
    "category" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomExam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomCompany" (
    "id" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "industry" TEXT,
    "location" TEXT,
    "description" TEXT,
    "website" TEXT,
    "jobs" JSONB NOT NULL DEFAULT '[]',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DistrictRole" (
    "id" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT,
    "email" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DistrictRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomScholarship" (
    "id" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" TEXT,
    "eligibility" TEXT,
    "lastDate" TEXT,
    "category" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomScholarship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomTender" (
    "id" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "value" TEXT,
    "lastDate" TEXT,
    "category" TEXT,
    "department" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomTender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Beneficiary" (
    "pan" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT,
    "schemes" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'active',
    "employer" JSONB,
    "appliedOn" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Beneficiary_pkey" PRIMARY KEY ("pan")
);

-- CreateTable
CREATE TABLE "CompanyEmployee" (
    "uid" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "pan" TEXT NOT NULL,
    "name" TEXT,
    "mobile" TEXT,
    "email" TEXT,
    "addedOn" TEXT,

    CONSTRAINT "CompanyEmployee_pkey" PRIMARY KEY ("uid")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "User_aadhaar_key" ON "User"("aadhaar");

-- CreateIndex
CREATE INDEX "CustomScheme_stateId_idx" ON "CustomScheme"("stateId");

-- CreateIndex
CREATE INDEX "CustomExam_stateId_idx" ON "CustomExam"("stateId");

-- CreateIndex
CREATE INDEX "CustomCompany_stateId_idx" ON "CustomCompany"("stateId");

-- CreateIndex
CREATE INDEX "DistrictRole_stateId_idx" ON "DistrictRole"("stateId");

-- CreateIndex
CREATE INDEX "DistrictRole_district_idx" ON "DistrictRole"("district");

-- CreateIndex
CREATE INDEX "CustomScholarship_stateId_idx" ON "CustomScholarship"("stateId");

-- CreateIndex
CREATE INDEX "CustomTender_stateId_idx" ON "CustomTender"("stateId");

-- CreateIndex
CREATE INDEX "CompanyEmployee_orgId_idx" ON "CompanyEmployee"("orgId");

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
