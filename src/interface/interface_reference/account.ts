export interface Account {
    _id: string; // Lưu thông tin mã nhân viên
    email: string; // Email người dùng
    phone: string; // Số điện thoại
    password: string; // Mật khẩu
    role: string; // Quyền người dùng
    warningLevel: number; // Mức độ cảnh báo
    state: 'online' | 'offline'; // Trạng thái
    createdAt: number;
    updatedAt?: number;
    _destroy?: number;
  }
  