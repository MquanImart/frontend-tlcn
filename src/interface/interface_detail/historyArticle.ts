import { Article } from "./article";
import { User } from "./user";

export interface HistoryArticle {
  _id: string;
  idUser: User; // Chi tiết người dùng
  idArticle: Article; // Chi tiết bài viết
  viewDate: number;
}
  