import { Group } from "@/src/features/newfeeds/interface/article";
import restClient from "@/src/shared/services/RestClient";
import getColor from "@/src/styles/Color";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

const Color = getColor();

interface EditGroupProps {
  group: Group;
  onCancel: () => void;
  onSave: (updatedGroup: Group) => void;
}

interface Hobby {
  label: string;
  value: string;
}

const hobbiesClient = restClient.apiClient.service("apis/hobbies");
const groupsClient = restClient.apiClient.service("apis/groups");

const EditGroupScreen: React.FC<EditGroupProps> = ({ group, onCancel, onSave }) => {
  const [groupName, setGroupName] = useState(group?.groupName || "");
  const [groupDescription, setGroupDescription] = useState(group?.introduction || "");
  const [hobbyOpen, setHobbyOpen] = useState(false);
  const [hobby, setHobby] = useState<string[]>(group?.hobbies || []);
  const [hobbies, setHobbies] = useState<{ label: string; value: string }[]>([]);
  const [rules, setRules] = useState<string[]>(group?.rule || []);
  const [ruleInput, setRuleInput] = useState("");
  const [avatar, setAvatar] = useState<string | null>(group?.avt?.url || null);
  const [groupType, setGroupType] = useState<"public" | "private">(group?.type || "public");
  const [typeOpen, setTypeOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchHobbies = async () => {
      try {
        const response = await hobbiesClient.find({});
        if (response.success) {
          const hobbyList = response.data.map((hobby: { name: string; _id: string }) => ({
            label: hobby.name,
            value: hobby._id,
          }));
          setHobbies(hobbyList);

          const selectedHobbies = hobbyList
            .filter((h: Hobby) => hobby.includes(h.value))
            .map((h: Hobby) => h.value);
          setHobby(selectedHobbies);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách sở thích:", error);
      }
    };

    fetchHobbies();
  }, []);

  const handlePickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chọn ảnh");
    }
  };

  const handleRemoveAvatar = () => {
    setAvatar(null);
  };

  const handleDeleteRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleAddRule = () => {
    if (ruleInput.trim()) {
      setRules([...rules, ruleInput]);
      setRuleInput("");
    }
  };

  const handleSaveGroup = async () => {
    if (!groupName || hobby.length === 0) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append("groupName", groupName);
    formData.append("type", groupType);
    formData.append("introduction", groupDescription);
    formData.append("rule", JSON.stringify(rules));
    formData.append("hobbies", JSON.stringify(hobby));

    if (avatar && avatar !== group?.avt?.url) {
      console.log("Sending new avatar URI:", avatar);
      const fileType = avatar.split(".").pop()?.toLowerCase();
      if (!fileType || !["jpg", "jpeg", "png"].includes(fileType)) {
        Alert.alert("Lỗi", "Định dạng ảnh không hợp lệ. Vui lòng chọn JPG hoặc PNG.");
        setIsLoading(false);
        return;
      }
      formData.append("avt", {
        uri: avatar,
        name: `avatar.${fileType}`,
        type: `image/${fileType}`,
      } as any);
    } else if (!avatar) {
      console.log("Removing avatar");
      formData.append("removeAvatar", "true");
    }

    // Log FormData values (React Native FormData does not support entries())
    // You can log the appended values individually if needed, for example:
    // console.log("FormData groupName:", groupName);
    // console.log("FormData type:", groupType);
    // console.log("FormData introduction:", groupDescription);
    // console.log("FormData rule:", JSON.stringify(rules));
    // console.log("FormData hobbies:", JSON.stringify(hobby));
    // if (avatar && avatar !== group?.avt?.url) {
    //   console.log("FormData avt:", avatar);
    // }

    try {
      const response = await groupsClient.patch(group._id, formData);
      console.log("API response:", response);

      if (response.success) {
        onSave(response.data);
        Alert.alert("Thành công", "Nhóm đã được cập nhật!");
      } else {
        Alert.alert("Lỗi", response.message || "Không thể cập nhật nhóm");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật nhóm:", error);
      Alert.alert("Lỗi", "Không thể cập nhật nhóm, vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const placeholderText = hobby.length
    ? `${hobby.length} item${hobby.length > 1 ? "s" : ""} selected`
    : "Chọn sở thích";

  const sections = [
    {
      key: "Tên nhóm",
      component: (
        <TextInput
          style={styles.input}
          placeholder="Nhập tên nhóm"
          value={groupName}
          onChangeText={setGroupName}
        />
      ),
    },
    {
      key: "Giới thiệu nhóm",
      component: (
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Nhập giới thiệu nhóm"
          value={groupDescription}
          onChangeText={setGroupDescription}
          multiline
        />
      ),
    },
    {
      key: "Sở thích",
      component: (
        <DropDownPicker
          open={hobbyOpen}
          setOpen={setHobbyOpen}
          value={hobby}
          setValue={setHobby}
          items={hobbies}
          placeholder={placeholderText}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          multiple={true}
          min={1}
          listMode="SCROLLVIEW"
        />
      ),
    },
    {
      key: "Quy định nhóm",
      component: (
        <>
          <View style={styles.ruleInputContainer}>
            <TextInput
              style={styles.ruleInput}
              placeholder="Nhập quy định nhóm"
              value={ruleInput}
              onChangeText={setRuleInput}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddRule}>
              <Text style={styles.addButtonText}>Thêm</Text>
            </TouchableOpacity>
          </View>

          {rules.length > 0 && (
            <View style={styles.rulesContainer}>
              {rules.map((rule, index) => (
                <View key={index} style={styles.ruleItem}>
                  <Text style={styles.ruleText}>{rule}</Text>
                  <TouchableOpacity onPress={() => handleDeleteRule(index)}>
                    <Ionicons name="close-circle" size={20} color={Color.white_homologous} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </>
      ),
    },
    {
      key: "Loại nhóm",
      component: (
        <DropDownPicker
          open={typeOpen}
          setOpen={setTypeOpen}
          value={groupType}
          setValue={setGroupType}
          items={[
            { label: "Công khai", value: "public" },
            { label: "Riêng tư", value: "private" },
          ]}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
        />
      ),
    },
    {
      key: "Ảnh đại diện",
      component: (
        <View>
          <TouchableOpacity style={styles.filePicker} onPress={handlePickAvatar}>
            <Text style={styles.filePickerText}>
              {avatar ? "Thay đổi ảnh đại diện" : "Chọn ảnh"}
            </Text>
            {avatar && (
              <Image
                source={{ uri: avatar }}
                style={styles.avatarPreview}
                onError={() => {
                  setAvatar(null);
                  Alert.alert("Lỗi", "Không thể tải ảnh đại diện");
                }}
              />
            )}
          </TouchableOpacity>
          {avatar && (
            <TouchableOpacity style={styles.removeButton} onPress={handleRemoveAvatar}>
              <Text style={styles.removeButtonText}>Xóa ảnh đại diện</Text>
            </TouchableOpacity>
          )}
        </View>
      ),
    },
    {
      key: "",
      component: (
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSaveGroup}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Lưu thay đổi</Text>
          )}
        </TouchableOpacity>
      ),
    },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <FlatList
        data={sections}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 15 }}>
            <Text style={styles.label}>{item.key}</Text>
            {item.component}
          </View>
        )}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
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
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Color.borderColor1,
    borderRadius: 8,
    padding: 10,
    color: Color.textColor1,
    backgroundColor: Color.white_homologous,
  },
  textarea: {
    height: 100,
    textAlignVertical: "top",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: Color.borderColor1,
    borderRadius: 8,
    backgroundColor: Color.white_homologous,
    marginBottom: 15,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: Color.borderColor1,
  },
  ruleInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ruleInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Color.borderColor1,
    borderRadius: 8,
    padding: 10,
    color: Color.textColor1,
    backgroundColor: Color.white_homologous,
    marginRight: 10,
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: Color.mainColor1,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  filePicker: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: Color.white_homologous,
    alignItems: "center",
    marginBottom: 10,
  },
  filePickerText: {
    color: Color.textColor1,
  },
  avatarPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#ccc",
    marginTop: 10,
  },
  removeButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: Color.backGround || "#ff4d4d",
    alignItems: "center",
    marginBottom: 10,
  },
  removeButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: Color.mainColor1,
    marginRight: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  rulesContainer: {
    marginTop: 10,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Color.mainColor1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  ruleText: {
    color: Color.white_homologous,
    fontSize: 14,
    flex: 1,
  },
});

export default EditGroupScreen;