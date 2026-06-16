-- CreateTable
CREATE TABLE "Scheme" (
    "id" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameHindi" TEXT,
    "ministry" TEXT,
    "category" TEXT,
    "benefit" TEXT,
    "eligibility" TEXT,
    "icon" TEXT,
    "description" TEXT,
    "documents" JSONB NOT NULL DEFAULT '[]',
    "formFields" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Scheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "conductedBy" TEXT,
    "category" TEXT,
    "posts" TEXT,
    "applicationFee" TEXT,
    "eligibility" TEXT,
    "nextExam" TEXT,
    "applicationDeadline" TEXT,
    "icon" TEXT,
    "status" TEXT,
    "description" TEXT,
    "formFields" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scholarship" (
    "id" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameHindi" TEXT,
    "ministry" TEXT,
    "category" TEXT,
    "subcategory" TEXT,
    "benefit" TEXT,
    "eligibility" TEXT,
    "icon" TEXT,
    "description" TEXT,
    "documents" JSONB NOT NULL DEFAULT '[]',
    "formFields" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Scholarship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tender" (
    "id" TEXT NOT NULL,
    "stateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT,
    "department" TEXT,
    "category" TEXT,
    "subcategory" TEXT,
    "estimatedValue" TEXT,
    "bidDeadline" TEXT,
    "workDescription" TEXT,
    "eligibility" TEXT,
    "icon" TEXT,
    "status" TEXT,
    "tenderNo" TEXT,
    "documents" JSONB NOT NULL DEFAULT '[]',
    "formFields" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tender_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Scheme_stateId_idx" ON "Scheme"("stateId");

-- CreateIndex
CREATE INDEX "Exam_stateId_idx" ON "Exam"("stateId");

-- CreateIndex
CREATE INDEX "Scholarship_stateId_idx" ON "Scholarship"("stateId");

-- CreateIndex
CREATE INDEX "Tender_stateId_idx" ON "Tender"("stateId");
