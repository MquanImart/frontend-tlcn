export const removeVietnameseTones = (str: string) => {
    return str
        .normalize("NFD") // Tách dấu khỏi ký tự gốc
        .replace(/[\u0300-\u036f]/g, "") // Xóa dấu
        .toLowerCase(); // Chuyển thành chữ thường
};