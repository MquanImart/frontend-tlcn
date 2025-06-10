import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Ionicons } from "@expo/vector-icons";
import { Image } from 'expo-image';
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import useCreateGroup from "./useCreateGroup";

interface CreateGroupProps {
  userId: string;
  handleScroll: (event: { nativeEvent: { contentOffset: { y: any } } }) => void;
}

const CreateGroupTab = ({ userId, handleScroll }: CreateGroupProps) => {
  useTheme(); // Activate theme context
  const {
    groupName,
    setGroupName,
    groupDescription,
    setGroupDescription,
    hobbyOpen,
    setHobbyOpen,
    hobby,
    setHobby,
    hobbies,
    rules,
    setRules,
    ruleInput,
    setRuleInput,
    avatar,
    setAvatar,
    groupType,
    setGroupType,
    typeOpen,
    setTypeOpen,
    handleAddRule,
    handlePickAvatar,
    handleCreateGroup,
    typeOptions,
    loading,
  } = useCreateGroup(userId);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: Color.background }]} // Use dynamic background color
    >
      <FlatList
        // The overall container handles the background, so no need for it here
        data={[
          {
            key: "Tên nhóm",
            content: (
              <View style={[styles.inputContainer, { borderColor: Color.border, backgroundColor: Color.backgroundSecondary }]}>
                <Ionicons name="people-outline" size={20} color={Color.textSecondary} />
                <TextInput
                  style={[styles.input, { color: Color.textPrimary }]}
                  placeholder="Tên nhóm"
                  placeholderTextColor={Color.textTertiary}
                  value={groupName}
                  onChangeText={setGroupName}
                />
              </View>
            ),
          },
          {
            key: "Giới thiệu nhóm",
            content: (
              <View style={[styles.inputContainer, styles.textarea, { borderColor: Color.border, backgroundColor: Color.backgroundSecondary }]}>
                <Ionicons name="document-text-outline" size={20} color={Color.textSecondary} />
                <TextInput
                  style={[styles.input, { color: Color.textPrimary }]}
                  placeholder="Giới thiệu nhóm"
                  placeholderTextColor={Color.textTertiary}
                  value={groupDescription}
                  onChangeText={setGroupDescription}
                  multiline
                />
              </View>
            ),
          },
          {
            key: "Sở thích",
            content: (
              <>
                <Text style={[styles.label, { color: Color.textPrimary }]}>Sở thích</Text>
                <DropDownPicker
                  open={hobbyOpen}
                  setOpen={setHobbyOpen}
                  value={hobby}
                  setValue={setHobby}
                  items={hobbies}
                  multiple={true}
                  min={1}
                  showTickIcon
                  mode="BADGE"
                  placeholder="Chọn sở thích"
                  style={[styles.dropdown, { borderColor: Color.border, backgroundColor: Color.backgroundSecondary }]}
                  dropDownContainerStyle={[styles.dropdownContainer, { borderColor: Color.border, backgroundColor: Color.backgroundSecondary }]}
                  listMode="SCROLLVIEW"
                  textStyle={{ color: Color.textPrimary }} // Style cho text của item trong danh sách thả xuống
                  selectedItemLabelStyle={{ color: Color.textOnMain2 }} // Style cho text của item được chọn trong danh sách thả xuống
                  selectedItemContainerStyle={{ backgroundColor: Color.mainColor2 }} // Style nền của item được chọn trong danh sách
                  itemSeparatorStyle={{ backgroundColor: Color.border }} // Màu đường phân cách item

                  // --- THÊM CÁC THUỘC TÍNH NÀY ĐỂ HIỂN THỊ TEXT TRONG BADGE ---
                  badgeStyle={{
                    backgroundColor: Color.mainColor2, // Màu nền của badge, ví dụ màu chủ đạo
                    borderColor: Color.mainColor2, // Viền của badge nếu muốn
                    borderWidth: 1,
                    // Các style khác cho badge nếu cần, ví dụ padding, borderRadius
                  }}
                  badgeTextStyle={{
                    color: Color.textOnMain2, // Màu chữ của text trong badge, đảm bảo tương phản với nền badge
                    fontSize: 14, // Kích thước chữ của text trong badge
                    // Các style khác cho text trong badge
                  }}
                  // --- KẾT THÚC CÁC THUỘC TÍNH CẦN THÊM ---
                />
              </>
            ),
          },
          {
            key: "Quy định nhóm",
            content: (
              <>
                <Text style={[styles.label, { color: Color.textPrimary }]}>Quy định nhóm</Text>
                <View style={styles.ruleContainer}>
                  <TextInput
                    style={[styles.input, { borderColor: Color.border, backgroundColor: Color.backgroundSecondary, color: Color.textPrimary }]}
                    placeholder="Nhập quy định"
                    placeholderTextColor={Color.textTertiary}
                    value={ruleInput}
                    onChangeText={setRuleInput}
                  />
                  <TouchableOpacity style={[styles.addButton, { backgroundColor: Color.mainColor2 }]} onPress={handleAddRule}>
                    <Ionicons name="add-circle" size={24} color={Color.textOnMain2} />
                  </TouchableOpacity>
                </View>
                {rules.map((rule, index) => (
                  <View key={index} style={[styles.ruleItem, { backgroundColor: Color.backgroundTertiary }]}>
                    <Text style={{ color: Color.textPrimary }}>• {rule}</Text>
                    <TouchableOpacity onPress={() => setRules(rules.filter((_, i) => i !== index))}>
                      <Ionicons name="close-circle" size={18} color={Color.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            ),
          },
          {
            key: "Loại nhóm",
            content: (
              <View style={{ zIndex: 2000, elevation: 2000 }}>
                <Text style={[styles.label, { color: Color.textPrimary }]}>Loại nhóm</Text>
                <DropDownPicker
                  open={typeOpen}
                  setOpen={setTypeOpen}
                  value={groupType}
                  setValue={setGroupType}
                  items={typeOptions}
                  placeholder="Chọn loại nhóm"
                  mode="BADGE"
                  dropDownDirection="BOTTOM"
                  style={[styles.dropdown, { borderColor: Color.border, backgroundColor: Color.backgroundSecondary }]}
                  dropDownContainerStyle={[styles.dropdownContainer, { borderColor: Color.border, backgroundColor: Color.backgroundSecondary }]}
                  listMode="SCROLLVIEW"
                  textStyle={{ color: Color.textPrimary }}
                  selectedItemLabelStyle={{ color: Color.textOnMain2 }}
                  selectedItemContainerStyle={{ backgroundColor: Color.mainColor2 }}
                  itemSeparatorStyle={{ backgroundColor: Color.border }}
                />
              </View>
            ),
          },
          {
            key: "Ảnh đại diện",
            content: (
              <View>
                <Text style={[styles.label, { color: Color.textPrimary }]}>Ảnh đại diện</Text>
                <TouchableOpacity style={[styles.filePicker, { backgroundColor: Color.backgroundSelected }]} onPress={handlePickAvatar}>
                  <Text style={[styles.filePickerText, { color: Color.textSecondary }]}>
                    {avatar ? "Đổi ảnh đại diện" : "Chọn ảnh"}
                  </Text>
                </TouchableOpacity>
                {avatar && (
                  <Image source={{ uri: avatar.uri }} style={styles.avatarPreview} />
                )}
              </View>
            ),
          },
          {
            key: "Nút tạo nhóm",
            content: (
              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: Color.mainColor2 }, loading && styles.disabledButton]}
                onPress={handleCreateGroup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={Color.textOnMain2} />
                ) : (
                  <Text style={[styles.createButtonText, { color: Color.textOnMain2 }]}>Tạo Nhóm</Text>
                )}
              </TouchableOpacity>
            ),
          },
        ]}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => item.content}
        ListFooterComponent={<View style={{ height: 20 }} />}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  textarea: {
    height: 100,
    textAlignVertical: "top",
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 10,
    zIndex: 2000,
    marginBottom: 15,
  },
  dropdownContainer: {
    borderWidth: 1,
    zIndex: 3000,
  },
  ruleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  ruleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  addButton: {
    padding: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  filePicker: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  filePickerText: {
    // This style was already commented out, as its color is set inline, which is fine.
  },
  createButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  createButtonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  avatarPreview: {
    width: 150,
    height: 150,
    borderRadius: 80,
    alignSelf: "center",
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default CreateGroupTab;