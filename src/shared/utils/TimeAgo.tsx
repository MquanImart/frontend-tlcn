const timeAgo = (timestamp: number): string => {
    const now = Date.now();
    const seconds = Math.floor((now - timestamp) / 1000);
  
    if (seconds < 60) return "ngay bây giờ";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} tiếng trước`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)} ngày trước`;
    if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} tháng trước`;
    
    return `${Math.floor(seconds / 31536000)} năm trước`;
  };

  export default timeAgo;