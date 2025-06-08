import CButton from "@/src/shared/components/button/CButton";
import MessageModal from "@/src/shared/components/form-message-addfriend/AddMessages";
import CHeader from "@/src/shared/components/header/CHeader";
import TabbarTop, { TabProps } from "@/src/shared/components/tabbar-top/TabbarTop";
import useScrollTabbar from "@/src/shared/components/tabbar/useScrollTabbar";
import { SearchStackParamList } from "@/src/shared/routes/SearchNavigation";
import restClient from "@/src/shared/services/RestClient";
import getColor from "@/src/styles/Color";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Image } from 'expo-image';
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ProfileImages from "./images/ProfileImages";
import ProfilePost from "./post/ProfilePost";
import ViewAllVideo from "./video/ViewAllVideo";

const Color = getColor();
const UsersClient = restClient.apiClient.service("apis/users");
const myPhotosClient = restClient.apiClient.service("apis/myphotos");
const DEFAULT_AVATAR = "https://picsum.photos/200/300";

type ProfileRouteProp = RouteProp<SearchStackParamList, "Profile">;
type ProfileNavigationProp = StackNavigationProp<SearchStackParamList, "Profile" >;

interface ProfileProps {
  route: ProfileRouteProp;
  navigation: ProfileNavigationProp;
}

