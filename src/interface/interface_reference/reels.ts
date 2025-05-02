export interface Reels {
    _id: string;
    createdBy: string;
    reports?: string[];
    content: string;
    address?: string;
    hashTag?: string[];
    photo: string;
    scope?: string;
    emoticons?: string[];
    comments?: string[];
    createdAt: number;
    updatedAt?: number;
    destroyAt?: number;
  }
  