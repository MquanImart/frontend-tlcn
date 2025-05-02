import { Address } from "./address";
import { Group } from "./group";
import { MyPhoto } from "./myPhoto";
import { User } from "./user";
import { Comment } from "./comment";
import { Report } from "./report";

export interface Article {
  _id: string;
  createdBy: User; // Chi tiết người tạo
  sharedPostId?: Article; // Bài viết được chia sẻ
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
