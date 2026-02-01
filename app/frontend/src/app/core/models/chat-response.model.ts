export interface ChatSourceRef {
  filename: string;
  chunk_index: number;
}

export interface ChatResponse {
  content: string;
  sources?: ChatSourceRef[];
}
