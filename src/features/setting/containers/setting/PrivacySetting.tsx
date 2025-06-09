import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, TouchableOpacity } from "react-native";
import ToggleSwitch from "../../components/ToggleSwitch";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import restClient from "@/src/shared/services/RestClient";
import AsyncStorage from '@react-native-async-storage/async-storage';
import ModalChooseConversation from "../../components/ModalChooseConversation";

const UsersClient = restClient.apiClient.service("apis/users");

const ScreenSetting = () => {
  useTheme()
  const [isLoading, setIsLoading] = useState(true); // Trạng thái tải dữ liệu
  const [isMessageAllowed, setIsMessageAllowed] = useState(false); // Cho phép nhập tin nhắn
  const [isProfilePublic, setIsProfilePublic] = useState(false); // Truy cập trang cá nhân
  const [isPrivate, setIsPrivate] = useState(false); // Cài đặt riêng tư
  const [userId, setUserId] = useState<string | null>(null); // Lưu userId từ AsyncStorage
  const [visible, setVisible] = useState<boolean>(false);

  // Lấy userId từ AsyncStorage
  const getUserId = async () => {
    try {
      const id = await AsyncStorage.getItem("userId");
      setUserId(id);
    } catch (err) {
      console.error("Lỗi khi lấy userId:", err);
    }
  };

  // Lấy cài đặt người dùng từ backend
  const fetchUserSettings = async (id: string) => {
    try {
      const response = await UsersClient.get(id); // Gọi API với userId
      if (response && response.success) {
        const user = response.data; // Giả sử API trả về `data.setting`
        setIsMessageAllowed(user.setting.allowMessagesFromStrangers);
        setIsProfilePublic(user.setting.profileVisibility);
        setIsPrivate(!user.setting.profileVisibility); 
      } else {
        console.error("❌ API không trả về dữ liệu hợp lệ");
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy cài đặt người dùng:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cập nhật cài đặt người dùng lên backend
  const updateUserSetting = async (newSetting: any) => {
    try {      
      const response = await UsersClient.patch(`${userId}/setting`, {
        setting: newSetting
      });
  
      if (!response || !response.success) {
        return false;
      }
      return true;
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật cài đặt:", error);
      return false;
    }
  };

  const toggleMessageSwitch = async (value: boolean) => {
    setIsMessageAllowed(value);
    const success = await updateUserSetting({ 
      profileVisibility: isProfilePublic, 
      allowMessagesFromStrangers: value 
    });
  
    if (!success) {
      setIsMessageAllowed(!value); // Hoàn tác nếu cập nhật thất bại
    }
  };
  
  const toggleProfileSwitch = async (value: boolean) => {
    const newProfileVisibility = !isProfilePublic;
    setIsProfilePublic(newProfileVisibility);
    setIsPrivate(!newProfileVisibility);
  
    const success = await updateUserSetting({ 
      profileVisibility: newProfileVisibility, 
      allowMessagesFromStrangers: isMessageAllowed 
    });
  
    if (!success) {
      setIsProfilePublic(!value); // Hoàn tác nếu cập nhật thất bại
      setIsPrivate(value);
    }
  };

  // Lấy userId khi component mount
  useEffect(() => {
    getUserId();
  }, []);

  // Lấy dữ liệu cài đặt khi có userId
  useEffect(() => {
    if (userId) {
      fetchUserSettings(userId);
    }
  }, [userId]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Color.textColor3} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Cho phép nhập tin nhắn người lạ */}
      <View style={styles.settingRow}>
        <ToggleSwitch
          label="Tùy chọn nhận tin nhắn người lạ"
          initialValue={isMessageAllowed}
          onToggle={toggleMessageSwitch}
        />
      </View>

      {/* Tùy chọn truy cập trang cá nhân */}
      <Pressable
        style={({ pressed }) => [
          styles.container2,
          { opacity: pressed ? 0.8 : 1 }
        ]}
        onPress={() => toggleProfileSwitch(!isPrivate)}
      >
        <Text style={styles.text}>Tùy chọn truy cập trang cá nhân</Text>
        <Text style={styles.status}>{isPrivate ? "Riêng tư" : "Công khai"}</Text>
      </Pressable>
      <View style={styles.settingRow}>
        <TouchableOpacity style={styles.container2}
          onPress={() => {setVisible(true)}}
        >
          <Text style={styles.text}>Chọn hộp trò chuyện cầu cứu khi gặp nạn</Text>
        </TouchableOpacity>
      </View>
      <ModalChooseConversation visible={visible} onCancel={() => {setVisible(false)}}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Color.white_homologous,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Color.white_homologous,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  container2: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    height: 50,
    backgroundColor: Color.white_homologous,
    borderRadius: 10,
    paddingHorizontal: 5,
    paddingVertical: 10,
    marginVertical: 5,
    shadowColor: Color.white_contrast,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2, // Hiệu ứng nổi trên Android
  },
  text: {
    fontSize: 16,
    color: Color.textColor1,
  },
  status: {
    fontSize: 14,
    color: Color.textColor3,
  },
});

export default ScreenSetting;