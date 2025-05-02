export interface Page {
    _id: string;
    name: string;
    address?: string;
    avt?: string;
    follower?: string[];
    timeOpen?: string;
    timeClose?: string;
    listArticle?: string[];
    idCreater: string;
    listAdmin?: { 
      _id: string; 
      idUser: string; 
      state: 'pending'|'accepted'|'rejected';
      joinDate: number }[];
    listTicket?: string[];
    hobbies?: string[];
    createAt: number;
    updatedAt?: number;
    deleteAt?: number;
  }
  