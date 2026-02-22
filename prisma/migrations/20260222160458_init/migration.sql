-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'MOD', 'STREAMER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('TWITCH', 'KICK', 'YOUTUBE');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'CONFIRMED', 'DISPUTED', 'DISMISSED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "username" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "platform" "Platform" NOT NULL,
    "platformId" TEXT NOT NULL,
    "platformToken" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreamerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "streamUrl" TEXT,

    CONSTRAINT "StreamerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StreamerMod" (
    "streamerId" TEXT NOT NULL,
    "modId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StreamerMod_pkey" PRIMARY KEY ("streamerId","modId")
);

-- CreateTable
CREATE TABLE "SteamAccount" (
    "id" TEXT NOT NULL,
    "steamId" TEXT NOT NULL,
    "steamName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "profileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SteamAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "steamAccountId" TEXT NOT NULL,
    "reportedById" TEXT NOT NULL,
    "submittedById" TEXT,
    "game" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "severity" "Severity" NOT NULL DEFAULT 'LOW',
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProofLink" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProofLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReportVote" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_platformId_platform_key" ON "User"("platformId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "StreamerProfile_userId_key" ON "StreamerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SteamAccount_steamId_key" ON "SteamAccount"("steamId");

-- CreateIndex
CREATE INDEX "SteamAccount_steamId_idx" ON "SteamAccount"("steamId");

-- CreateIndex
CREATE INDEX "Report_steamAccountId_idx" ON "Report"("steamAccountId");

-- CreateIndex
CREATE INDEX "Report_reportedById_idx" ON "Report"("reportedById");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE INDEX "Report_severity_idx" ON "Report"("severity");

-- CreateIndex
CREATE INDEX "Report_createdAt_idx" ON "Report"("createdAt");

-- CreateIndex
CREATE INDEX "ProofLink_reportId_idx" ON "ProofLink"("reportId");

-- CreateIndex
CREATE INDEX "ReportVote_reportId_idx" ON "ReportVote"("reportId");

-- CreateIndex
CREATE UNIQUE INDEX "ReportVote_reportId_userId_key" ON "ReportVote"("reportId", "userId");

-- AddForeignKey
ALTER TABLE "StreamerProfile" ADD CONSTRAINT "StreamerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamerMod" ADD CONSTRAINT "StreamerMod_streamerId_fkey" FOREIGN KEY ("streamerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StreamerMod" ADD CONSTRAINT "StreamerMod_modId_fkey" FOREIGN KEY ("modId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_steamAccountId_fkey" FOREIGN KEY ("steamAccountId") REFERENCES "SteamAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProofLink" ADD CONSTRAINT "ProofLink_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportVote" ADD CONSTRAINT "ReportVote_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportVote" ADD CONSTRAINT "ReportVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
