-- CreateEnum
CREATE TYPE "AppealStatus" AS ENUM ('PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "ReportAppeal" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "steamId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "contact" TEXT,
    "status" "AppealStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReportAppeal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReportAppeal_reportId_idx" ON "ReportAppeal"("reportId");

-- CreateIndex
CREATE INDEX "ReportAppeal_status_idx" ON "ReportAppeal"("status");

-- AddForeignKey
ALTER TABLE "ReportAppeal" ADD CONSTRAINT "ReportAppeal_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;
