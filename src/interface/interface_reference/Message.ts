interface MessageContent {
  contentType: "img" | "video" | "text" | "record";
  message?: string;
  mediaUrl?: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  sender: string;
  content: MessageContent;
  seenBy: string[];
  createdAt: number;
  updatedAt: number;
}
