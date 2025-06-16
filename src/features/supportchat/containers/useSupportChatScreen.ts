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

        // Loại bỏ dấu sao (*) và khoảng trắng thừa ở đầu, giữ lại định dạng Markdown **
        const cleanedBotReplyText = botReplyText.replace(/^\*+\s*/g, "");

        console.log("API Response:", cleanedBotReplyText);

        const botReply: Message = {
          id: (Date.now() + 1).toString(),
          text: cleanedBotReplyText, // Sử dụng văn bản đã được làm sạch
          isUser: false,
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