import CHeader from "@/src/shared/components/header/CHeader";
import { ProfileStackParamList } from "@/src/shared/routes/ProfileNavigation";
import restClient from '@/src/shared/services/RestClient';
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Image } from 'expo-image';
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from '@/src/contexts/ThemeContext'; // Import useTheme
import { colors as Color } from '@/src/styles/DynamicColors'; // Import Color

type ProfileNavigationProp = StackNavigationProp<ProfileStackParamList, "EditProfile">;

const UsersClient = restClient.apiClient.service("apis/users");
const myPhotosClient = restClient.apiClient.service("apis/myphotos");

const EditProfile = () => {
  useTheme(); // Sử dụng hook useTheme để Color được cập nhật động
  const navigation = useNavigation<ProfileNavigationProp>();
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [newAvatarUri, setNewAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Lưu trạng thái ban đầu
  const [initialDisplayName, setInitialDisplayName] = useState("");
  const [initialBio, setInitialBio] = useState("");
  const [initialAvatar, setInitialAvatar] = useState<string | null>(null);
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
        let fetchedAvatar = null;
        
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
      setNewAvatarUri(result.assets[0].uri); 
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
          setInitialAvatar(uploadResponse.data.url); 
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
    <View style={{ flex: 1, backgroundColor: Color.background }}>
      <CHeader label="Chỉnh sửa hồ sơ" backPress={() => navigation.goBack()} 
        labelColor={Color.mainColor2}
        iconColor={Color.textPrimary} 
      />
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={Color.mainColor2} />
        </View>
      ) : error ? (
        <Text style={{ color: Color.error, textAlign: "center", margin: 20 }}>{error}</Text>
      ) : (
        <View style={styles.content}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handleImageSelection}>
          <Image
            source={
              newAvatarUri ? { uri: newAvatarUri } :
              avatar ? { uri: avatar } :
              require('@/src/assets/images/default/default_user.png')
            }
            style={styles.avatar}
          />
            <View style={[styles.cameraIcon, { backgroundColor: Color.white_white }]}>
              <MaterialIcons name="photo-camera" size={32} color={Color.mainColor2} />
            </View>
          </TouchableOpacity>
          <TextInput
            style={[styles.input, { borderColor: Color.border, color: Color.textPrimary, backgroundColor: Color.backgroundTertiary }]}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Tên của bạn"
            placeholderTextColor={Color.textTertiary}
          />
          <TextInput
            style={[styles.input, styles.bioInput, { borderColor: Color.border, color: Color.textPrimary, backgroundColor: Color.backgroundTertiary }]}
            value={bio}
            onChangeText={setBio}
            placeholder="Giới thiệu về bạn"
            placeholderTextColor={Color.textTertiary}
            multiline
            numberOfLines={4}
          />
          {hasChanges && (
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: Color.mainColor2 }]} 
              onPress={handleSaveChanges} 
              disabled={loading}
            >
              <Text style={[styles.saveButtonText, { color: Color.textOnMain1 }]}>
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
  container: { 
    flex: 1, 
  },
  content: { 
    padding: 20, 
    alignItems: "center" 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  errorText: { 
    textAlign: "center", 
    margin: 20 
  },
  avatarContainer: { 
    position: "relative", 
    marginBottom: 20 
  },
  avatar: { 
    width: 150, 
    height: 150, 
    borderRadius: 75, 
    borderWidth: 2, 
  },
  cameraIcon: { 
    position: "absolute", 
    bottom: 0, 
    right: 0, 
    borderRadius: 16, 
    padding: 2 
  },
  input: { 
    width: "100%", 
    borderWidth: 1, 
    borderRadius: 8, 
    padding: 12, 
    marginBottom: 15, 
    fontSize: 16,
  },
  bioInput: { 
    height: 120, 
    textAlignVertical: "top" 
  },
  saveButton: { 
    paddingVertical: 15, 
    paddingHorizontal: 30, 
    borderRadius: 8, 
    width: "100%", 
    alignItems: "center" 
  },
  saveButtonText: { 
    fontSize: 16, 
    fontWeight: "bold" 
  },
});

export default EditProfile;