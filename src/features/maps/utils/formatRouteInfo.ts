import { RoutesResponse } from "../containers/interfaceRoute";

export const formatRouteInfo = (routeDirections: RoutesResponse): string => {
    // Kiểm tra nếu routeDirections hoặc routes rỗng
    if (!routeDirections || !routeDirections.routes || routeDirections.routes.length === 0) {
      return "Không có dữ liệu tuyến đường";
    }
  
    const route = routeDirections.routes[0];
  
    // Xử lý thời gian (duration)
    const durationSeconds = parseInt(route.duration.replace('s', '')); // Chuyển từ "365s" sang 365
    const minutes = Math.floor(durationSeconds / 60); // Chuyển thành phút
    const hours = Math.floor(minutes / 60); // Tính giờ
    const remainingMinutes = minutes % 60; // Phút còn lại sau khi trừ giờ
  
    let durationString = '';
    if (minutes < 60) {
      // Dưới 60 phút, chỉ hiển thị phút
      durationString = `${minutes} phút`;
    } else {
      // Từ 60 phút trở lên, hiển thị giờ và phút
      durationString = `${hours} giờ ${remainingMinutes} phút`;
    }
  
    // Xử lý khoảng cách (distanceMeters)
    const distanceMeters = route.distanceMeters;
    let distanceString = '';
    if (distanceMeters >= 1000) {
      // Từ 1km trở lên, hiển thị dạng km với 1 chữ số thập phân
      distanceString = `${(distanceMeters / 1000).toFixed(1)} km`;
    } else {
      // Dưới 1km, hiển thị dạng mét
      distanceString = `${distanceMeters} m`;
    }
  
    // Trả về chuỗi theo định dạng yêu cầu
    return `${durationString} (${distanceString})`;
  };