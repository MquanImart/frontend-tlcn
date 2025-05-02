export interface Comment {
    _id: string;
    _iduser: string;
    content: string;
    img?: string;
    replyComment?: string;
    emoticons?: string[];
    createdAt: number;
    updatedAt?: number;
    _destroy?: number;
  }
  