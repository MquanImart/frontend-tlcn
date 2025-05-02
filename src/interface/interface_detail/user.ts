import { Account } from "./account";
import { Address } from "./address";
import { Article } from "./article";
import { Collection } from "./collection";
import { Group } from "./group";
import { Identification } from "./identification";
import { Reels } from "./reels";
import { Trip } from "./trip";
import { Page } from "./page";
import { MyPhoto } from "./myPhoto";
import { Hobbies } from "./hobbies";

export interface User {
  _id: string;
  account: Account; // Đối tượng chi tiết của Account
  identification: Identification; // Đối tượng chi tiết của Identification
  displayName: string;
  hashtag?: string;
  address: Address; // Đối tượng chi tiết của Address
  avt: MyPhoto[];
  aboutMe?: string;
  createdAt: number;
  hobbies?: Hobbies[];
  friends?: User[]; // Danh sách bạn bè dưới dạng đối tượng User
  articles?: Article[]; // Danh sách bài viết
  reels?: Reels[]; // Danh sách reels
  pages?: {
    _id: string;
    createPages: Page[];
    followerPages: Page[];
  };
  saveAddress?: Address[]; // Danh sách đối tượng chi tiết của Address
  trips?: Trip[]; // Danh sách chuyến đi
  collections?: Collection[]; // Danh sách bộ sưu tập
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
