import { Address } from "./address";
import { User } from "./user";
import { Comment } from "./comment";
import { MyPhoto } from "./myPhoto";

export interface Reels {
  _id: string;
  createdBy: User; // Chi tiết người tạo
  reports?: Report[];
  content: string;
  address?: Address;
  hashTag?: string[];
  photo: MyPhoto;
  scope?: string;
  emoticons?: string[];
  comments?: Comment[];
  createdAt: number;
  updatedAt?: number;
  _destroy?: number;
}
