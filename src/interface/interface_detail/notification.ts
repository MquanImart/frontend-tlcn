import { User } from "./user";

export interface Notification {
  _id: string;
  senderId: User; // Chi tiết người gửi
  receiverId: User; // Chi tiết người nhận
  message: string;
  status: 'read' | 'unread';
  url?: string;
  readAt?: number;
  createdAt: number;
  _destroy?: number;
}
