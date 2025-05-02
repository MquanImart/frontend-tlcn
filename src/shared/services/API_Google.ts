import env from "@/env";
import axios from "axios";


// Hàm chung để gọi API từ Google với baseURL động
export const callPostGoogleApi = async <T>(
  baseUrl: string,
  data: object,
  customHeaders?: Record<string, string>
): Promise<T | null> => {
  try {
    const response = await axios.post<T>(`${baseUrl}`, data, {
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": env.GOOGLE_MAPS_API_KEY,
        ...customHeaders,
      },
      timeout: 5000,
    });

    return response.data;
  } catch (error) {
    return null;
  }
};

export const callGetGoogleApi = async <T>(
  baseUrl: string,
  params?: Record<string, any>,
  headers: Record<string, string> = { "X-Goog-FieldMask": "*" } // Mặc định chỉ có FieldMask
): Promise<T | null> => {
  try {
    const response = await axios.get(baseUrl, {
      params,
      headers: {
        "X-Goog-Api-Key": env.GOOGLE_MAPS_API_KEY,
        ...headers,
      },
    });

    return response.data;
  } catch (error) {
    return null;
  }
};