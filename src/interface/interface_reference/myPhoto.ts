export interface MyPhoto {
    _id: string;
    name: string;
    idAuthor: string;
    type: 'img' | 'video' | 'record';
    url: string;
    createdAt: number;
    updateAt: number;
    _destroy?: number;
  }
  