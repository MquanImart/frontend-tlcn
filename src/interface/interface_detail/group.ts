import { Article } from "./article";
import { MyPhoto } from "./myPhoto";
import { User } from "./user";
import { Hobbies } from "./hobbies";

export interface Group {
  _id: string;
  groupName: string;
  type: 'public' | 'private';
  idCreater: User; 
  introduction?: string;
  avt?: MyPhoto;
  members?: { 
    idUser: User;      
    state: 'pending'|'accepted'|'rejected';
    joinDate: number }[]; // Danh sách thành viên chi tiết
  article?: { idArticle: Article; state: 'approved' | 'pending' }[];
  rule?: string[];
  Administrators?: { idUser: User;   state: 'pending'|'accepted'|'rejected', joinDate: number }[];
  hobbies?: Hobbies[];
  createdAt: number;
  updatedAt?: number;
  _destroy?: number;
}