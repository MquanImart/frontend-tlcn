import { useState } from "react";

export function useReplyInput() {
  const [isReplyInputVisible, setReplyInputVisible] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const showReplyInput = () => setReplyInputVisible(true);
  const hideReplyInput = () => setReplyInputVisible(false);

  const handleReplyChange = (text: string) => setReplyContent(text);
  const resetReplyContent = () => setReplyContent("");

  return {
    isReplyInputVisible,
    replyContent,
    showReplyInput,
    hideReplyInput,
    handleReplyChange,
    resetReplyContent,
  };
}
