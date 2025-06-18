import CButton from "@/src/shared/components/button/CButton";
import CIconButton from "@/src/shared/components/button/CIconButton";
import CHeader from "@/src/shared/components/header/CHeader";
import { MenuStackParamList } from "@/src/shared/routes/MenuNavigation";
import { TabbarStackParamList } from "@/src/shared/routes/TabbarBottom";
import restClient from "@/src/shared/services/RestClient";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Image } from 'expo-image';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { useMenu } from "./useMenu";
import { useAuth } from "@/AuthContext";

type SettingNavigationProp = StackNavigationProp<TabbarStackParamList, "Menu">;
type MenuNavigationProp = StackNavigationProp<MenuStackParamList, "Menu">;

interface CategoryItem {
  id: string;
  label: string;
  image: any;
}

const Menu = () => {
  useTheme();
  const { logout } = useAuth();
  const navigation = useNavigation<SettingNavigationProp>();
  const navigationMenu = useNavigation<MenuNavigationProp>();
  const [userID, setUserID] = useState<string | null>(null);

  // Function to get userID from AsyncStorage
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

  // Function to handle logout
  const handleLogout = async () => {
    try {
      if (!userID) {
        Alert.alert("Lỗi", "Không tìm thấy userId");
        return;
      }

      const accountClient = restClient.apiClient.service("apis/accounts");
      const result = await accountClient.logout();
      if (result){
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

        setUserID(null);
        restClient.apiClient.token = "";

        logout();

      }
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi trong quá trình đăng xuất");
    }
  };

  // Confirm logout
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

  // Render loading state if userID is not yet loaded
  if (!userID) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: Color.background }]}>
        <ActivityIndicator size="large" color={Color.textPrimary} />
        <Text style={{ color: Color.textPrimary, marginTop: 10 }}>Đang tải thông tin người dùng...</Text>
      </View>
    );
  }

  // Adjust categories for even columns if needed
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
      return (
        <View style={[styles.categoryItem, { backgroundColor: "transparent", shadowOpacity: 0, elevation: 0 }]} />
      );
    }

    return (
      <View style={[styles.categoryItem, { backgroundColor: Color.backgroundSecondary, shadowColor: Color.textSecondary }]}>
        <CIconButton
          icon={<Image source={item.image} style={styles.iconcategory} />}
          onSubmit={() => navigate(item.label)}
          style={{
            flex_direction: "column",
            width: "100%",
            height: 90,
            backColor: Color.backgroundSecondary,
            textColor: Color.textPrimary,
            radius: 15,
          }}
        />
        <Text style={[styles.textcategoryItem, { color: Color.textPrimary }]}>{item.label}</Text>
      </View>
    );
  };

  // Render loading state based on useMenu hook
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: Color.background }]}>
        <ActivityIndicator size="large" color={Color.textPrimary} />
      </View>
    );
  }

  // Render error state
  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: Color.background }]}>
        <Text style={[styles.errorText, { color: Color.error }]}>{error}</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: Color.background }]}>
        <ActivityIndicator size="large" color={Color.textPrimary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Color.background }]}>
      <CHeader label="Danh mục" backPress={() => navigation.goBack()} />

      {/* User Information Section */}
      <View style={[styles.infavatar, { shadowColor: Color.textSecondary }]}>
        <CIconButton
          label={user.displayName}
          icon={<Image source={avt? { uri: avt } : require('@/src/assets/images/default/default_user.png')} style={styles.avatar} />}
          onSubmit={() => navigationMenu.navigate("MyProfile", { screen: "MyProfile", params: { userId: userID! } })}
          style={{
            width: "90%",
            height: 60,
            backColor: Color.backgroundSecondary,
            textColor: Color.textPrimary,
            radius: 15,
            flex_direction: "row",
            fontSize: 20,
            justifyContent: "flex-start",
          }}
        />
      </View>

      {/* Shortcuts - User's Groups Section */}
      <View style={styles.shortcutsContainer}>
        <Text style={[styles.sectionTitle, { color: Color.textPrimary }]}>Lối tắt</Text>
        <FlatList
          data={groups}
          renderItem={({ item }) => (
            <View style={styles.shortcut}>
              <CIconButton
                label={item.groupName}
                icon={<Image source={item.avt? { uri: item.avt.url } : require('@/src/assets/images/default/default_page.jpg')} style={styles.icon} />}
                onSubmit={() => navigateToGroup(item._id)}
                style={{
                  flex_direction: "column",
                  fontSize: 10,
                  width: "100%",
                  height: 100,
                  backColor: Color.backgroundSecondary, // Use backgroundSecondary for shortcut buttons
                  textColor: Color.textPrimary,
                }}
              />
            </View>
          )}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item._id}
        />
      </View>

      {/* Main Categories Section */}
      <FlatList
        data={adjustedCategories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.mainCategories}
      />

      {/* Logout Section */}
      <View style={[styles.logoutButton, { shadowColor: Color.textSecondary }]}>
        <CButton
          label="Đăng xuất"
          onSubmit={confirmLogout}
          style={{
            width: 290,
            height: 50,
            backColor: Color.gray1, // Using mainColor2 for primary action
            textColor: Color.black,
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
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 30,
    marginRight: 45,
  },
  infavatar: {
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
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    marginTop: 10,
    marginBottom: 1,
    marginLeft: 15,
    fontWeight: 'bold',
  },
  shortcut: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
    width: 80,
    height: 100,
  },
  logoutButton: {
    marginBottom: 10,
    borderRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    padding: 20
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
    justifyContent: "center",
    alignItems: 'flex-start',
    width: "100%",
    paddingHorizontal: 5,
    marginBottom: 3,
  },
  textcategoryItem: {
    fontSize: 16,
    marginTop: 5,
  },
  categoryItem: {
    width: "47%",
    height: 170,
    borderRadius: 15,
    marginHorizontal: '1.5%',
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
  },
});

export default Menu;