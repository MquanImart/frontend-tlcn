// src/features/newfeeds/components/EditModal/EditModal.tsx
import CButton from "@/src/shared/components/button/CButton";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface EditModalProps {
  visible: boolean;
  editContent: string;
  editScope: string;
  editHashtags: string[];
  setEditContent: (text: string) => void;
  setEditScope: (text: string) => void;
  setEditHashtags: (hashtags: string[]) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const EditModal: React.FC<EditModalProps> = ({
  visible,
  editContent,
  editScope,
  editHashtags,
  setEditContent,
  setEditScope,
  setEditHashtags,
  onSave,
  onCancel,
  isLoading,
}) => {
  useTheme();
  const [isScopeModalVisible, setScopeModalVisible] = useState(false);
  const [hashtagInput, setHashtagInput] = useState("");

  const toggleScopeModal = () => setScopeModalVisible((prev) => !prev);

  const isValidHashtag = (tag: string) => /^#[A-Za-z0-9_]+$/.test(tag);

  const handleAddHashtag = () => {
    if (isLoading) return;

    const newTag = hashtagInput.trim();
    if (newTag) {
      const formattedTag = newTag.startsWith("#") ? newTag : `#${newTag}`;

      if (!isValidHashtag(formattedTag)) {
        Alert.alert("Lỗi", "Hashtag chỉ được chứa chữ cái, số và dấu gạch dưới.");
        return;
      }

      if (!editHashtags.includes(formattedTag)) {
        setEditHashtags([...editHashtags, formattedTag]);
        setHashtagInput("");
      } else {
        Alert.alert("Thông báo", "Hashtag này đã tồn tại.");
      }
    }
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
        <View style={styles.overlay}>
          <View style={[styles.dialog, { backgroundColor: Color.background }]}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: Color.textPrimary }]}>Chỉnh sửa bài viết</Text>
              <TouchableOpacity onPress={onCancel} disabled={isLoading}>
                <Ionicons
                  name="close"
                  size={24}
                  color={isLoading ? Color.textTertiary : Color.textPrimary}
                />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[
                styles.textInput,
                {
                  borderColor: Color.border,
                  color: Color.textPrimary,
                  backgroundColor: Color.background,
                },
              ]}
              placeholder="Nhập nội dung bài viết"
              placeholderTextColor={Color.textTertiary}
              value={editContent}
              onChangeText={setEditContent}
              multiline
              editable={!isLoading}
            />

            <TouchableOpacity
              style={[styles.scopeSelector, { borderColor: Color.border }]}
              onPress={toggleScopeModal}
              disabled={isLoading}
            >
              <Text style={[styles.scopeText, { color: Color.textPrimary }]}>{editScope}</Text>
              <Ionicons name="chevron-down" size={16} color={Color.textSecondary} />
            </TouchableOpacity>

            <View style={[styles.hashtagInputContainer, { borderColor: Color.border }]}>
              <TextInput
                style={[styles.hashtagInput, { color: Color.textPrimary }]}
                placeholder="Thêm hashtag..."
                placeholderTextColor={Color.textTertiary}
                value={hashtagInput}
                onChangeText={setHashtagInput}
                onSubmitEditing={handleAddHashtag}
                editable={!isLoading}
              />
              <TouchableOpacity onPress={handleAddHashtag} disabled={isLoading}>
                <Ionicons
                  name="add-circle"
                  size={26}
                  color={isLoading ? Color.textTertiary : Color.mainColor2}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.hashtagContainer}>
              <FlatList
                data={editHashtags}
                horizontal
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <View style={[styles.hashtag, { backgroundColor: Color.backgroundSecondary }]}>
                    <Text style={[styles.hashtagText, { color: Color.textPrimary }]}>{item}</Text>
                    <TouchableOpacity
                      style={styles.hashtagClose}
                      onPress={() => setEditHashtags(editHashtags.filter((_, i) => i !== index))}
                      disabled={isLoading}
                    >
                      <Ionicons
                        name="close-circle"
                        size={18}
                        color={isLoading ? Color.textTertiary : Color.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
            </View>

            <CButton
              label={isLoading ? "Đang lưu..." : "Lưu"}
              onSubmit={onSave}
              style={{
                width: "100%",
                height: 50,
                backColor: Color.mainColor2,
                textColor: Color.textOnMain2, // Sử dụng textOnMain2 cho màu chữ trên nút chính
                fontSize: 16,
                fontWeight: "bold",
                radius: 8,
                flex_direction: "row",
              }}
              disabled={isLoading}
            >
              {isLoading && (
                <ActivityIndicator size="small" color={Color.textOnMain2} style={{ marginLeft: 10 }} />
              )}
            </CButton>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isScopeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={toggleScopeModal}
      >
        <View style={styles.scopeOverlay}>
          <View style={[styles.scopeDialog, { backgroundColor: Color.background }]}>
            <Text style={[styles.scopeTitle, { color: Color.textPrimary }]}>Chọn chế độ hiển thị</Text>
            {["Công khai", "Bạn bè", "Riêng tư"].map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.scopeOption}
                onPress={() => {
                  setEditScope(option);
                  toggleScopeModal();
                }}
                disabled={isLoading}
              >
                <Ionicons
                  name={option === "Công khai" ? "earth" : option === "Bạn bè" ? "people" : "lock-closed"}
                  size={20}
                  color={Color.textSecondary}
                />
                <Text style={[styles.scopeOptionText, { color: Color.textPrimary }]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialog: {
    width: "90%",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  textInput: {
    height: 100,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: "top",
    fontSize: 16,
  },
  scopeSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
  },
  scopeText: {
    fontSize: 16,
  },
  hashtagInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  hashtagInput: {
    flex: 1,
    height: 40,
    paddingVertical: 0,
  },
  hashtagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 2,
    marginBottom: 2,
  },
  hashtag: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 6,
    marginBottom: 6,
  },
  hashtagText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  hashtagClose: {
    marginLeft: 6,
  },
  scopeOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  scopeDialog: {
    width: "80%",
    borderRadius: 10,
    padding: 20,
  },
  scopeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  scopeOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  scopeOptionText: {
    fontSize: 14,
    marginLeft: 10,
  },
});

export default EditModal;