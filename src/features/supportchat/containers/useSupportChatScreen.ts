import { useState, useEffect } from "react";
import { Message } from "../interface/Message";
import OpenAI from "openai";
import travelSocialNetwork from "./support_data";
import env from "@/env";

if (!env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY chưa được thiết lập trong biến môi trường.");
}

const openai = new OpenAI({
  apiKey: env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/",
});

export const useSupportChatScreen = (initialMessages: Message[] = []) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fileContent, setFileContent] = useState<string>("");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Lưu nội dung support_data.txt trực tiếp trong mã
    const supportDataContent = travelSocialNetwork;

    // Đặt nội dung vào state
    setFileContent(supportDataContent.trim());
    setIsReady(true);
  }, []);

  const handleSend = async () => {
    if (!inputText.trim() || !isReady) {
      console.warn("Không thể gửi: Tin nhắn rỗng hoặc dữ liệu chưa sẵn sàng.");
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

    const systemPromptContent = fileContent.length === 0
      ? "Bạn là trợ lý hỗ trợ khách hàng. Hãy trả lời bằng tiếng Việt. Lưu ý: Không có dữ liệu hỗ trợ để tham khảo."
      : `Bạn là trợ lý hỗ trợ khách hàng. Nhiệm vụ là trả lời câu hỏi của người dùng  dựa vào nội dung tài liệu dưới đây. Trả lời bằng tiếng Việt. Nếu câu hỏi không liên quan, bạn hãy trả lời bằng kiến thức bạn biết.\n\n--- NỘI DUNG TÀI LIỆU ---\n${fileContent}\n--- HẾT ---`;

    const maxRetries = 3;
    let delay = 1000;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await openai.chat.completions.create({
          model: "gemini-1.5-flash",
          messages: [
            { role: "system", content: systemPromptContent },
            { role: "user", content: inputText },
          ],
          temperature: 0.2,
        });

        const botReplyText = response.choices[0]?.message?.content?.trim();
        if (!botReplyText) {
          throw new Error("Phản hồi API rỗng");
        }

        const botReply: Message = {
          id: (Date.now() + 1).toString(),
          text: botReplyText,
          isUser: false,
        };
        setMessages((prev) => [...prev, botReply]);
        setIsLoading(false);
        return;
      } catch (error: any) {
        console.error(`Thử lần ${attempt + 1} thất bại:`, error);
        if (error.response?.status === 429 && attempt < maxRetries - 1) {
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
    isReady,
  };
};