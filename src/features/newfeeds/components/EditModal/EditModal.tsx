import React, { useEffect, useState } from "react";
import {
  View,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CButton from "@/src/shared/components/button/CButton";
import getColor from "@/src/styles/Color";

const colors = getColor();

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
}) => {
  
  const [isScopeModalVisible, setScopeModalVisible] = useState(false);
  const [hashtagInput, setHashtagInput] = useState("");

  const toggleScopeModal = () => setScopeModalVisible((prev) => !prev);

  const isValidHashtag = (tag: string) => /^#[A-Za-z0-9_]+$/.test(tag);
  const handleAddHashtag = () => {
    const newTag = hashtagInput.trim();
    if (newTag) {
      const formattedTag = newTag.startsWith("#") ? newTag : `#${newTag}`;

      // Kiểm tra hashtag hợp lệ
      if (!isValidHashtag(formattedTag)) {
        Alert.alert("Lỗi", "Hashtag chỉ được chứa chữ cái, số và dấu gạch dưới.");
        return;
      }

      // Kiểm tra trùng lặp
      if (!editHashtags.includes(formattedTag)) {
        setEditHashtags([...editHashtags, formattedTag]);
        setHashtagInput("");
      } else {
        Alert.alert("Thông báo", "Hashtag này đã tồn tại.");
      }
    }
  };

  // Xóa hashtag khỏi danh sách
  const handleRemoveHashtag = (index: number) => {
    setEditHashtags(editHashtags.filter((_, i) => i !== index));
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textColor1 }]}>
              Chỉnh sửa bài viết
            </Text>
            <TouchableOpacity onPress={onCancel}>
              <Ionicons name="close" size={24} color={colors.textColor1} />
            </TouchableOpacity>
          </View>

          {/* Nội dung bài viết */}
          <TextInput
            style={[
              styles.textInput,
              {
                borderColor: colors.borderColor1,
                color: colors.textColor1,
                backgroundColor: colors.backGround,
              },
            ]}
            placeholder="Nhập nội dung bài viết"
            placeholderTextColor={colors.textColor3}
            value={editContent}
            onChangeText={setEditContent}
            multiline
          />

          {/* Chọn phạm vi bài viết */}
          <TouchableOpacity
            style={[styles.scopeSelector, { borderColor: colors.borderColor1 }]}
            onPress={toggleScopeModal}
          >
            <Text style={[styles.scopeText, { color: colors.textColor1 }]}>{editScope}</Text>
            <Ionicons name="chevron-down" size={16} color={colors.textColor3} />
          </TouchableOpacity>

          {/* Input Thêm Hashtag */}
          <View style={styles.hashtagInputContainer}>
            <TextInput
              style={[styles.hashtagInput, { color: colors.textColor1 }]}
              placeholder="Thêm hashtag..."
              placeholderTextColor={colors.textColor3}
              value={hashtagInput}
              onChangeText={setHashtagInput}
              onSubmitEditing={handleAddHashtag}
            />
            <TouchableOpacity onPress={handleAddHashtag}>
              <Ionicons name="add-circle" size={26} color={colors.mainColor1} />
            </TouchableOpacity>
          </View>

          {/* Hiển thị danh sách hashtag */}
          <View style={styles.hashtagContainer}>
            <FlatList
              data={editHashtags}
              horizontal
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View style={styles.hashtag}>
                  <Text style={styles.hashtagText}>{item}</Text>
                  <TouchableOpacity
                    style={styles.hashtagClose}
                    onPress={() => setEditHashtags(editHashtags.filter((_, i) => i !== index))}
                  >
                    <Ionicons name="close-circle" size={18} color={colors.textColor3} />
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>

          <CButton
            label="Lưu"
            onSubmit={onSave}
            style={{
              width: "100%",
              height: 50,
              backColor: colors.mainColor1,
              textColor: "#FFFFFF",
              fontSize: 16,
              fontWeight: "bold",
              radius: 8,
              flex_direction: "row",
            }}
          />
        </View>
      </View>

      {/* Modal chọn phạm vi bài viết */}
      <Modal visible={isScopeModalVisible} transparent animationType="fade" onRequestClose={toggleScopeModal}>
        <View style={styles.scopeOverlay}>
          <View style={[styles.scopeDialog, { backgroundColor: colors.backGround }]}>
            <Text style={[styles.scopeTitle, { color: colors.textColor1 }]}>Chọn chế độ hiển thị</Text>
            {["Công khai", "Bạn bè", "Riêng tư"].map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.scopeOption}
                onPress={() => {
                  setEditScope(option);
                  toggleScopeModal();
                }}
              >
                <Ionicons
                  name={option === "Công khai" ? "earth" : option === "Bạn bè" ? "people" : "lock-closed"}
                  size={20}
                  color={colors.textColor3}
                />
                <Text style={[styles.scopeOptionText, { color: colors.textColor1 }]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </Modal>
  );
};

export default EditModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialog: {
    width: "90%",
    backgroundColor: colors.backGround,
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
  hashtagItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 5,
    marginBottom: 5,
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
  hashtagContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  hashtag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backGround2,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 6,
    marginBottom: 6,
  },
  hashtagText: {
    color: colors.textColor1,
    fontSize: 14,
    fontWeight: "bold",
  },
  hashtagClose: {
    marginLeft: 6,
  },
});