import { MyPhoto } from "../interface_reference";
import { Message } from "./Message";

export interface UserDisplay {
    _id: string;
    displayName: string;
    avt: MyPhoto[];
}

export interface InfoPageConversations {
    _id: string;
    name: string;
    avt: MyPhoto;
}

export interface ConversationSettings {
    userId: string;
    notifications: boolean;
    muteUntil: number | null;
    active: boolean;
    sos: boolean;
    _id: string;
}

export interface Conversation {
    _id: string;
    creatorId: string;
    participants: UserDisplay[];
    settings: ConversationSettings[];
    type: "private" | "group" | "page";
    groupName: string | null;
    avtGroup: MyPhoto | null;
    pageId: InfoPageConversations | null;
    lastMessage: Message | null;
    createdAt: number;
    updatedAt: number;
}
  