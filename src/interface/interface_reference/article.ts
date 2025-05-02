export interface Article {
    _id: string;
    createdBy: string;
    sharedPostId?: string;
    reports?: string[];
    groupID?: string;
    content: string;
    address?: string;
    hashTag?: string[];
    listPhoto?: string[];
    scope?: string;
    emoticons?: string[];
    comments?: string[];
    createdAt: number;
    updatedAt?: number;
    _destroy?: number;
  }
  