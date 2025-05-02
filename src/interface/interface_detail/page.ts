import { Address } from "./address";
import { Article } from "./article";
import { MyPhoto } from "./myPhoto";
import { Ticket } from "./ticket";
import { User } from "./user";

export interface Page {
  _id: string;
  name: string;
  avt?: MyPhoto;
  address?: Address;
  follower?: User[];
  timeOpen?: string;
  timeClose?: string;
  listArticle?: Article[];
  idCreater: User;
  listAdmin?: { 
    _id: string; 
    idUser: User; 
    state: 'pending'|'accepted'|'rejected';
    joinDate: number }[];
  listTicket?: Ticket[];
  createAt: number;
  updatedAt?: number;
  deleteAt?: number;
}
