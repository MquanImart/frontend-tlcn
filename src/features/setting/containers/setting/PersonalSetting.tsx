import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import restClient from "@/src/shared/services/RestClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ChangePasswordDialog from "../../components/ChangePasswordDialog";
import ChangePreferencesDialog from "../../components/ChangePreferencesDialog";
import ChangeIDDialog from "../../components/ChangeIDDialog";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { TabbarStackParamList } from "@/src/shared/routes/TabbarBottom";
import { MenuStackParamList } from "@/src/shared/routes/MenuNavigation";
type SettingNavigationProp = StackNavigationProp<TabbarStackParamList, "Menu">;
type MenuNavigationProp = StackNavigationProp<MenuStackParamList, "Menu">;

const UsersClient = restClient.apiClient.service("apis/users");
const AccountsClient = restClient.apiClient.service("apis/accounts");
const myPhotosClient = restClient.apiClient.service("apis/myphotos");
const DEFAULT_AVATAR = "https://picsum.photos/200/300";

interface Preference {
  id: string;
  name: string;
}

interface CCCDData {
  number: string;
  fullName: string;
  dateOfBirth: string;
  sex: string;
  nationality: string;
  placeOfOrigin: string;
  placeOfResidence: string;
  dateOfExpiry: string;
}

interface ReusableButtonProps {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  extraInfo?: string;
}

const ReusableButton = ({ label, iconName, onPress, extraInfo }: ReusableButtonProps) => {
  useTheme()
  return (
    <TouchableOpacity style={styles.buttonContainer} onPress={onPress}>
      <View style={styles.contentContainer}>
        <Ionicons name={iconName} size={24} color={Color.white_contrast} style={styles.icon} />
        <Text style={styles.label}>{label}</Text>
      </View>
      {extraInfo ? (
        <Text style={styles.extraInfo}>{extraInfo}</Text>
      ) : (
        <Ionicons name="chevron-forward" size={24} color={Color.white_contrast} />
      )}
    </TouchableOpacity>
  );
};

