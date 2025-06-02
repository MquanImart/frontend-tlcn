import { GroupParamList } from "@/src/shared/routes/GroupNavigation"; // Điều chỉnh đường dẫn nếu cần
import restClient from "@/src/shared/services/RestClient";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { Alert, Platform } from "react-native";

const hobbiesClient = restClient.apiClient.service("apis/hobbies");
const groupsClient = restClient.apiClient.service("apis/groups");

const useCreateGroup = (currentUserId: string) => {
  type NavigationProps = StackNavigationProp<GroupParamList>;
  const navigation = useNavigation<NavigationProps>();
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
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Cần quyền truy cập để chọn ảnh đại diện");
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
        } else {
          throw new Error("Không thể lấy danh sách sở thích");
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách sở thích:", error);
        Alert.alert("Lỗi", "Không thể tải danh sách sở thích. Vui lòng thử lại.");
      }
    };
    fetchHobbies();
  }, []);

  const handleAddRule = () => {
    if (ruleInput.trim()) {
      setRules([...rules, ruleInput]);
      setRuleInput("");
    } else {
      Alert.alert("Thông báo", "Vui lòng nhập quy định trước khi thêm.");
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
      console.error("Lỗi khi chọn ảnh:", error);
      Alert.alert("Lỗi", "Không thể chọn ảnh. Vui lòng thử lại.");
    }
  };

  // Handle group creation
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên nhóm");
      return;
    }

    if (hobby.length === 0) {
      Alert.alert("Lỗi", "Vui lòng chọn ít nhất một sở thích");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      formData.append("groupName", groupName);
      formData.append("type", groupType);
      formData.append("idCreater", currentUserId);
      formData.append("introduction", groupDescription || "");

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

      if (response.success && response.data?._id) {
        // Reset form
        setGroupName("");
        setGroupDescription("");
        setHobby([]);
        setRules([]);
        setRuleInput("");
        setAvatar(null);
        setGroupType("public");

        const newGroupId = response.data._id;

        Alert.alert("🎉 Thành công", "Nhóm đã được tạo!", [
          {
            text: "OK",
            onPress: () => {
              // Điều hướng đến GroupDetailsScreen
              if (navigation.getState().routeNames.includes("GroupDetailsScreen")) {
                navigation.navigate("GroupDetailsScreen", {
                  groupId: newGroupId,
                  currentUserId,
                });
              } else {
                console.error("GroupDetailsScreen is not defined in navigation stack");
                Alert.alert("Lỗi", "Không thể điều hướng đến chi tiết nhóm. Vui lòng kiểm tra cấu hình navigation.");
              }
            },
          },
        ]);
      } else {
        throw new Error(response.message || "Tạo nhóm thất bại");
      }
    } catch (error: any) {
      console.error("❌ Lỗi khi tạo nhóm:", error);
      Alert.alert("Lỗi", error.message || "Không thể tạo nhóm. Vui lòng thử lại!");
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