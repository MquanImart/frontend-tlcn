import { Address } from "./address";
import { Comment } from "./comment";
import { Group } from "./group";
import { MyPhoto } from "./myPhoto";
import { Report } from "./report";
import { User } from "./user";

export interface Article {
  _id: string;
  createdBy: User; // Chi tiết người tạo
  reports?: Report[]; // Danh sách báo cáo
  groupID?: Group; // Chi tiết nhóm
  content: string;
  address?: Address; // Địa chỉ chi tiết
  hashTag?: string[];
  listPhoto?: MyPhoto[]; // Danh sách ảnh chi tiết
  scope?: string;
  emoticons?: User[];
  comments?: Comment[]; // Danh sách bình luận chi tiết
  createdAt: number;
  updatedAt?: number;
  _destroy?: number;
}
