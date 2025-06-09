import CButton from "@/src/shared/components/button/CButton";
import CIconButton from "@/src/shared/components/button/CIconButton";
import CHeader from "@/src/shared/components/header/CHeader";
import { MenuStackParamList } from "@/src/shared/routes/MenuNavigation";
import { TabbarStackParamList } from "@/src/shared/routes/TabbarBottom";
import restClient from "@/src/shared/services/RestClient"; // Import restClient
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Image } from 'expo-image';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { useMenu } from "./useMenu";

const DEFAULT_AVATAR = "https://picsum.photos/200/300";

type SettingNavigationProp = StackNavigationProp<TabbarStackParamList, "Menu">;
type MenuNavigationProp = StackNavigationProp<MenuStackParamList, "Menu">;

interface CategoryItem {
  id: string;
  label: string;
  image: any;
}

const Menu = () => {
  useTheme()
  const navigation = useNavigation<SettingNavigationProp>();
  const navigationMenu = useNavigation<MenuNavigationProp>();
  const [userID, setUserID] = useState<string | null>(null);

  // Hàm lấy userID từ AsyncStorage
  const getUserID = async () => {
    try {
      const storedUserID = await AsyncStorage.getItem("userId");
      if (storedUserID) {
        const cleanUserID = storedUserID.replace(/"/g, "");
        setUserID(cleanUserID);
      } else {
        console.log("Không tìm thấy userID trong AsyncStorage");
      }
    } catch (error) {
      console.error("Lỗi khi lấy userID từ AsyncStorage:", error);
    } 
  };

  // Hàm xử lý đăng xuất
  const handleLogout = async () => {
    try {
      if (!userID) {
        Alert.alert("Lỗi", "Không tìm thấy userId");
        return;
      }

      // Xóa toàn bộ dữ liệu trong AsyncStorage
      await AsyncStorage.multiRemove([
        "token",
        "userId",
        "role",
        "setting",
        "displayName",
        "hashtag",
        "avt",
        "hobbies",
      ]);

      // Đặt lại trạng thái client
      setUserID(null);
      restClient.apiClient.token = ""; // Đặt lại token trong RestClient

      // Chuyển hướng về màn hình Login
      navigationMenu.navigate("Login");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi trong quá trình đăng xuất");
    }
  };

  // Xác nhận đăng xuất
  const confirmLogout = () => {
    Alert.alert(
      "Xác nhận",
      "Bạn có muốn đăng xuất?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Đồng ý", onPress: handleLogout },
      ],
      { cancelable: false }
    );
  };

  useEffect(() => {
    getUserID();
  }, []);

  const { user, avt, groups, loading, error, categories, navigate, navigateToGroup } = useMenu(userID || "");

  if (!userID) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Color.white_contrast} />
        <Text>Đang tải thông tin người dùng...</Text>
      </View>
    );
  }

  const adjustedCategories: CategoryItem[] = [...categories];
  if (adjustedCategories.length % 2 !== 0) {
    adjustedCategories.push({
      id: "placeholder",
      label: "",
      image: null,
    });
  }

  const renderCategoryItem = ({ item }: { item: CategoryItem }) => {
    if (item.id === "placeholder") {
      return <View style={[styles.categoryItem, { backgroundColor: "transparent", shadowOpacity: 0, elevation: 0 }]} />;
    }

    return (
      <View style={styles.categoryItem}>
        <CIconButton
          icon={<Image source={item.image} style={styles.iconcategory} />}
          onSubmit={() => navigate(item.label)}
          style={{
            flex_direction: "column",
            width: "100%",
            height: 90,
            backColor: Color.white_homologous,
            textColor: Color.white_contrast,
            radius: 15,
          }}
        />
        <Text style={styles.textcategoryItem}>{item.label}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Color.white_contrast} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!user || !avt) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CHeader label="Danh mục" backPress={() => navigation.goBack()} />

      {/* Thông tin người dùng */}
      <View style={styles.infavatar}>
        <CIconButton
          label={user.displayName}
          icon={<Image source={{ uri: avt }} style={styles.avatar} />}
          onSubmit={() => navigationMenu.navigate("MyProfile", { screen: "MyProfile", params: { userId: userID! } })}
          style={{
            width: "90%",
            height: 60,
            backColor: Color.white_homologous,
            textColor: Color.white_contrast,
            radius: 15,
            flex_direction: "row",
            fontSize: 20,
            justifyContent: "flex-start",
          }}
        />
      </View>

      {/* Lối tắt - Nhóm của người dùng */}
      <View style={styles.shortcutsContainer}>
        <Text style={styles.sectionTitle}>Lối tắt</Text>
        <FlatList
          data={groups}
          renderItem={({ item }) => (
            <View style={styles.shortcut}>
              <CIconButton
                label={item.groupName}
                icon={<Image source={{ uri: item.avt?.url || DEFAULT_AVATAR }} style={styles.icon} />}
                onSubmit={() => navigateToGroup(item._id)}
                style={{
                  flex_direction: "column",
                  fontSize: 10,
                  width: "100%",
                  height: 100,
                }}
              />
            </View>
          )}
          horizontal={true}
        />
      </View>

      {/* Các danh mục chính */}
      <FlatList
        data={adjustedCategories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.mainCategories}
      />

      {/* Đăng xuất */}
      <View style={styles.logoutButton}>
        <CButton
          label="Đăng xuất"
          onSubmit={confirmLogout} // Gọi hàm xác nhận
          style={{
            width: 290,
            height: 50,
            backColor: Color.white_homologous,
            textColor: Color.white_contrast,
            radius: 15,
            fontSize: 18,
          }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.white_homologous,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 30,
    marginRight: 45,
  },
  infavatar: {
    shadowColor: Color.white_contrast,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    justifyContent: "flex-start",
    alignItems: "center",
    elevation: 5,
  },
  shortcutsContainer: {
    width: "90%",
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 20,
    marginTop: 10,
    marginBottom: 1,
    marginLeft: 15,
  },
  shortcut: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 1,
  },
  logoutButton: {
    marginBottom: 10,
    shadowColor: Color.white_contrast,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  icon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    elevation: 1,
    marginBottom: 3,
  },
  iconcategory: {
    width: 60,
    height: 60,
    marginBottom: 5,
  },
  mainCategories: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 10,
    marginBottom: 3,
  },
  textcategoryItem: {
    color: Color.white_contrast,
    fontSize: 16,
  },
  categoryItem: {
    width: "48%",
    height: 170,
    backgroundColor: Color.white_homologous,
    borderRadius: 15,
    marginHorizontal: 5,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Color.white_contrast,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 10,
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "red" },
});

export default Menu;