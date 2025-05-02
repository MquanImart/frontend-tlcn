import { MyPhoto } from "../interface_reference";

interface MessageContent {
    contentType: "img" | "video" | "text" | "record" | "map";
    message?: string;
    mediaUrl?: MyPhoto;
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
