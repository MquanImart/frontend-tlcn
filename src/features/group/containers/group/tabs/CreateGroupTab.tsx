import getColor from "@/src/styles/Color";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
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

const Color = getColor();

interface CreateGroupProps {
  userId: string;
  handleScroll: (event: { nativeEvent: { contentOffset: { y: any } } }) => void;
}

const CreateGroupTab = ({ userId, handleScroll }: CreateGroupProps) => {
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
      style={styles.container}
    >
      <FlatList
        style={styles.container}
        data={[
          {
            key: "Tên nhóm",
            content: (
              <View style={styles.inputContainer}>
                <Ionicons name="people-outline" size={20} color={Color.textColor3} />
                <TextInput
                  style={styles.input}
                  placeholder="Tên nhóm"
                  placeholderTextColor={Color.textColor3}
                  value={groupName}
                  onChangeText={setGroupName}
                />
              </View>
            ),
          },
          {
            key: "Giới thiệu nhóm",
            content: (
              <View style={[styles.inputContainer, styles.textarea]}>
                <Ionicons name="document-text-outline" size={20} color={Color.textColor3} />
                <TextInput
                  style={styles.input}
                  placeholder="Giới thiệu nhóm"
                  placeholderTextColor={Color.textColor3}
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
                <Text style={styles.label}>Sở thích</Text>
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
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  listMode="SCROLLVIEW"
                />
              </>
            ),
          },
          {
            key: "Quy định nhóm",
            content: (
              <>
                <Text style={styles.label}>Quy định nhóm</Text>
                <View style={styles.ruleContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập quy định"
                    placeholderTextColor={Color.textColor3}
                    value={ruleInput}
                    onChangeText={setRuleInput}
                  />
                  <TouchableOpacity style={styles.addButton} onPress={handleAddRule}>
                    <Ionicons name="add-circle" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
                {rules.map((rule, index) => (
                  <View key={index} style={styles.ruleItem}>
                    <Text style={{ color: Color.textColor1 }}>• {rule}</Text>
                    <TouchableOpacity onPress={() => setRules(rules.filter((_, i) => i !== index))}>
                      <Ionicons name="close-circle" size={18} color={Color.mainColor1} />
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
                <Text style={styles.label}>Loại nhóm</Text>
                <DropDownPicker
                  open={typeOpen}
                  setOpen={setTypeOpen}
                  value={groupType}
                  setValue={setGroupType}
                  items={typeOptions}
                  placeholder="Chọn loại nhóm"
                  mode="BADGE"
                  dropDownDirection="BOTTOM"
                  style={styles.dropdown}
                  dropDownContainerStyle={styles.dropdownContainer}
                  listMode="SCROLLVIEW"
                />
              </View>
            ),
          },
          {
            key: "Ảnh đại diện",
            content: (
              <View>
                <Text style={styles.label}>Ảnh đại diện</Text>
                <TouchableOpacity style={styles.filePicker} onPress={handlePickAvatar}>
                  <Text style={styles.filePickerText}>
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
                style={[styles.createButton, loading && styles.disabledButton]}
                onPress={handleCreateGroup}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.createButtonText}>Tạo Nhóm</Text>
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
    backgroundColor: Color.backGround,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Color.textColor1,
    marginBottom: 5,
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Color.borderColor1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Color.textColor2,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Color.white_contrast,
    marginLeft: 10,
  },
  textarea: {
    height: 100,
    textAlignVertical: "top",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: Color.borderColor1,
    borderRadius: 10,
    zIndex: 2000,
    marginBottom: 15,
  },
  dropdownContainer: {
    borderWidth: 1,
    zIndex: 3000,
    borderColor: Color.borderColor1,
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
    backgroundColor: Color.backGround2,
    marginBottom: 5,
  },
  addButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: Color.mainColor1,
    marginLeft: 10,
  },
  filePicker: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: Color.inputBackGround,
    alignItems: "center",
    marginBottom: 10,
  },
  filePickerText: {
    color: Color.textColor3,
  },
  createButton: {
    backgroundColor: Color.mainColor1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  createButtonText: {
    color: "#fff",
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