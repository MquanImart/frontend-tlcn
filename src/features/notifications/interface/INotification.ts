export interface MyPhoto {
  _id: string;
  name: string;
  idAuthor?: User; 
  type: 'img' | 'video' | 'record';
  url: string;
  createdAt: number;
  updateAt: number;
  _destroy?: number;
}

export interface User {
  _id: string;
  displayName: string;
  hashtag?: string;
  avt: MyPhoto[];
}


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
