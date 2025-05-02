export interface CollectionItem {
  _id: string;
  updateDate: number;
}

export interface Collection {
    _id: string;
    name: string;
    items: CollectionItem[];
    createdAt: Date;
    updatedAt: Date;
    _destroy?: Date;
    type: 'article' | 'reels';
}
