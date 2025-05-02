import { User } from "./user";

export interface Conversation {
  _id: string;
  type: 'friend' | 'group' | 'page';
  _user: { type: 'user' | 'page'; _id: User }[]; // Chi tiết danh sách người tham gia
  content: { userId: User; message: string; sendDate: number }[];
}
