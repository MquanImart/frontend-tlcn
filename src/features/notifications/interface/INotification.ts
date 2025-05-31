export interface MyPhoto {
  _id: string;
  name: string;
  idAuthor?: User;
  type: 'img' | 'video' | 'record';
  url: string;
  createdAt: number;
  updateAt: number;
  _destroy?: number;
}

export interface User {
  _id: string;
  displayName: string;
  hashtag?: string;
  avt: MyPhoto[];
}

export interface Notification {
  _id: string;
  senderId: User; // Chi tiết người gửi (populate từ User)
  receiverId: User; // Chi tiết người nhận (populate từ User)
  message: string;
  status: 'read' | 'unread';
  groupId?: string; // ID của nhóm liên quan (nếu có)
  articleId?: string; // ID của bài viết liên quan (nếu có)
  commentId?: string; // ID của bình luận liên quan (nếu có)
  pageId?: string; // ID của trang liên quan (nếu có)
  reelId?: string; // ID của reel liên quan (nếu có)
  relatedEntityType?: 'Group' | 'Article' | 'Comment' | 'User' | 'Page'| 'Reel' | null; // Loại thực thể liên quan
  readAt?: number; // Thời gian đọc thông báo
  createdAt: number; // Thời gian tạo thông báo
  _destroy?: number; // Thời gian xóa mềm (nếu có)
}