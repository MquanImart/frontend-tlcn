import { Message } from "./Message";

export interface UserDisplay {
    _id: string;
    displayName: string;
    avt: string[];
}

export interface InfoPageConversations {
    _id: string;
    name: string;
    avt: string;
}

export interface ConversationSettings {
    userId: string;
    notifications: boolean;
    muteUntil: number | null;
    _id: string;
}

export interface Conversation {
    _id: string;
    participants: UserDisplay[];
    settings: ConversationSettings[];
    type: "private" | "group" | "page";
    groupName: string | null;
    avtGroup: string | null;
    pageId: InfoPageConversations | null;
    lastMessage: Message | null;
    createdAt: number;
    updatedAt: number;
}
  