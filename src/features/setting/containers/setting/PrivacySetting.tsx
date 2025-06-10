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
  useTheme(); // Ensure useTheme is called to access dynamic colors
  const [isLoading, setIsLoading] = useState(true); // Trạng thái tải dữ liệu
  const [isMessageAllowed, setIsMessageAllowed] = useState(false); // Cho phép nhập tin nhắn
  const [isProfilePublic, setIsProfilePublic] = useState(false); // Truy cập trang cá nhân (true = public, false = private)
  const [userId, setUserId] = useState<string | null>(null); // Lưu userId từ AsyncStorage
  const [visible, setVisible] = useState<boolean>(false); // Trạng thái hiển thị modal chọn cuộc trò chuyện

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
      if (response && response.success && response.data && response.data.setting) {
        const userSetting = response.data.setting;
        setIsMessageAllowed(userSetting.allowMessagesFromStrangers);
        setIsProfilePublic(userSetting.profileVisibility);
      } else {
        console.error("❌ API không trả về dữ liệu cài đặt hợp lệ");
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
      if (!userId) {
        console.error("UserId is null. Cannot update setting.");
        return false;
      }
      const response = await UsersClient.patch(`${userId}/setting`, {
        setting: newSetting
      });

      if (!response || !response.success) {
        console.error("❌ Cập nhật cài đặt thất bại:", response?.message);
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

  const toggleProfileSwitch = async () => {
    const newProfileVisibility = !isProfilePublic; // Toggle the current public status
    setIsProfilePublic(newProfileVisibility);

    const success = await updateUserSetting({
      profileVisibility: newProfileVisibility,
      allowMessagesFromStrangers: isMessageAllowed
    });

    if (!success) {
      setIsProfilePublic(!newProfileVisibility); // Hoàn tác nếu cập nhật thất bại
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
      <View style={[styles.loadingContainer, { backgroundColor: Color.background }]}>
        <ActivityIndicator size="large" color={Color.mainColor2} />
        <Text style={{ color: Color.textPrimary, marginTop: 10 }}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Color.background }]}>
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
          {
            opacity: pressed ? 0.8 : 1,
            backgroundColor: Color.backgroundSecondary,
            shadowColor: Color.textSecondary // Using a themed shadow color
          }
        ]}
        onPress={toggleProfileSwitch} // Call toggleProfileSwitch without arguments, as it manages its own state
      >
        <Text style={[styles.text, { color: Color.textPrimary }]}>Tùy chọn truy cập trang cá nhân</Text>
        <Text style={[styles.status, { color: Color.textSecondary }]}>{isProfilePublic ? "Công khai" : "Riêng tư"}</Text>
      </Pressable>

      <View style={styles.settingRow}>
        <TouchableOpacity
          style={[styles.container2, {
            backgroundColor: Color.backgroundSecondary,
            shadowColor: Color.textSecondary // Using a themed shadow color
          }]}
          onPress={() => { setVisible(true) }}
        >
          <Text style={[styles.text, { color: Color.textPrimary }]}>Chọn hộp trò chuyện cầu cứu khi gặp nạn</Text>
        </TouchableOpacity>
      </View>

      <ModalChooseConversation visible={visible} onCancel={() => { setVisible(false) }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensure the container takes full height
    padding: 10, // Add some padding around the settings
    // backgroundColor will be set dynamically
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor will be set dynamically
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
    borderRadius: 10,
    paddingHorizontal: 15, // Increased padding for better appearance
    paddingVertical: 10,
    marginVertical: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    // backgroundColor and shadowColor will be set dynamically
  },
  text: {
    fontSize: 16,
    // color will be set dynamically
  },
  status: {
    fontSize: 14,
    // color will be set dynamically
  },
});

export default ScreenSetting;