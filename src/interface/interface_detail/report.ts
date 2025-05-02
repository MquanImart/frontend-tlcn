  import { User } from "./user";

  export interface Report {
    _idReporter: User; // Chi tiết người báo cáo
    reason: string;
    reportDate: number;
    status: 'pending'| 'accepted' | 'rejected'
  }
