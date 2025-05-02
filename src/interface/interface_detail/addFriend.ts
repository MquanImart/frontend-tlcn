import { User } from "./user";

export interface AddFriend {
  _id: string;
  senderId: User; // Chi tiết người gửi
  receiverId: User; // Chi tiết người nhận
  status: 'approved' | 'pending' | 'rejected';
  message?: string;
  createdAt: number;
  acceptedAt?: number;
}
