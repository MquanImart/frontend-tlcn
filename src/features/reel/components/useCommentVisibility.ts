import { useState } from "react";

// Hook quản lý việc ẩn/hiện các phản hồi
export const useCommentVisibility = () => {
  const [areRepliesVisible, setAreRepliesVisible] = useState(false);

  const toggleReplies = () => {
    setAreRepliesVisible(prevState => !prevState); // Đảo trạng thái
  };

  return { areRepliesVisible, toggleReplies };
};