const Profile: React.FC<ProfileProps> = ({ route, navigation }) => {
  const { userId } = route.params;
  const [user, setUser] = useState<any>(null);
  const [avt, setAvt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [friendRequestSent, setFriendRequestSent] = useState<boolean>(false);
  const [friendRequestId, setFriendRequestId] = useState<string | null>(null);
  const [hasReceivedRequest, setHasReceivedRequest] = useState<boolean>(false);
  const [receivedRequestId, setReceivedRequestId] = useState<string | null>(null);
  const [showFormAddFriend, setShowFormAddFriend] = useState<boolean>(false);
  const [canViewProfile, setCanViewProfile] = useState<boolean>(true);
  const [isFriend, setIsFriend] = useState<boolean>(false); // Tách isFriend thành state riêng

  const tabs: TabProps[] = [
    { label: "Hình ảnh" },
    { label: "Video" },
    { label: "Bài viết" },
  ];
  const [currTab, setCurrTab] = useState<string>(tabs.length > 0 ? tabs[0].label : "");
  const { tabbarPosition, handleScroll } = useScrollTabbar();

  const getCurrentUserId = async () => {
    try {
      const id = await AsyncStorage.getItem("userId");
      setCurrentUserId(id);
      return id;
    } catch (err) {
      console.error("Lỗi khi lấy currentUserId:", err);
      return null;
    }
  };

  const getUser = async (userID: string) => {
    try {
      setLoading(true);
      const userData = await UsersClient.get(userID);
      if (userData.success) {
        setUser(userData.data);
        if (userData.data.avt.length > 0) {
          const myAvt = await myPhotosClient.get(userData.data.avt[userData.data.avt.length - 1]);
          setAvt(myAvt.data.url);
        } else {
          setAvt(DEFAULT_AVATAR);
        }
      } else {
        throw new Error("Không thể lấy dữ liệu người dùng");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi tải thông tin người dùng");
      console.error("Lỗi khi lấy thông tin người dùng:", err);
    } finally {
      setLoading(false);
    }
  };

  const checkFriendRequest = async (currentUserId: string) => {
    try {
      const senderAPI = restClient.apiClient.service("apis/add-friends/sender");
      const senderResult = await senderAPI.get(currentUserId);
      if (senderResult.success) {
        const sentRequest = senderResult.data?.find(
          (req: any) => req.receiver._id === userId && req.addFriend.status === "pending"
        );
        if (sentRequest) {
          setFriendRequestSent(true);
          setFriendRequestId(sentRequest.addFriend._id);
        }
      }

      const receiverAPI = restClient.apiClient.service("apis/add-friends/receive");
      const receiverResult = await receiverAPI.get(currentUserId);
      if (receiverResult.success) {
        const receivedRequest = receiverResult.data?.find(
          (req: any) => req.sender._id === userId && req.addFriend.status === "pending"
        );
        if (receivedRequest) {
          setHasReceivedRequest(true);
          setReceivedRequestId(receivedRequest.addFriend._id);
        }
      }
    } catch (err) {
      console.error("Lỗi khi kiểm tra yêu cầu kết bạn:", err);
    }
  };

  // Kiểm tra isFriend và canViewProfile khi user hoặc currentUserId thay đổi
  useEffect(() => {
    if (user && currentUserId) {
      const friendStatus = user.friends?.includes(currentUserId) || false;
      setIsFriend(friendStatus);
      const isProfileVisible = user.setting?.profileVisibility ?? true;
      const isOwner = currentUserId === userId;
      setCanViewProfile(isProfileVisible || friendStatus || isOwner);
    }
  }, [user, currentUserId, userId]);

  useEffect(() => {
    const initialize = async () => {
      const id = await getCurrentUserId();
      if (userId) {
        await getUser(userId);
      }
      if (id && userId) {
        await checkFriendRequest(id);
      }
    };
    initialize();
  }, [userId]);

  const followersCount = user?.followers?.length || 0;
  const friendsCount = user?.friends?.length || 0;
  const followingCount = user?.following?.length || 0;

  const isFollowing = currentUserId && user?.followers?.includes(currentUserId);

  const handleFriendRequest = async () => {
    if (!currentUserId || !userId) {
      Alert.alert("Lỗi", "Không thể xác định thông tin người dùng");
      return;
    }

    try {
      const friendsAPI = restClient.apiClient.service("apis/add-friends");

      if (isFriend) {
        Alert.alert(
          "Hủy kết bạn",
          `Bạn có chắc muốn hủy kết bạn với ${user.displayName}?`,
          [
            { text: "Hủy", style: "cancel" },
            {
              text: "Xác nhận",
              onPress: async () => {
                try {
                  const unfriendAPI = restClient.apiClient.service(`apis/users/${currentUserId}/unfriend`);
                  const result = await unfriendAPI.patch("", { friendId: userId });

                  if (result.success) {
                    setUser((prev: any) => ({
                      ...prev,
                      friends: (prev.friends || []).filter((id: string) => id !== currentUserId),
                    }));
                    setIsFriend(false); // Cập nhật trạng thái bạn bè
                    setFriendRequestSent(false);
                    setFriendRequestId(null);
                    setHasReceivedRequest(false);
                    setReceivedRequestId(null);
                    Alert.alert("Thành công", "Đã hủy kết bạn!");
                    // Cập nhật quyền xem hồ sơ
                    setCanViewProfile(user?.setting?.profileVisibility || currentUserId === userId);
                  } else {
                    throw new Error("Không thể hủy kết bạn");
                  }
                } catch (err) {
                  console.error("Lỗi khi hủy kết bạn:", err);
                  Alert.alert("Lỗi", "Không thể hủy kết bạn");
                }
              },
            },
          ]
        );
      } else if (hasReceivedRequest && receivedRequestId) {
        Alert.alert(
          "Xác nhận kết bạn",
          `Bạn có muốn chấp nhận yêu cầu kết bạn từ ${user.displayName}?`,
          [
            { text: "Hủy", style: "cancel" },
            {
              text: "Chấp nhận",
              onPress: async () => {
                try {
                  const result = await friendsAPI.patch(receivedRequestId, {
                    status: "approved",
                  });

                  if (result.success) {
                    await getUser(userId); // Làm mới dữ liệu user để cập nhật friends
                    setHasReceivedRequest(false);
                    setReceivedRequestId(null);
                    setFriendRequestSent(false);
                    setFriendRequestId(null);
                    setIsFriend(true); // Cập nhật trạng thái bạn bè
                    setCanViewProfile(true); // Cập nhật quyền xem hồ sơ
                    Alert.alert("Thành công", `Bạn và ${user.displayName} đã trở thành bạn bè!`);
                  } else {
                    throw new Error("Không thể xác nhận yêu cầu");
                  }
                } catch (err) {
                  console.error("Lỗi khi xác nhận yêu cầu:", err);
                  Alert.alert("Lỗi", "Không thể xác nhận yêu cầu kết bạn");
                }
              },
            },
            {
              text: "Từ chối",
              onPress: async () => {
                try {
                  const result = await friendsAPI.patch(receivedRequestId, {
                    status: "rejected",
                  });

                  if (result.success) {
                    setHasReceivedRequest(false);
                    setReceivedRequestId(null);
                    Alert.alert("Thành công", "Đã từ chối yêu cầu kết bạn!");
                  } else {
                    throw new Error("Không thể từ chối yêu cầu");
                  }
                } catch (err) {
                  console.error("Lỗi khi từ chối yêu cầu:", err);
                  Alert.alert("Lỗi", "Không thể từ chối yêu cầu kết bạn");
                }
              },
            },
          ]
        );
      } else {
        setShowFormAddFriend(true);
      }
    } catch (err) {
      console.error("Lỗi khi xử lý yêu cầu bạn bè:", err);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi xử lý yêu cầu bạn bè");
    }
  };

  const postAddFriend = async (message: string) => {
    const friendsAPI = restClient.apiClient.service("apis/add-friends");
    const result = await friendsAPI.create({
      senderId: currentUserId,
      receiverId: userId,
      message: message,
    });
    if (result.success) {
      setFriendRequestSent(true);
      setFriendRequestId(result.data._id);
      Alert.alert("Thành công", "Yêu cầu kết bạn đã được gửi!");
    } else {
      throw new Error("Không thể gửi yêu cầu kết bạn");
    }
  };

  const formAddMessage = (message: string) => {
    setShowFormAddFriend(false);
    postAddFriend(message);
  };

  const handleFollowRequest = async () => {
    if (!currentUserId || !userId) return;
    try {
      const targetUserData = await UsersClient.get(userId);
      if (!targetUserData.success) {
        throw new Error("Không thể lấy dữ liệu người dùng được theo dõi");
      }
      const currentUserData = await UsersClient.get(currentUserId);
      if (!currentUserData.success) {
        throw new Error("Không thể lấy dữ liệu người dùng hiện tại");
      }

      if (!isFollowing) {
        const updatedFollowers = [...(targetUserData.data.followers || []), currentUserId];
        const followerResponse = await UsersClient.patch(userId, {
          followers: updatedFollowers,
        });
        const updatedFollowing = [...(currentUserData.data.following || []), userId];
        const followingResponse = await UsersClient.patch(currentUserId, {
          following: updatedFollowing,
        });

        if (followerResponse.success && followingResponse.success) {
          setUser((prev: any) => ({
            ...prev,
            followers: updatedFollowers,
          }));
        } else {
          throw new Error("Không thể theo dõi");
        }
      } else {
        const updatedFollowers = (targetUserData.data.followers || []).filter(
          (id: string) => id !== currentUserId
        );
        const followerResponse = await UsersClient.patch(userId, {
          followers: updatedFollowers,
        });
        const updatedFollowing = (currentUserData.data.following || []).filter(
          (id: string) => id !== userId
        );
        const followingResponse = await UsersClient.patch(currentUserId, {
          following: updatedFollowing,
        });

        if (followerResponse.success && followingResponse.success) {
          setUser((prev: any) => ({
            ...prev,
            followers: updatedFollowers,
          }));
        } else {
          throw new Error("Không thể hủy theo dõi");
        }
      }
    } catch (err) {
      console.error("Lỗi khi xử lý yêu cầu theo dõi:", err);
      setError("Không thể xử lý yêu cầu theo dõi");
    }
  };

  const handleMessage = () => {
    if (!currentUserId || !userId) {
      Alert.alert("Lỗi", "Không thể xác định thông tin người dùng");
      return;
    }
    if (!user?.setting?.allowMessagesFromStrangers && !isFriend && currentUserId !== userId) {
      Alert.alert("Lỗi", "Người dùng này chỉ cho phép bạn bè nhắn tin.");
      return;
    }
  };

  return (
    <ScrollView style={styles.container} onScroll={handleScroll}>
      <CHeader label={user?.displayName || "Hồ sơ"} backPress={() => navigation.goBack()} />
      <View style={styles.profileInfo}>
        {loading ? (
          <Text style={styles.bio}>Đang tải...</Text>
        ) : error ? (
          <Text style={styles.bio}>{error}</Text>
        ) : !user ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không tìm thấy thông tin người dùng</Text>
          </View>
        ) : !canViewProfile ? (
          <View style={styles.emptyContainer}>
            <Image source={{ uri: avt || DEFAULT_AVATAR }} style={styles.profileImage} />
            <Text style={styles.name}>{user?.displayName || "Không có tên"}</Text>
            <Text style={styles.emptyText}>
              Hồ sơ này không công khai. Vui lòng kết bạn để xem thêm thông tin.
            </Text>
            <View style={styles.buttonContainer}>
              <CButton
                label={friendRequestSent ? "Đã gửi kết bạn" : "Kết bạn"}
                onSubmit={handleFriendRequest}
                style={{
                  width: "100%",
                  height: 40,
                  backColor: friendRequestSent ? Color.textColor3 : Color.mainColor1,
                  textColor: Color.white_homologous,
                  fontSize: 14,
                  fontWeight: "bold",
                  radius: 20,
                  flex_direction: "row",
                }}
              />
            </View>
          </View>
        ) : (
          <>
            <Image
              source={{ uri: avt || DEFAULT_AVATAR }}
              style={styles.profileImage}
            />
            <Text style={styles.name}>{user?.displayName || "Không có tên"}</Text>
            <Text style={styles.bio}>{user?.aboutMe || " "}</Text>
            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Người theo dõi</Text>
                <Text style={styles.statValue}>{followersCount}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Bạn bè</Text>
                <Text style={styles.statValue}>{friendsCount}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Đang theo dõi</Text>
                <Text style={styles.statValue}>{followingCount}</Text>
              </View>
            </View>
          </>
        )}
      </View>
      {!loading && !error && user && canViewProfile && (
        <View style={styles.container2}>
          <View style={styles.buttonContainer}>
            <CButton
              label={
                isFriend
                  ? "Bạn bè"
                  : hasReceivedRequest
                  ? "Xác nhận"
                  : friendRequestSent
                  ? "Đã gửi kết bạn"
                  : "Kết bạn"
              }
              onSubmit={handleFriendRequest}
              style={{
                width: "100%",
                height: 40,
                backColor:
                  isFriend || friendRequestSent || hasReceivedRequest
                    ? Color.textColor3
                    : Color.mainColor1,
                textColor: Color.white_homologous,
                fontSize: 14,
                fontWeight: "bold",
                radius: 20,
                flex_direction: "row",
              }}
            />
          </View>
          <View style={styles.buttonContainer}>
            <CButton
              label={isFollowing ? "Đang theo dõi" : "Theo dõi"}
              onSubmit={handleFollowRequest}
              style={{
                width: "100%",
                height: 40,
                backColor: isFollowing ? Color.textColor3 : Color.mainColor1,
                textColor: Color.white_homologous,
                fontSize: 14,
                fontWeight: "bold",
                radius: 20,
                flex_direction: "row",
              }}
            />
          </View>
          <View style={styles.buttonContainer}>
            <CButton
              label="Nhắn tin"
              onSubmit={handleMessage}
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
        </View>
      )}
      {!loading && !error && user && canViewProfile && (
        <View style={{ flex: 1, backgroundColor: Color.backGround }}>
          <View style={{ width: "100%", height: "100%" }}>
            <TabbarTop tabs={tabs} startTab={currTab} setTab={setCurrTab} />
            {currTab === tabs[0].label ? (
              <ProfileImages userId={userId || ""} />
            ) : currTab === tabs[1].label ? (
              <ViewAllVideo userId={userId} />
            ) : (
              <ProfilePost userId={userId} />
            )}
          </View>
        </View>
      )}
      <MessageModal visible={showFormAddFriend} onClose={() => setShowFormAddFriend(false)} onSend={formAddMessage} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.white_homologous,
  },
  container2: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    alignItems: "center",
    gap: 10,
    backgroundColor: Color.white_homologous,
    paddingHorizontal: 10,
  },
  profileInfo: {
    alignItems: "center",
    marginTop: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  bio: {
    textAlign: "center",
    fontSize: 16,
    width: "70%",
    marginVertical: 10,
    color: Color.textColor4,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    alignSelf: "center",
    marginTop: 10,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 14,
    color: Color.textColor4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: Color.white_contrast,
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
    marginVertical: 10,
  },
  buttonContainer: {
    width: "30%",
    alignSelf: "center",
  },
});

export default Profile;