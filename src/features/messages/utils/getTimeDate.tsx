export const formatDate = (date: number) => {
    const d = new Date(date);
    const hours = d.getHours().toString().padStart(2, "0"); // Lấy giờ, thêm '0' nếu cần
    const minutes = d.getMinutes().toString().padStart(2, "0"); // Lấy phút, thêm '0' nếu cần
    const day = d.getDate().toString(); // Lấy ngày
    const month = (d.getMonth() + 1).toString(); // Lấy tháng (lưu ý: getMonth() trả về từ 0-11 nên +1)
    const year = d.getFullYear().toString(); // Lấy năm

    return `${hours}:${minutes} ${day}/${month}/${year}`;
};
