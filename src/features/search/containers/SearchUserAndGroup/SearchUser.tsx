// src/features/search/containers/SearchUser/SearchUser.tsx
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, Text } from "react-native";
import FriendCard from "@/src/features/friends/components/FriendCard";
import CButton from "@/src/shared/components/button/CButton";
import getColor from "@/src/styles/Color";
import { ButtonActions } from "@/src/features/friends/components/ActionsCard";
import restClient from "@/src/shared/services/RestClient";
import { MyPhoto } from "@/src/interface/interface_reference";
import { StackNavigationProp } from "@react-navigation/stack";
import { SearchStackParamList } from "@/src/shared/routes/SearchNavigation";
import { removeVietnameseTones } from "@/src/shared/utils/removeVietnameseTones";

const Color = getColor();

export interface Friend {
  _id: string;
  displayName: string;
  avt: MyPhoto[];
  aboutMe?: string;
}

interface SearchUserProps {
  textSearch: string;
  userId: string;
  navigation: StackNavigationProp<SearchStackParamList, "SearchUserAndGroup">;
}

const SearchUser: React.FC<SearchUserProps> = ({ textSearch, userId, navigation }) => {
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [allFriends, setAllFriends] = useState<Friend[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const toggleShowAllUsers = () => {
    setShowAllUsers(!showAllUsers);
  };

  const HandleButton = (_id: string) => {
    return ButtonActions({
      label: ["Xem trang cá nhân"],
      actions: [() => navigation.navigate("MyProfile", {
          screen: 'Profile',
          params: { userId: _id },
        })],
    });
  };

  const getAllFriends = async () => {
    try {
      setIsLoading(true);
      const result = await restClient.apiClient.service(`apis/users`).find({});
      if (result.success) {
        const filteredData = result.data.filter(
          (friend: Friend) => friend._id !== userId
        );
        setAllFriends(filteredData);
      } else {
        console.error("API trả về không thành công:", result);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bạn bè:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllFriends();
  }, []);

  const normalizedSearch = removeVietnameseTones(textSearch);

  const filteredFriends = allFriends
    ? allFriends.filter((item) => {
        const normalizedName = removeVietnameseTones(item?.displayName || "");
        return normalizedName.includes(normalizedSearch);
      })
    : [];

  return (
    <View style={styles.container}>
      {isLoading ? (
        <Text style={styles.loadingText}>Đang tải...</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {filteredFriends.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {textSearch
                  ? `Không tìm thấy người dùng nào cho "${textSearch}"`
                  : "Không tìm thấy người dùng"}
              </Text>
            </View>
          ) : (
            <>
              {filteredFriends.map((item) => (
                <View key={item._id} style={styles.boxCard}>
                  <FriendCard
                    _id={item._id}
                    name={item.displayName}
                    img={item.avt}
                    aboutMe={item.aboutMe || ""}
                    button={() => HandleButton(item._id)}
                    profile={true}
                  />
                </View>
              ))}
              {!showAllUsers && (
                <View style={styles.buttonContainer}>
                  <CButton
                    label="Xem thêm kết quả khác"
                    onSubmit={toggleShowAllUsers}
                    style={{
                      width: "100%",
                      height: 40,
                      backColor: Color.mainColor1,
                      textColor: Color.white_homologous,
                      fontSize: 14,
                      fontWeight: "bold",
                      radius: 20,
                      flex_direction: "row",
                    }}
                  />
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.backGround,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 10,
    paddingBottom: 20,
  },
  boxCard: {
    width: "95%",
    alignSelf: "center",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: Color.textColor1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Color.textColor3,
    fontStyle: "italic",
    textAlign: "center",
  },
  buttonContainer: {
    width: "80%",
    alignSelf: "center",
    marginVertical: 10,
  },
});

export default SearchUser;