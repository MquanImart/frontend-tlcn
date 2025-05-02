interface ConversationSettings {
  userId: string;
  notifications: boolean;
  muteUntil: number | null;
}

export interface Conversation {
  _id: string;
  participants: string[];
  settings: ConversationSettings[];
  type: "private" | "group" | "page";
  groupName: string | null;
  avtGroup: string | null;
  pageId: string | null;
  lastMessage: string | null;
  createdAt: number;
  updatedAt: number;
}
