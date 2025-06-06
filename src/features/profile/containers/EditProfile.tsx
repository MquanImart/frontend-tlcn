import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { StackNavigationProp } from "@react-navigation/stack";
import { ProfileStackParamList } from "@/src/shared/routes/ProfileNavigation";
import { useNavigation } from "@react-navigation/native";
import CHeader from "@/src/shared/components/header/CHeader";
import restClient from '@/src/shared/services/RestClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ProfileNavigationProp = StackNavigationProp<ProfileStackParamList, "EditProfile">;

const UsersClient = restClient.apiClient.service("apis/users");
const myPhotosClient = restClient.apiClient.service("apis/myphotos");
const DEFAULT_AVATAR = "https://picsum.photos/200/300";

const EditProfile = () => {
  const navigation = useNavigation<ProfileNavigationProp>();
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Lưu trạng thái ban đầu
  const [initialDisplayName, setInitialDisplayName] = useState("");
  const [initialBio, setInitialBio] = useState("");
  const [initialAvatar, setInitialAvatar] = useState(DEFAULT_AVATAR);
  const [hasChanges, setHasChanges] = useState(false);

  const getUserId = async () => {
    try {
      const id = await AsyncStorage.getItem("userId");
      setUserId(id);
    } catch (err) {
      console.error("Lỗi khi lấy userId:", err);
    }
  };

  const fetchUserData = async (id: string) => {
    try {
      setLoading(true);
      const userData = await UsersClient.get(id);
      if (userData.success) {
        const fetchedDisplayName = userData.data.displayName || "";
        const fetchedBio = userData.data.aboutMe || "";
        let fetchedAvatar = DEFAULT_AVATAR;
        
        if (userData.data.avt?.length > 0) {
          const myAvt = await myPhotosClient.get(userData.data.avt[userData.data.avt.length - 1]);
          fetchedAvatar = myAvt.data.url;
        }

        // Cập nhật giá trị hiện tại và ban đầu
        setDisplayName(fetchedDisplayName);
        setBio(fetchedBio);
        setAvatar(fetchedAvatar);
        setInitialDisplayName(fetchedDisplayName);
        setInitialBio(fetchedBio);
        setInitialAvatar(fetchedAvatar);
      }
    } catch (err) {
      setError("Không thể tải dữ liệu hồ sơ");
      console.error("Lỗi khi lấy dữ liệu người dùng:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelection = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Cần quyền truy cập thư viện ảnh!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setNewAvatarUri(result.assets[0].uri); // Lưu tạm URI của ảnh mới
    }
  };

  const handleSaveChanges = async () => {
    if (!userId) return;
    try {
      setLoading(true);

      let avatarId = null;
      if (newAvatarUri) {
        const formData = new FormData();
        formData.append("idAuthor", userId);
        formData.append("type", "img");
        formData.append("folderType", "users");
        formData.append("referenceId", userId);
        formData.append("file", {
          uri: newAvatarUri,
          type: "image/jpeg",
          name: `avatar_${userId}.jpg`,
        } as any);

        const uploadResponse = await myPhotosClient.create(formData);

        if (uploadResponse.success) {
          avatarId = uploadResponse.data._id;
          setAvatar(uploadResponse.data.url);
          setNewAvatarUri(null);
          setInitialAvatar(uploadResponse.data.url); // Cập nhật trạng thái ban đầu sau khi lưu
        } else {
          throw new Error("Không thể upload ảnh");
        }
      }

      const updateData: { displayName: string; aboutMe: string; avt?: string[] } = {
        displayName,
        aboutMe: bio,
      };
      if (avatarId) {
        updateData.avt = [avatarId];
      }

      const response = await UsersClient.patch(userId, updateData);
      if (response.success) {
        // Cập nhật trạng thái ban đầu sau khi lưu thành công
        setInitialDisplayName(displayName);
        setInitialBio(bio);
        setHasChanges(false);
        navigation.goBack();
      } else {
        throw new Error("Không thể lưu thay đổi");
      }
    } catch (err) {
      setError("Lỗi khi lưu thay đổi");
      console.error("Lỗi khi lưu hồ sơ:", err);
    } finally {
      setLoading(false);
    }
  };

  // Theo dõi sự thay đổi
  useEffect(() => {
    const isChanged =
      displayName !== initialDisplayName ||
      bio !== initialBio ||
      (newAvatarUri !== null && newAvatarUri !== initialAvatar);
    setHasChanges(isChanged);
  }, [displayName, bio, newAvatarUri, initialDisplayName, initialBio, initialAvatar]);

  useEffect(() => {
    getUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserData(userId);
    }
  }, [userId]);

  return (
    <View style={styles.container}>
      <CHeader label="Chỉnh sửa hồ sơ" backPress={() => navigation.goBack()} />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4B164C" />
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <View style={styles.content}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handleImageSelection}>
            <Image source={{ uri: newAvatarUri || avatar }} style={styles.avatar} />
            <View style={styles.cameraIcon}>
              <MaterialIcons name="photo-camera" size={32} color="#4B164C" />
            </View>
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Tên của bạn"
            placeholderTextColor="#999"
          />
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="Giới thiệu về bạn"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
          />
          {hasChanges && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges} disabled={loading}>
              <Text style={styles.saveButtonText}>
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 20, alignItems: "center" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "red", textAlign: "center", margin: 20 },
  avatarContainer: { position: "relative", marginBottom: 20 },
  avatar: { width: 150, height: 150, borderRadius: 75, borderWidth: 2, borderColor: "#4B164C" },
  cameraIcon: { position: "absolute", bottom: 0, right: 0, backgroundColor: "white", borderRadius: 16, padding: 2 },
  input: { width: "100%", borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16 },
  bioInput: { height: 120, textAlignVertical: "top" },
  saveButton: { backgroundColor: "#4B164C", paddingVertical: 15, paddingHorizontal: 30, borderRadius: 8, width: "100%", alignItems: "center" },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});

export default EditProfile;