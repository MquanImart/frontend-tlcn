import { Address } from "@/src/interface/interface_reference";
import CButton from "@/src/shared/components/button/CButton";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Image } from 'expo-image';
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface PostDialogProps {
  isModalVisible: boolean;
  postContent: string;
  setPostContent: (content: string) => void;
  toggleModal: () => void;
  handlePost: () => void;
  privacy: "Công khai" | "Bạn bè" | "Riêng tư";
  setPrivacy: (privacy: "Công khai" | "Bạn bè" | "Riêng tư") => void;
  handlePickImage: () => void;
  handleTakePhoto: () => void;
  handleRemoveImage: (index: number) => void;
  selectedImages: string[];
  hashtags: string[];
  hashtagInput: string;
  setHashtagInput: (input: string) => void;
  handleAddHashtag: () => void;
  handleRemoveHashtag: (index: number) => void;
  isLoading: boolean;
  location: { coords: { latitude: number; longitude: number } | null; address: Address | null };
  getCurrentLocation: () => void;
  clearLocation: () => void;
  openMapPicker: () => void;
  isMapPickerVisible: boolean;
  setMapPickerVisible: (visible: boolean) => void;
  handleMapPointSelect: (coords: { latitude: number; longitude: number }, address: Address) => void;
  MapPickerDialog: React.FC<any>;
  isLocationLoading: boolean;
}

