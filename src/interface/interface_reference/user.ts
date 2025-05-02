import { Account } from './account';
import { Identification } from './identification';

export interface User {
  _id: string;
  account: Account;
  identification: Identification;
  displayName: string;
  hashtag?: string;
  address: string;
  avt: string[];
  aboutMe?: string;
  createdAt: number;
  hobbies?: string[];
  friends?: string[];
  articles?: string[];
  reels?: string[];
  pages?: {
    _id: string;
    createPages: string[];
    followerPages: string[];
  };
  saveAddress?: string[];
  trips?: string[];
  collections?: string[];
  groups?: {
    _id: string;
    createGroups: string[];
    saveGroups: string[];
  };
  follow?: string[];
  setting?: {
    profileVisibility: boolean;
    allowMessagesFromStrangers: boolean;
  };
}
