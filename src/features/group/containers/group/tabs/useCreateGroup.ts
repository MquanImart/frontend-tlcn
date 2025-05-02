import { useState, useEffect } from "react";
import { Alert, Platform } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import restClient from "@/src/shared/services/RestClient";

const hobbiesClient = restClient.apiClient.service("apis/hobbies");
const groupsClient = restClient.apiClient.service("apis/groups");

const useCreateGroup = (currentUserId: string) => {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [hobbyOpen, setHobbyOpen] = useState(false);
  const [hobby, setHobby] = useState<string[]>([]);
  const [hobbies, setHobbies] = useState<{ label: string; value: string }[]>([]);
  const [rules, setRules] = useState<string[]>([]);
  const [ruleInput, setRuleInput] = useState("");
  const [avatar, setAvatar] = useState<any>(null);
  const [groupType, setGroupType] = useState<"public" | "private">("public");
  const [typeOpen, setTypeOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const typeOptions = [
    { label: "Công khai", value: "public" },
    { label: "Riêng tư", value: "private" },
  ];

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Cần quyền truy cập để chọn ảnh đại diện');
        }
      }
    })();
  }, []);

  // Fetch hobbies list
  useEffect(() => {
    const fetchHobbies = async () => {
      try {
        const response = await hobbiesClient.find({});
        if (response.success) {
          setHobbies(
            response.data.map((hobby: { name: string; _id: string }) => ({
              label: hobby.name,
              value: hobby._id,
            }))
          );
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách sở thích:", error);
      }
    };
    fetchHobbies();
  }, []);

  const handleAddRule = () => {
    if (ruleInput.trim()) {
      setRules([...rules, ruleInput]);
      setRuleInput("");
    }
  };

  // Handle avatar selection
  const handlePickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        setAvatar(result.assets[0]);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chọn ảnh");
    }
  };

  // Handle group creation
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên nhóm");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      formData.append("groupName", groupName);
      formData.append("type", groupType);
      formData.append("idCreater", currentUserId);
      formData.append("introduction", groupDescription);

      rules.forEach((rule, index) => {
        formData.append(`rule[${index}]`, rule);
      });

      hobby.forEach((hob, index) => {
        formData.append(`hobbies[${index}]`, hob);
      });

      if (avatar) {
        const fileName = avatar.uri.split("/").pop();
        const fileType = avatar.uri.endsWith(".png") ? "image/png" : "image/jpeg";

        formData.append("avt", {
          uri: avatar.uri,
          name: fileName,
          type: fileType,
        } as any);
      }

      // Send request to create the group
      const response = await groupsClient.create(formData);

      if (response.success) {
        Alert.alert("🎉 Thành công", "Nhóm đã được tạo!");
      } else {
        throw new Error(response.message || "Lỗi khi tạo nhóm");
      }
    } catch (error) {
      console.error("❌ Lỗi khi tạo nhóm:", error);
      Alert.alert("Lỗi", "Không thể tạo nhóm. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
};

export default useCreateGroup;