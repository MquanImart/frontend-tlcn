import env from "@/env";
import { Address } from "@/src/interface/interface_reference";
import restClient from "@/src/shared/services/RestClient";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useState } from "react";
import { Alert } from "react-native";
import MapPickerDialog from "../MapPickerDialog/MapPickerDialog";

const articlesClient = restClient.apiClient.service("apis/articles");

const usePostDialog = (userId: string) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [privacy, setPrivacy] = useState<"Công khai" | "Bạn bè" | "Riêng tư">("Công khai");
  const [selectedImages, setSelectedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
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
      const timeoutId = setTimeout(() => controller.abort(), 50000);

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
      return true;
    }
  };

  const checkMediaContent = async (mediaAssets: ImagePicker.ImagePickerAsset[]): Promise<boolean> => {
    if (!mediaAssets || mediaAssets.length === 0) return false;

    const imageAssets = mediaAssets.filter((media) => media.type === "image");

    if (imageAssets.length === 0) return false;

    for (const media of imageAssets) {
      if (media.fileSize && media.fileSize > 5 * 1024 * 1024) {
        Alert.alert("Lỗi", `Ảnh "${media.fileName || media.uri.split("/").pop()}" quá lớn, tối đa 5MB.`);
        return true;
      }
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 50000);

      const formData = new FormData();
      for (const media of imageAssets) {
        const resizedUri = await ImageManipulator.manipulateAsync(
          media.uri,
          [{ resize: { width: 600 } }],
          { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
        ).then((result) => result.uri);

        formData.append("files", {
          uri: resizedUri,
          name: media.fileName || resizedUri.split("/").pop(),
          type: media.mimeType || "image/jpeg",
        } as any);
      }
      
      const response = await fetch(`${env.API_URL_CHECK_TOXIC}/check-image/`, {
        method: "POST",
        headers: {
          "X-API-Key": env.API_KEY_CHECK_TOXIC || "",
          "Connection": "keep-alive",
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Body: ${errorText}`);
      }

      const data = await response.json();

      let sensitiveImageDetected = false;
      let sensitiveFilename = "";

      for (const resultItem of data.results) {
        const isImageSensitive = resultItem.image_result?.is_sensitive;
        const isTextSensitive =
          resultItem.text_result?.text_sensitivity &&
          Object.values(resultItem.text_result.text_sensitivity).some((v: any) => v.is_sensitive);

        if (isImageSensitive || isTextSensitive) {
          sensitiveImageDetected = true;
          sensitiveFilename = resultItem.filename;
          break;
        }
      }

      if (sensitiveImageDetected) {
        Alert.alert("Cảnh báo nội dung nhạy cảm", `Ảnh "${sensitiveFilename}" chứa nội dung không phù hợp.`);
        return true;
      }

      return false;
    } catch (error: any) {
      if (error.name === "AbortError") {
        Alert.alert("Lỗi", "Hết thời gian kiểm tra hình ảnh (3s). Vui lòng dùng ảnh nhỏ hơn!");
      } else {
        Alert.alert("Lỗi", "Không thể kiểm tra nội dung ảnh. Vui lòng kiểm tra kết nối mạng và thử lại!");
      }
      return true;
    }
  };

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
    if (!isModalVisible) {
      setPostContent("");
      setSelectedImages([]);
      setHashtags([]);
      setHashtagInput(""); // Reset ô nhập hashtag
      setLocation({ coords: null, address: null });
    }
  };

  const handlePost = async () => {
    if (!postContent.trim() && !selectedImages.length) {
      Alert.alert("Thông báo", "Không thể đăng bài viết trống!");
      return;
    }

    setIsLoading(true);
    console.time("HandlePost");

    try {
      if (postContent.trim()) {
        const isTextSensitive = await checkTextContent(postContent);
        if (isTextSensitive) {
          Alert.alert("Cảnh báo", "Nội dung văn bản có chứa thông tin nhạy cảm. Vui lòng chỉnh sửa trước khi đăng!");
          return;
        }
      }

      if (selectedImages.length > 0) {
        const isMediaSensitive = await checkMediaContent(selectedImages);
        if (isMediaSensitive) {
          Alert.alert("Cảnh báo", "Một hoặc nhiều hình ảnh chứa nội dung nhạy cảm. Vui lòng xóa hoặc thay thế!");
          return;
        }
      }

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

      console.time("BackendCreateArticle");
      const response = await articlesClient.create(formData);
      console.timeEnd("BackendCreateArticle");

      if (response.success) {
        if (response.backendProcessingTime) {
          console.log(`⏱️ Backend processing time: ${response.backendProcessingTime} ms`);
        }
        Alert.alert("Thông báo", "🎉 Bài viết đã được đăng thành công!");
        toggleModal();
      } else {
        throw new Error("Đăng bài viết thất bại!");
      }
    } catch (error) {
      console.error("❌ Lỗi khi đăng bài viết:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi đăng bài. Vui lòng thử lại!");
    } finally {
      console.timeEnd("HandlePost");
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
      setSelectedImages((prev) => [...prev, result.assets[0]]);
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
      setSelectedImages((prev) => [...prev, result.assets[0]]);
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