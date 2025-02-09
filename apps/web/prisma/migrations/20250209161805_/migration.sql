-- CreateTable
CREATE TABLE "ChallengeAnalysis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "challengeId" INTEGER NOT NULL,
    "winnerActivityId" INTEGER NOT NULL,
    "analysisOutcome" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ActivityAnalysis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "activityId" INTEGER NOT NULL,
    "valid" BOOLEAN NOT NULL,
    "message" TEXT NOT NULL,
    "challengeAnalysisId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ActivityAnalysis_challengeAnalysisId_fkey" FOREIGN KEY ("challengeAnalysisId") REFERENCES "ChallengeAnalysis" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeAnalysis_challengeId_key" ON "ChallengeAnalysis"("challengeId");

-- CreateIndex
CREATE INDEX "ActivityAnalysis_activityId_idx" ON "ActivityAnalysis"("activityId");
