-- Add index on ReportVote(userId, createdAt) for rate limiting queries
CREATE INDEX "ReportVote_userId_createdAt_idx" ON "ReportVote"("userId", "createdAt");
