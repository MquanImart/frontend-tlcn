
export interface Article {
  _id: string;
  createdBy: User;
  sharedPostId?: Article; 
  reports?: Report[]; 
  groupID?: Group; 
  content: string;
  address?: Address;
  hashTag?: string[];
  listPhoto?: MyPhoto[]; 
  scope: string;
  emoticons?: User[];
  comments?: Comment[]; // Danh sách bình luận chi tiết
  createdAt: number;
  updatedAt?: number;
  _destroy?: number;
}

export interface Group {
  _id: string;
  groupName: string;
  type: 'public' | 'private';
  idCreater: string; 
  introduction?: string;
  avt?: MyPhoto;
  members?: { 
    idUser: User;      
    state: 'pending'|'accepted'|'rejected';
    joinDate: number }[]; 
  article?: { idArticle: Article; state: 'approved' | 'pending' }[];
  rule?: string[];
  Administrators?: { idUser: User;   state: 'pending'|'accepted'|'rejected', joinDate: number }[];
  hobbies?: string[];
  createdAt: number;
  updatedAt?: number;
  _destroy?: number;
}

export interface User {
  _id: string;
  displayName: string;
  hashtag?: string;
  address: Address; // Đối tượng chi tiết của Address
  avt: MyPhoto[];
  aboutMe?: string;
  createdAt: number;
  hobbies?: Hobbies[];
  friends?: User[]; // Danh sách bạn bè dưới dạng đối tượng User
  articles?: Article[]; // Danh sách bài viết
  groups?: {
    _id: string;
    createGroups: Group[];
    saveGroups: Group[];
  };
  follow?: User[]; // Danh sách người dùng được follow
  setting?: {
    profileVisibility: boolean;
    allowMessagesFromStrangers: boolean;
  };
}

export interface MyPhoto {
  _id: string;
  name: string;
  idAuthor: User;
  type: 'img' | 'video' | 'record';
  url: string;
  createdAt: number;
  updateAt: number;
  _destroy?: number;
}

  
export interface Comment {
  _id: string;
  _iduser: User; 
  content: string;
  img?: MyPhoto[];
  replyComment?: Comment[]; 
  emoticons?: string[];
  createdAt: number;
  updatedAt?: number;
  _destroy?: number;
}

export interface Report {
    _id: string;
  _idReporter: string; // Chi tiết người báo cáo
  reason: string;
  reportDate: string;
  status: string;
}

export interface Address {
  _id: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  placeName?: string;
  lat?: number;
  long?: number;
}

export interface Hobbies {
  _id: string;
  name: string;
  createdAt: number;
  updatedAt?: number;
  _destroy?: number;
}

