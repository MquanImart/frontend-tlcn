import env from '@/env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
class RestClient {

  baseURL: string = env.URL_BACKEND;
  path: string = "";
  token: string = "";

  public service(path: string): RestClient { 
    const client = new RestClient();
    client.path = path;
    client.token = this.token;
    if (this.token === ""){
      this.setNewToken();
    }
    return client;
  }

  private async setNewToken() {
    this.token = await AsyncStorage.getItem("token") as string;
  }
  private async loadToken() {
    this.token = (await AsyncStorage.getItem("token")) || "";
  }

  private ErrorMessage(err: unknown, message: string){
    if (axios.isAxiosError(err)) {
      const errorMessage = err.response?.data?.message || "Lỗi kết nối với server";
      return {
        success: false,
        data: null,
        messages: errorMessage,
      };
    } else {
      return {
        success: false,
        data: null,
        messages: "Đã xảy ra lỗi không xác định",
      };
    }
  }

  public async authentication(email: string, password: string) {
    try {
      const response = await axios.post(`${this.baseURL}/apis/accounts/login`, { email, password });

      if (response.data.success) {
        // Lưu thông tin người dùng
        await AsyncStorage.setItem("token", response.data.data.token);
        await AsyncStorage.setItem("role", response.data.data.account.role);
        await AsyncStorage.setItem("userId", response.data.data.user._id);
        await AsyncStorage.setItem("setting", JSON.stringify(response.data.data.user.setting)); // Chuyển thành chuỗi
        await AsyncStorage.setItem("displayName", response.data.data.user.displayName);
        await AsyncStorage.setItem("hashtag", response.data.data.user.hashtag);
        await AsyncStorage.setItem("avt", JSON.stringify(response.data.data.user.avt)); // Chuyển thành chuỗi
        await AsyncStorage.setItem("hobbies", JSON.stringify(response.data.data.user.hobbies)); // Chuyển thành chuỗi

        return {
          success: true,
          data: response.data.data || null,
          messages: response.data.messages,
        };
      } else {
        return {
          success: false,
          data: null,
          messages: "Tên đăng nhập hoặc mật khẩu không đúng",
        };
      }
    } catch (err) {
      return this.ErrorMessage(err, "Tên đăng nhập hoặc mật khẩu không đúng");
    }
  }

  public async get(id: string) {
    await this.loadToken();
    try {
      const response = await axios.get(`${this.baseURL}/${this.path}/${id}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      return response.data;
    } catch (err) {
      return {
        success: false,
        messages: "Lỗi xảy ra trong quá trình lấy dữ liệu",
      };
    }
  }

  public async find(filter: any) {
    await this.loadToken();
    try {
      const queryString = new URLSearchParams(filter).toString();
      const response = await axios.get(`${this.baseURL}/${this.path}?${queryString}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      return response.data;
    } catch (err) {
      return this.ErrorMessage(err, "Lỗi trong quá trình lấy dữ liệu");
    }
  }

  public async create(object: any) {
    await this.loadToken();
    try {
      const response = await axios.post(`${this.baseURL}/${this.path}`, object, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      return response.data;
    } catch (err) {
      return this.ErrorMessage(err, "Lỗi trong quá trình tạo dữ liệu");
    }
  }

  public async patch(id: string, object: any) {
    await this.loadToken();
    
    try {
      const response = await axios.patch(`${this.baseURL}/${this.path}/${id}`, object, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      return response.data;
    } catch (err) {
      return this.ErrorMessage(err, "Lỗi trong quá trình thay đổi dữ liệu");
    }
  }

  public async remove(id: string) {
    await this.loadToken();
    try {
      const response = await axios.delete(`${this.baseURL}/${this.path}/${id}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      return response.data;
    } catch (err) {
      return this.ErrorMessage(err, "Lỗi trong quá trình xóa dữ liệu");
    }
  }

  public async logout(p0: { userId: any; }) {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!this.token) {
        return { success: false, messages: "Token không tồn tại" };
      }

      const result = await axios.post(`${this.baseURL}/auths/logout/${userId}`, {}, {
        headers: { Authorization: `Bearer ${this.token}` },
      });

      if (result) {
        // Xóa token khỏi AsyncStorage
        await AsyncStorage.multiRemove(["token", "userId", "userName"]);
        return { success: true, messages: result.data.messages };
      } else {
        return { success: false, messages: "Đang xuất thất bại" };
      }
    } catch (error) {
      return { success: false, messages: "Lỗi khi đăng xuất" };
    }
  }

  public async delete(query: any) {
    await this.loadToken();
    try {
      const queryString = new URLSearchParams(query).toString();
      const response = await axios.delete(`${this.baseURL}/${this.path}?${queryString}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      return response.data;
    } catch (err) {
      return this.ErrorMessage(err, "Lỗi trong quá trình xóa dữ liệu");
    }
  }

  public async updateQuery(query: any) {
    await this.loadToken();
    try {
      const queryString = new URLSearchParams(query).toString();
      const response = await axios.patch(`${this.baseURL}/${this.path}?${queryString}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      return response.data;
    } catch (err) {
      return this.ErrorMessage(err, "Lỗi trong quá trình cập nhật dữ liệu");
    }
  }
}

const apiClient = new RestClient();


export const restClient = {
  apiClient
}

export default restClient;