const PostDialog: React.FC<PostDialogProps> = ({
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
  clearLocation,
  openMapPicker,
  isMapPickerVisible,
  setMapPickerVisible,
  handleMapPointSelect,
  MapPickerDialog,
  isLocationLoading,
}) => {
  useTheme();
  const [isPrivacyModalVisible, setPrivacyModalVisible] = useState(false);

  const togglePrivacyModal = () => setPrivacyModalVisible(!isPrivacyModalVisible);

  const getPrivacyIcon = (privacy: string) => {
    switch (privacy) {
      case "Công khai":
        return <Ionicons name="earth" size={18} color={Color.textSecondary} />;
      case "Bạn bè":
        return <Ionicons name="people" size={18} color={Color.textSecondary} />;
      case "Riêng tư":
        return <Ionicons name="lock-closed" size={18} color={Color.textSecondary} />;
      default:
        return <Ionicons name="earth" size={18} color={Color.textSecondary} />;
    }
  };

  return (
    <Modal visible={isModalVisible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: Color.background }]}>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: Color.textPrimary }]}>Tạo bài viết</Text>
            <TouchableOpacity onPress={toggleModal} disabled={isLoading}>
              <Ionicons name="close" size={24} color={Color.textSecondary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.privacySelector, { borderColor: Color.border }]}
            onPress={togglePrivacyModal}
            disabled={isLoading}
          >
            {getPrivacyIcon(privacy)}
            <Text style={[styles.privacyText, { color: Color.textPrimary }]}>{privacy}</Text>
            <Ionicons name="chevron-down" size={18} color={Color.textSecondary} />
          </TouchableOpacity>

          <Modal visible={isPrivacyModalVisible} transparent animationType="fade">
            <View style={styles.privacyOverlay}>
              <View style={[styles.privacyModal, { backgroundColor: Color.background }]}>
                {["Công khai", "Bạn bè", "Riêng tư"].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.privacyOption}
                    onPress={() => {
                      setPrivacy(option as "Công khai" | "Bạn bè" | "Riêng tư");
                      togglePrivacyModal();
                    }}
                  >
                    {getPrivacyIcon(option)}
                    <Text style={[styles.privacyOptionText, { color: Color.textPrimary }]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Modal>

          <TextInput
            style={[styles.textInput, { color: Color.textPrimary, borderColor: Color.border }]}
            placeholder="Bạn đang nghĩ gì?"
            placeholderTextColor={Color.textSecondary}
            value={postContent}
            onChangeText={setPostContent}
            multiline
            editable={!isLoading}
          />

          {selectedImages.length > 0 && (
            <FlatList
              data={selectedImages}
              horizontal
              renderItem={({ item, index }) => (
                <View style={styles.imageWrapper}>
                  <Image source={{ uri: item }} style={styles.selectedImage} />
                  <TouchableOpacity
                    style={[styles.removeImage, { backgroundColor: Color.backgroundTertiary }]}
                    onPress={() => handleRemoveImage(index)}
                    disabled={isLoading}
                  >
                    <Ionicons name="close" size={18} color={Color.textOnMain2} />
                  </TouchableOpacity>
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          )}

          <View style={[styles.hashtagContainer, { borderColor: Color.border }]}>
            <TextInput
              style={[styles.hashtagInput, { color: Color.textPrimary }]}
              placeholder="#hashtag"
              placeholderTextColor={Color.textSecondary}
              value={hashtagInput}
              onChangeText={setHashtagInput}
              onSubmitEditing={handleAddHashtag}
              editable={!isLoading}
            />
            <TouchableOpacity onPress={handleAddHashtag} disabled={isLoading}>
              <Ionicons name="add-circle" size={26} color={Color.mainColor2} />
            </TouchableOpacity>
          </View>

          <View style={styles.hashtagList}>
            {hashtags.map((tag, index) => (
              <View key={index} style={[styles.hashtagItem, { backgroundColor: Color.backgroundSecondary }]}>
                <Text style={[styles.hashtagText, { color: Color.textPrimary }]}>{tag}</Text>
                <TouchableOpacity onPress={() => handleRemoveHashtag(index)} disabled={isLoading}>
                  <Ionicons name="close-circle" size={18} color={Color.textSecondary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.locationContainer}>
            {location.address ? (
              <View style={[styles.locationInfo, { borderColor: Color.border }]}>
                <MaterialIcons name="location-on" size={20} color={Color.mainColor2} />
                  <Text style={[styles.locationText, { color: Color.textPrimary }]} numberOfLines={1}>
                  {location.address?.placeName ||
                  `${location.address?.street}, ${location.address?.ward}, ${location.address?.district}, ${location.address?.province}`}
                </Text>
                <TouchableOpacity onPress={clearLocation} disabled={isLoading}>
                  <Ionicons name="close" size={18} color={Color.textSecondary} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.locationButtons}>
                <CButton
                  label={isLocationLoading ? "Đang lấy vị trí..." : "Check-in"}
                  onSubmit={getCurrentLocation}
                  disabled={isLoading || isLocationLoading}
                  style={{ width: "48%", height: 40, backColor: Color.backgroundSecondary, textColor: Color.textPrimary, radius: 8, fontSize: 14 }}
                />
                <CButton
                  label="Chọn trên bản đồ"
                  onSubmit={openMapPicker}
                  disabled={isLoading}
                  style={{ width: "48%", height: 40, backColor: Color.backgroundSecondary, textColor: Color.textPrimary, radius: 8, fontSize: 14 }}
                />
              </View>
            )}
          </View>

          <View style={styles.tools}>
            <TouchableOpacity style={styles.toolButton} onPress={handlePickImage} disabled={isLoading}>
              <Ionicons name="image-outline" size={26} color={Color.textSecondary} />
              <Text style={[styles.toolText, { color: Color.textPrimary }]}>Ảnh</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolButton} onPress={handleTakePhoto} disabled={isLoading}>
              <Ionicons name="camera-outline" size={26} color={Color.textSecondary} />
              <Text style={[styles.toolText, { color: Color.textPrimary }]}>Chụp</Text>
            </TouchableOpacity>
          </View>

          <CButton
            label={isLoading ? "Đang đăng..." : "Đăng bài"}
            onSubmit={handlePost}
            disabled={isLoading}
            style={{
              width: "100%",
              height: 50,
              backColor: isLoading ? Color.backgroundTertiary : Color.mainColor2,
              textColor: Color.textOnMain2,
              radius: 10,
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            {isLoading && <ActivityIndicator size="small" color={Color.textOnMain2} style={styles.loadingIndicator} />}
          </CButton>
        </View>
      </View>

      <MapPickerDialog
        isVisible={isMapPickerVisible}
        onClose={() => setMapPickerVisible(false)}
        onConfirm={handleMapPointSelect}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", alignItems: "center" },
  dialog: { width: "90%", borderRadius: 15, padding: 20, elevation: 5 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  privacySelector: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 10 },
  privacyText: { fontSize: 14, marginLeft: 8 },
  textInput: { height: 100, borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 15, textAlignVertical: "top", fontSize: 16 },
  imageWrapper: { position: "relative", marginRight: 10 },
  selectedImage: { width: 100, height: 100, borderRadius: 8, marginBottom: 10 },
  removeImage: { position: "absolute", top: 5, right: 5, borderRadius: 15, padding: 6 },
  hashtagContainer: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 10 },
  hashtagInput: { flex: 1, fontSize: 16 },
  tools: { flexDirection: "row", justifyContent: "space-around", marginBottom: 15 },
  toolButton: { alignItems: "center" },
  toolText: { fontSize: 12, marginTop: 4 },
  privacyOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  privacyModal: { width: "80%", borderRadius: 10, padding: 20 },
  privacyOption: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  privacyOptionText: { fontSize: 14, marginLeft: 10 },
  hashtagList: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
  hashtagItem: { flexDirection: "row", alignItems: "center", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, marginRight: 8, marginBottom: 5 },
  hashtagText: { fontSize: 14, marginRight: 5 },
  loadingIndicator: { marginLeft: 10 },
  locationContainer: { marginBottom: 15 },
  locationInfo: { flexDirection: "row", alignItems: "center", padding: 10, borderRadius: 8, borderWidth: 1 },
  locationText: { flex: 1, marginLeft: 8, marginRight: 8 },
  locationButtons: { flexDirection: "row", justifyContent: "space-between" },
});

export default PostDialog;