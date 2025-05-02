import { User } from "./user";

export interface MyPhoto {
  _id: string;
  name: string;
  idAuthor: User; // Chi tiết tác giả
  type: 'img' | 'video' | 'record';
  url: string;
  createdAt: number;
  updateAt: number;
  _destroy?: number;
}
