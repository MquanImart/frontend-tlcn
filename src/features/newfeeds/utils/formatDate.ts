export const formatDate = (timestamp: number) => {
    const now = new Date();
    const commentDate = new Date(timestamp);
  
    const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000); // Chênh lệch tính bằng giây
    const diffInMinutes = Math.floor(diffInSeconds / 60); // Chênh lệch tính bằng phút
    const diffInHours = Math.floor(diffInMinutes / 60); // Chênh lệch tính bằng giờ
    const diffInDays = Math.floor(diffInHours / 24); // Chênh lệch tính bằng ngày
  
    if (diffInDays > 0) {
      return `${diffInDays} ngày trước`;
    } else if (diffInHours > 0) {
      return `${diffInHours} giờ trước`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes} phút trước`;
    } else {
      return `${diffInSeconds} giây trước`;
    }
  };
  