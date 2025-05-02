interface UserDisplay {
    _id: string;
    displayName: string;
}

export interface MyPhoto {
  _id: string;
  name: string;
  idAuthor: UserDisplay; // Chi tiết tác giả
  type: 'img' | 'video' | 'record';
  url: string;
  createdAt: number;
  updateAt: number;
  _destroy?: number;
}