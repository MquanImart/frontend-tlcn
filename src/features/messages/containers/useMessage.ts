import { Conversation } from "@/src/interface/interface_flex";
import { MyPhoto } from "@/src/interface/interface_reference";

const useMessages = () => {

    const getParticipantById = (conversation: Conversation, userId: string): {_id: string; displayName: string; avt: MyPhoto[]} | null => {
        return conversation.participants.find(user => user._id === userId) || null;
    };
    
    const getOtherParticipantById = (conversation: Conversation, userId: string): {_id: string; displayName: string; avt: MyPhoto[]} | null => {
        return conversation.participants.find(user => user._id !== userId) || null;
    };

    const getShortNames = (conversation: Conversation): string => {
        return conversation.participants
            .map(user => user.displayName.split(" ").pop())
            .filter(Boolean)
            .join(", ");
    };

    const hasUserSeenLastMessage = (conversation: Conversation, userId: string): boolean => {
        if (!conversation.lastMessage) return false;
        return conversation.lastMessage.seenBy.includes(userId);
    };

    const getSenderName = (conversation: Conversation, userId: string): string => {
        if (!conversation.lastMessage) return "Không có tin nhắn";
    
        const senderId = conversation.lastMessage.sender;
    
        if (senderId === userId) return "Bạn";
    
        const sender = conversation.participants.find(user => user._id === senderId);
        return sender ? sender.displayName.split(" ").pop() ?? sender.displayName : "Người dùng";
    };

    const getContent = (conversation: Conversation): string => {
        if (!conversation.lastMessage){
            return "";
        }

        if (conversation.lastMessage.content.contentType === "text"){
            return conversation.lastMessage.content.message?conversation.lastMessage.content.message:"";
        } else if (conversation.lastMessage.content.contentType === "img"){
            return "ảnh";
        } else if (conversation.lastMessage.content.contentType === "record"){
            return "ghi âm";
        } else if (conversation.lastMessage.content.contentType === "video"){
            return "video";
        } else if (conversation.lastMessage.content.contentType === "map"){
            return "Tín hiệu cầu cứu!";
        }
        return "";
    };
        
    return {
        getParticipantById,
        getOtherParticipantById,
        getShortNames,
        hasUserSeenLastMessage,
        getSenderName,
        getContent,
    }
}

export default useMessages;