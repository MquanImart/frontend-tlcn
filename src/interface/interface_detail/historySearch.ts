import { User } from "./user";

export interface HistorySearch {
  _id: string;
  idUser: User; // Chi tiết người dùng
  keySearch: string[];
}
