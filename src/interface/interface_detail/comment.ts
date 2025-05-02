import { User } from "./user";

export interface Comment {
  _id: string;
  _iduser: User; // Chi tiết người dùng
  content: string;
  img?: string;
  replyComment?: Comment; // Bình luận mà nó phản hồi
  emoticons?: User[];
  createdAt: number;
  updatedAt?: number;
  _destroy?: number;
}
  