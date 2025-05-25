export interface Group {
    _id: string;
    groupName: string;
    type: 'public' | 'private';
    idCreater: string;
    introduction?: string;
    avt?: string;
    backGround?: string;
    members?: { idUser: string; joinDate: number }[];
    article?: { idArticle: string; state: 'approved' | 'pending' }[];
    rule?: string[];
    Administrators?: { idUser: string; joinDate: number }[];
    hobbies?: string[];
    createdAt: number;
    updatedAt?: number;
    _destroy?: number;
  }
  