const ProfileScreen = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [initialUsername, setInitialUsername] = useState("");
  const [initialIntro, setInitialIntro] = useState("");
  const [initialHashtag, setInitialHashtag] = useState("");
  const [username, setUsername] = useState("");
  const [intro, setIntro] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [hashtag, setHashtag] = useState("");
  const [cccdData, setCccdData] = useState<CCCDData | null>(null);
  const [isChanged, setIsChanged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
  const [isPreferencesModalVisible, setPreferencesModalVisible] = useState(false);
  const [isIDModalVisible, setIDModalVisible] = useState(false);
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [user,setUser] = useState<any>(null);
  const navigationMenu = useNavigation<MenuNavigationProp>();
  const getUserId = async () => {
    try {
      const id = await AsyncStorage.getItem("userId");
      setUserId(id);
    } catch (err) {
      console.error("Lỗi khi lấy userId:", err);
    }
  };

  const fetchUserData = async (id: string) => {
    try {
      setLoading(true);
      const userData = await UsersClient.get(id);
      if (userData.success) {
        const displayName = userData.data.displayName || "Chưa đặt tên";
        const aboutMe = userData.data.aboutMe || "Chưa có giới thiệu";
        const userHashtag = userData.data.hashtag || `#${id.slice(-4)}`;
        const accountID = userData.data.account;
        const identificationID = userData.data.identification;

        const accountData = await AccountsClient.get(accountID);
        const password = accountData.data.password || "Chưa có mật khẩu";
        const email = accountData.data.email || "Chưa có email";

        const identificationData = await restClient.apiClient
          .service("apis/identifications")
          .get(identificationID);
        const cccd = identificationData.success
          ? {
              number: identificationData.data.number || "",
              fullName: identificationData.data.fullName || "",
              dateOfBirth: identificationData.data.dateOfBirth || "",
              sex: identificationData.data.sex || "",
              nationality: identificationData.data.nationality || "",
              placeOfOrigin: identificationData.data.placeOfOrigin || "",
              placeOfResidence: identificationData.data.placeOfResidence || "",
              dateOfExpiry: identificationData.data.dateOfExpiry || "",
            }
          : null;

        const hobbiesResponse = await UsersClient.get(`${id}/hobbies`);
        const hobbies = hobbiesResponse.success
          ? hobbiesResponse.data.map((hobby: any) => ({
              id: hobby._id,
              name: hobby.name,
            }))
          : [];

        setEmail(email);
        setPassword(password);
        setInitialUsername(displayName);
        setInitialIntro(aboutMe);
        setInitialHashtag(userHashtag);
        setUsername(displayName);
        setIntro(aboutMe);
        setHashtag(userHashtag);
        setPreferences(hobbies);
        setCccdData(cccd);
        setUser(userData.data);
      }
    } catch (err) {
      setError("Không thể tải dữ liệu hồ sơ");
      console.error("Lỗi khi lấy dữ liệu người dùng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const hasChanges = username !== initialUsername || intro !== initialIntro;
    setIsChanged(hasChanges);
  }, [username, intro]);

  useEffect(() => {
    getUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserData(userId);
    }
  }, [userId]);

  const handleSaveChanges = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const updateData = { displayName: username, aboutMe: intro };
      const response = await UsersClient.patch(userId, updateData);
      if (response.success) {
        setInitialUsername(username);
        setInitialIntro(intro);
        setIsChanged(false);
      } else {
        throw new Error("Không thể lưu thay đổi");
      }
    } catch (err) {
      setError("Lỗi khi lưu thay đổi");
      console.error("Lỗi khi lưu hồ sơ:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (oldPassword: string, newPassword: string) => {
    if (!userId) return;
    if (newPassword.length < 6) {
      throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự");
    }
    if (newPassword === oldPassword) {
      throw new Error("Mật khẩu mới không được giống mật khẩu cũ");
    }
    try {
      setLoading(true);
      const result = await restClient.apiClient
        .service("apis/accounts/updatePassword")
        .create({ email, oldPassword, newPassword });
      if (!result.success) {
        throw new Error(result.message || "Lỗi khi đổi mật khẩu từ server");
      }
      setPassword(newPassword);
    } catch (err: any) {
      console.error("Lỗi khi đổi mật khẩu:", err);
      throw new Error(err.message || "Lỗi không xác định khi đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  const handleIDSaved = (updatedCCCD: CCCDData) => {
    setCccdData(updatedCCCD);
  };

  const handlePreferencesSaved = (updatedPreferences: Preference[]) => {
    setPreferences(updatedPreferences);
  };

  const handleIntroFocus = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 300, animated: true });
    }, 100);
  };

  if (loading && !isPasswordModalVisible && !isPreferencesModalVisible && !isIDModalVisible) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error && !isPasswordModalVisible && !isPreferencesModalVisible && !isIDModalVisible) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 50}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>Cài đặt hồ sơ</Text>

          <View style={styles.buttonSection}>
            <ReusableButton
              label="Thay đổi căn cước công dân"
              iconName="id-card-outline"
              onPress={() => setIDModalVisible(true)}
            />
            <ReusableButton
              label="Thay đổi sở thích"
              iconName="heart-outline"
              onPress={() => setPreferencesModalVisible(true)}
            />
            <ReusableButton
              label="Đổi mật khẩu"
              iconName="lock-closed-outline"
              onPress={() => setPasswordModalVisible(true)}
            />
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
            <ReusableButton
              label={username}
              iconName="person-outline"
              extraInfo={hashtag}
              onPress={() =>navigationMenu.navigate("MyProfile", { screen: "MyProfile", params: { userId: userId! } })}
            />
          </View>

          {isChanged && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges} disabled={loading}>
              <Text style={styles.saveText}>{loading ? "Đang lưu..." : "Lưu thay đổi"}</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        <ChangePasswordDialog
          visible={isPasswordModalVisible}
          onClose={() => setPasswordModalVisible(false)}
          onSave={handleChangePassword}
          loading={loading}
        />
        <ChangePreferencesDialog
          visible={isPreferencesModalVisible}
          onClose={() => setPreferencesModalVisible(false)}
          onSave={handlePreferencesSaved}
          userId={userId}
          initialPreferences={preferences}
        />
        <ChangeIDDialog
          visible={isIDModalVisible}
          onClose={() => setIDModalVisible(false)}
          onSave={handleIDSaved}
          user={user}
          initialCCCD={cccdData}
        />
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Color.white_homologous,
    padding: 15,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Color.white_contrast,
    marginBottom: 15,
  },
  buttonSection: {
    marginBottom: 20,
  },
  infoSection: {
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Color.white_homologous,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginVertical: 5,
    shadowColor: Color.white_contrast,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    color: Color.white_contrast,
    marginLeft: 10,
  },
  icon: {
    marginRight: 5,
  },
  extraInfo: {
    fontSize: 14,
    color: Color.textColor3,
  },
  inputContainer: {
    marginTop: 15,
  },
  textArea: {
    borderWidth: 1,
    borderColor: Color.textColor3,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    height: 120,
    textAlignVertical: "top",
    backgroundColor: Color.white_homologous,
  },
  saveButton: {
    backgroundColor: Color.mainColor1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  saveText: {
    color: Color.white_homologous,
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
});

export default ProfileScreen;