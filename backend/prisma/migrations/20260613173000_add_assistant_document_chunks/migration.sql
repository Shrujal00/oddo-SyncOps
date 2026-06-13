-- CreateTable
CREATE TABLE "AssistantDocumentChunk" (
    "id" UUID NOT NULL,
    "sourcePath" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "embedding" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssistantDocumentChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssistantDocumentChunk_sourcePath_chunkIndex_key" ON "AssistantDocumentChunk"("sourcePath", "chunkIndex");

-- CreateIndex
CREATE INDEX "AssistantDocumentChunk_sourcePath_idx" ON "AssistantDocumentChunk"("sourcePath");

-- CreateIndex
CREATE INDEX "AssistantDocumentChunk_contentHash_idx" ON "AssistantDocumentChunk"("contentHash");
