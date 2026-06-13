export interface AssistantChatRequestDto {
  message: string;
  route?: string;
}

export interface AssistantSourceDto {
  sourcePath: string;
  title?: string;
  score: number;
}

export interface AssistantChatResponseDto {
  answer: string;
  sources: AssistantSourceDto[];
}

export interface AssistantReindexResponseDto {
  chunks: number;
  sources: string[];
}

export interface AssistantChunkInput {
  sourcePath: string;
  chunkIndex: number;
  title?: string;
  content: string;
  contentHash: string;
  embedding: number[];
}
