// Định nghĩa tọa độ LatLng
interface LatLng {
    latitude: number;
    longitude: number;
  }
  
  // Định nghĩa viewport (khu vực hiển thị trên bản đồ)
  interface Viewport {
    low: LatLng;
    high: LatLng;
  }
  
  // Định nghĩa localized values (giá trị theo ngôn ngữ)
  interface LocalizedValues {
    distance?: {
      text: string; // e.g., "3.1 km"
      value: number; // e.g., 3076
    };
    duration?: {
      text: string; // e.g., "6 mins"
      value: string; // e.g., "365s"
    };
    staticDuration?: {
      text: string; // e.g., "6 mins"
      value: string; // e.g., "342s"
    };
  }
  
  // Định nghĩa polyline
  interface Polyline {
    encodedPolyline: string; // Chuỗi polyline mã hóa
  }
  
  // Định nghĩa chi tiết polyline (nếu có)
  interface PolylineDetails {
    // Tùy chỉnh nếu bạn có dữ liệu chi tiết hơn
    [key: string]: any;
  }
  
  // Định nghĩa travel advisory (thông tin cảnh báo giao thông)
  interface TravelAdvisory {
    // Tùy chỉnh nếu bạn có dữ liệu chi tiết hơn (ví dụ: traffic conditions)
    [key: string]: any;
  }
  
  // Định nghĩa leg (đoạn đường trong tuyến đường)
  interface RouteLeg {
    distanceMeters: number;
    duration: string; // e.g., "365s"
    staticDuration?: string; // e.g., "342s"
    startLocation: LatLng;
    endLocation: LatLng;
    polyline?: Polyline;
    // Thêm các trường khác nếu cần
  }
  
  // Định nghĩa route (tuyến đường)
  interface Route {
    description: string; // e.g., "QL30"
    distanceMeters: number; // e.g., 3076
    duration: string; // e.g., "365s"
    legs: RouteLeg[]; // Mảng các đoạn đường
    localizedValues: LocalizedValues;
    polyline: Polyline;
    polylineDetails: PolylineDetails;
    routeLabels: string[]; // e.g., ["FASTEST"]
    routeToken: string; // e.g., "CtkBCm0yaxpQ..."
    staticDuration: string; // e.g., "342s"
    travelAdvisory: TravelAdvisory;
    viewport: Viewport;
  }
  
  // Định nghĩa phản hồi chính từ Routes API
export interface RoutesResponse {
    geocodingResults: {
      [key: string]: any; // Tạm để trống vì không có dữ liệu chi tiết
    };
    routes: Route[];
  }