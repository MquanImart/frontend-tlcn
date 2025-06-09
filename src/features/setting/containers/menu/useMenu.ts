import { Group } from "@/src/features/newfeeds/interface/article";
import { User } from "@/src/interface/interface_reference";
import { MenuStackParamList } from "@/src/shared/routes/MenuNavigation";
import restClient from "@/src/shared/services/RestClient";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useEffect, useState } from "react";

type MenuNavigationProp = StackNavigationProp<MenuStackParamList, "Menu">;
const UsersClient = restClient.apiClient.service("apis/users");
const myPhotosClient = restClient.apiClient.service("apis/myphotos");

interface CategoryItem {
  id: string;
  label: string;
  image: any;
}

export const useMenu = (userID: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [avt, setAvt] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false); // Bắt đầu với false
  const [error, setError] = useState<string | null>(null);
  const navigationMenu = useNavigation<MenuNavigationProp>();

  const getUser = async (userID: string) => {
    try {
      const userData = await UsersClient.get(userID);
      if (userData.success) {
        setUser(userData.data);
        if (userData.data.avt.length > 0) {
          const myAvt = await myPhotosClient.get(userData.data.avt[userData.data.avt.length - 1]);
          setAvt(myAvt.data.url);
        } else {
          setAvt(null);
        }
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi tải thông tin người dùng");
      console.error("Error in getUser:", err);
    }
  };

  const getGroups = async (userID: string) => {
    try {
      const groupsData = await UsersClient.get(`${userID}/my-groups`);
      if (groupsData.success) {
        setGroups(groupsData.data);
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi tải danh sách nhóm");
      console.error("Error in getGroups:", err);
    }
  };

  const fetchData = async () => {
    // Chỉ gọi API nếu userID hợp lệ
    if (!userID || userID.trim() === "") {
      console.log("userID không hợp lệ, không gọi API");
      return;
    }

    setLoading(true);
    await Promise.all([getUser(userID), getGroups(userID)]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [userID]); // Thêm userID vào dependency array

  const categories: CategoryItem[] = [
    { id: "1", label: "Bộ sưu tập", image: require("../../../../assets/images/Menu/Bosuutam.png") },
    { id: "2", label: "Nhóm", image: require("../../../../assets/images/Menu/Nhom.png") },
    { id: "3", label: "Cài đặt", image: require("../../../../assets/images/Menu/Caidat.png") },
    { id: "4", label: "Bạn bè", image: require("../../../../assets/images/Menu/friend.png") },
    { id: "5", label: "Thời tiết", image: require("../../../../assets/images/Menu/weather.png") },
    { id: "6", label: "Bản đồ", image: require("../../../../assets/images/Menu/map.png") },
    { id: "7", label: "Du lịch", image: require("../../../../assets/images/Menu/page.png") },
  ];

  const navigate = (label: string) => {
    switch (label) {
      case "Bộ sưu tập":
        navigationMenu.navigate("Collections");
        break;
      case "Nhóm":
        navigationMenu.navigate("Groups");
        break;
      case "Cài đặt":
        navigationMenu.navigate("Setting");
        break;
      case "Bạn bè":
        navigationMenu.navigate("Friends");
        break;
      case "Thời tiết":
        navigationMenu.navigate("Weather");
        break;
      case "Bản đồ":
        navigationMenu.navigate("Map");
        break;
      case "Du lịch":
        navigationMenu.navigate("PageNavigation", { screen: "MyPage",});
        break;
    }
  };

  const navigateToGroup = (groupId: string) => {
    if (!userID) {
      console.error("Không tìm thấy userID để điều hướng đến GroupDetailsScreen");
      return;
    }
    navigationMenu.navigate("GroupDetailsScreen", {
      groupId,
      currentUserId: userID,
    });
  };

  return { user, avt, groups, loading, error, categories, navigate, navigateToGroup };
};