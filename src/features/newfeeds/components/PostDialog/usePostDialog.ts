import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import restClient from "@/src/shared/services/RestClient";
import { Address } from "@/src/interface/interface_reference";
import { Alert } from "react-native";
import MapPickerDialog from "../MapPickerDialog/MapPickerDialog";
import env from "@/env";

const articlesClient = restClient.apiClient.service("apis/articles");

const usePostDialog = (userId: string) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [privacy, setPrivacy] = useState<"Công khai" | "Bạn bè" | "Riêng tư">("Công khai");
  const [selectedImages, setSelectedImages] = useState<{ uri: string; type: "image" | "video" }[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pageID, setPageID] = useState<string | null>(null);
  const [groupID, setGroupID] = useState<string | null>(null);
  const [location, setLocation] = useState<{
    coords: { latitude: number; longitude: number } | null;
    address: Address | null;
  }>({ coords: null, address: null });
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [isMapPickerVisible, setMapPickerVisible] = useState(false);

  const checkTextContent = async (text: string): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // Timeout 10s

      const response = await fetch(`${env.API_URL_CHECK_TOXIC}/check-text/`, {
        method: "POST",
        headers: {
          "X-API-Key": env.API_KEY_CHECK_TOXIC || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data.contains_bad_word || false;
    } catch (error: any) {
      console.error("❌ Lỗi kiểm tra văn bản:", error.message, error.stack);
      if (error.name === "AbortError") {
        Alert.alert("Lỗi", "Yêu cầu kiểm tra văn bản hết thời gian. Vui lòng thử lại!");
      } else {
        Alert.alert("Lỗi", "Không thể kiểm tra nội dung văn bản. Vui lòng kiểm tra kết nối mạng và thử lại!");
      }
      return true; // Coi là nhạy cảm để an toàn
    }
  };

  // Hàm kiểm tra hình ảnh
  const checkMediaContent = async (media: { uri: string; type: "image" | "video" }): Promise<boolean> => {
    if (media.type === "video") {
      return false; // Bỏ qua video
    }
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // Timeout 10s

      const formData = new FormData();
      formData.append("file", {
        uri: media.uri,
        name: media.uri.split("/").pop(),
        type: "image/jpeg",
      } as any);

      const response = await fetch(`${env.API_URL_CHECK_TOXIC}/check-image/`, {
        method: "POST",
        headers: {
          "X-API-Key": env.API_KEY_CHECK_TOXIC || "",
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data.image_result.is_sensitive || false;
    } catch (error: any) {
      console.error("❌ Lỗi kiểm tra hình ảnh:", error.message, error.stack);
      if (error.name === "AbortError") {
        Alert.alert("Lỗi", "Yêu cầu kiểm tra hình ảnh hết thời gian. Vui lòng thử lại!");
      } else {
        Alert.alert("Lỗi", "Không thể kiểm tra nội dung hình ảnh. Vui lòng kiểm tra kết nối mạng và thử lại!");
      }
      return true; // Coi là nhạy cảm để an toàn
    }
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
    if (!isModalVisible) {
      setPostContent("");
      setSelectedImages([]);
      setHashtags([]);
      setLocation({ coords: null, address: null });
    }
  };

  const handlePost = async () => {
    if (!postContent.trim() && !selectedImages.length) {
      Alert.alert("Thông báo", "Không thể đăng bài viết trống!");
      return;
    }

    setIsLoading(true);

    try {
      // Kiểm tra nội dung văn bản
      if (postContent.trim()) {
        const isTextSensitive = await checkTextContent(postContent);
        if (isTextSensitive) {
          Alert.alert("Cảnh báo", "Nội dung văn bản có chứa thông tin nhạy cảm. Vui lòng chỉnh sửa trước khi đăng!");
          return;
        }
      }

      // Kiểm tra hình ảnh
      const mediaChecks = await Promise.all(selectedImages.map(checkMediaContent));
      if (mediaChecks.some((isSensitive) => isSensitive)) {
        Alert.alert("Cảnh báo", "Một hoặc nhiều hình ảnh chứa nội dung nhạy cảm. Vui lòng xóa hoặc thay thế!");
        return;
      }

      // Nếu không nhạy cảm, tiếp tục gửi bài viết
      const formData = new FormData();
      formData.append("createdBy", userId);
      formData.append("content", postContent);
      formData.append("scope", privacy);

      hashtags.forEach((tag, index) => formData.append(`hashTag[${index}]`, tag));

      if (groupID) {
        formData.append("groupID", groupID);
      }

      if (pageID) {
        formData.append("pageId", pageID);
      }

      if (location.coords && location.address) {
        const addressData = {
          province: location.address.province,
          district: location.address.district,
          ward: location.address.ward,
          street: location.address.street,
          placeName: location.address.placeName || "",
          lat: location.coords.latitude,
          long: location.coords.longitude,
        };
        formData.append("address", JSON.stringify(addressData));
      }

      selectedImages.forEach((media) => {
        const fileName = media.uri.split("/").pop();
        const fileType = media.type === "video" ? "video/mp4" : "image/jpeg";
        formData.append("media", {
          uri: media.uri,
          name: fileName,
          type: fileType,
        } as any);
      });

      const response = await articlesClient.create(formData);
      if (response.success) {
        Alert.alert("Thông báo", "🎉 Bài viết đã được đăng thành công!");
        toggleModal();
      } else {
        throw new Error("Đăng bài viết thất bại!");
      }
    } catch (error) {
      console.error("❌ Lỗi khi đăng bài viết:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi đăng bài. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Thông báo", "Bạn cần cấp quyền truy cập thư viện ảnh!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length) {
      const mediaType = result.assets[0].type === "video" ? "video" : "image";
      setSelectedImages((prev) => [...prev, { uri: result.assets[0].uri, type: mediaType }]);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Thông báo", "Bạn cần cấp quyền truy cập camera!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length) {
      setSelectedImages((prev) => [...prev, { uri: result.assets[0].uri, type: "image" }]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddHashtag = () => {
    const tag = hashtagInput.trim().replace(/#/g, "");
    if (tag && !hashtags.includes(`#${tag}`)) {
      setHashtags((prev) => [...prev, `#${tag}`]);
      setHashtagInput("");
    }
  };

  const handleRemoveHashtag = (index: number) => {
    setHashtags((prev) => prev.filter((_, i) => i !== index));
  };

  const getCurrentLocation = async () => {
    setIsLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Thông báo", "Bạn cần cấp quyền truy cập vị trí!");
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync({});
      const addressResponse = await Location.reverseGeocodeAsync(coords);

      if (addressResponse.length > 0) {
        const firstAddress = addressResponse[0];
        const address: Address = {
          province: firstAddress.region || "",
          district: firstAddress.district || "",
          ward: firstAddress.subregion || "",
          street: firstAddress.street || "",
          placeName: [
            firstAddress.name,
            firstAddress.street,
            firstAddress.city,
            firstAddress.region,
          ]
            .filter(Boolean)
            .join(", "),
          lat: coords.latitude,
          long: coords.longitude,
        };

        setLocation({ coords, address });
      }
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Lỗi", "Không thể lấy vị trí hiện tại!");
    } finally {
      setIsLocationLoading(false);
    }
  };

  const clearLocation = () => {
    setLocation({ coords: null, address: null });
  };

  const handleMapPointSelect = (
    coords: { latitude: number; longitude: number },
    address: Address
  ) => {
    setLocation({ coords, address });
    setMapPickerVisible(false);
  };

  const openMapPicker = () => {
    setMapPickerVisible(true);
  };

  return {
    isModalVisible,
    postContent,
    setPostContent,
    toggleModal,
    handlePost,
    privacy,
    setPrivacy,
    handlePickImage,
    handleTakePhoto,
    handleRemoveImage,
    selectedImages,
    hashtags,
    hashtagInput,
    setHashtagInput,
    handleAddHashtag,
    handleRemoveHashtag,
    isLoading,
    location,
    getCurrentLocation,
    handleMapPointSelect,
    clearLocation,
    openMapPicker,
    isLocationLoading,
    setPageID,
    setGroupID,
    MapPickerDialog,
    isMapPickerVisible,
    setMapPickerVisible,
  };
};

export default usePostDialog;