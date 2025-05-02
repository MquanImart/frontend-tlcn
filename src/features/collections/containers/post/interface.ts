import { Article, Collection } from "@/src/interface/interface_reference";

export interface ViewCardArticle {
    article: Article;
    updateDate: number;
    representImg: string;
    author: {
        _id: string;
        displayName: string;
    },
    collectionId?: string;
}

export interface ViewCardCollection {
    collection: Collection;
    imgDefault: string;
}

export interface CollectionDetails {
    _id: string;
    name: string;
    items: ViewCardArticle[];
    createdAt: Date;
    updatedAt: Date;
    _destroy?: Date;
    type: 'article' | 'reels';
}
