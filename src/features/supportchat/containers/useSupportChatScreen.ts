import { useState } from "react";
import { Message } from "../interface/Message";
import { restClient } from "@/src/shared/services/RestClient";

export const useSupportChatScreen = (initialMessages: Message[] = []) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!inputText.trim()) {
      console.warn("Không thể gửi: Tin nhắn rỗng.");
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputText("");
    setIsLoading(true);

    const maxRetries = 5;
    let delay = 1000;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const client = restClient.apiClient.service("apis/ai/chatbot");
        const response = await client.create({ query: inputText });

        if (!response.success) {
          throw new Error(response.message || "Phản hồi API không thành công");
        }

        const botReplyText = response.data?.answer?.trim();
        if (!botReplyText) {
          throw new Error("Phản hồi API rỗng");
        }

        console.log("API Response:", botReplyText);

        // Tính toán boldRanges dựa trên *text* và giữ nguyên hashtag
        const boldRanges: Array<{ start: number; end: number }> = [];
        let plainText = botReplyText;
        let offset = 0;

        // Xử lý *text* và tính toán vị trí trong plainText
        plainText = plainText.replace(/\*([^\*]+?)\*/g, (match: string, p1: string, index: number) => {
          const start = index - offset;
          const end = start + p1.length;
          boldRanges.push({ start, end });
          offset += 2; // 2 dấu sao (*)
          return p1;
        });

        // Xóa **text** và <b> nếu có, giữ nguyên hashtag
        plainText = plainText
          .replace(/\*\*([^\*]+?)\*\*/g, "$1")
          .replace(/<\/?b>/g, "")
          .trim();

        console.log("Plain Text:", plainText);
        console.log("Bold Ranges:", boldRanges);

        const botReply: Message = {
          id: (Date.now() + 1).toString(),
          text: plainText,
          isUser: false,
          boldRanges,
        };
        setMessages((prev) => [...prev, botReply]);
        setIsLoading(false);
        return;
      } catch (error: any) {
        console.error(`Thử lần ${attempt + 1} thất bại:`, error);
        if (error.message.includes("429") && attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
        } else if (attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
          delay *= 2;
        } else {
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: "Lỗi xử lý yêu cầu. Vui lòng thử lại sau.",
            isUser: false,
          };
          setMessages((prev) => [...prev, errorMessage]);
          setIsLoading(false);
          return;
        }
      }
    }
  };

  return {
    messages,
    inputText,
    setInputText,
    handleSend,
    isLoading,
  };
};