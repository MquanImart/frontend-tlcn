import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  TextInput,
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
import { MenuStackParamList } from "@/src/shared/routes/MenuNavigation";

type MenuNavigationProp = StackNavigationProp<MenuStackParamList, "Menu">;

const UsersClient = restClient.apiClient.service("apis/users");
const AccountsClient = restClient.apiClient.service("apis/accounts");

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
  useTheme();
  return (
    <TouchableOpacity style={[styles.buttonContainer, { backgroundColor: Color.backgroundSecondary, shadowColor: Color.textSecondary }]} onPress={onPress}>
      <View style={styles.contentContainer}>
        <Ionicons name={iconName} size={24} color={Color.textPrimary} style={styles.icon} />
        <Text style={[styles.label, { color: Color.textPrimary }]}>{label}</Text>
      </View>
      {extraInfo ? (
        <Text style={[styles.extraInfo, { color: Color.textSecondary }]}>{extraInfo}</Text>
      ) : (
        <Ionicons name="chevron-forward" size={24} color={Color.textPrimary} />
      )}
    </TouchableOpacity>
  );
};

const ProfileScreen = () => {
  useTheme();
  const [userId, setUserId] = useState<string | null>(null);
  const [initialUsername, setInitialUsername] = useState("");
  const [initialIntro, setInitialIntro] = useState("");
  const [initialHashtag, setInitialHashtag] = useState("");
  const [username, setUsername] = useState("");
  const [intro, setIntro] = useState("");
  const [password, setPassword] = useState(""); // This password state is not directly displayed, only passed to dialog
  const [email, setEmail] = useState(""); // This email state is not directly displayed, only used in logic
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
  const [user, setUser] = useState<any>(null);
  const navigationMenu = useNavigation<MenuNavigationProp>();

  const getUserId = async () => {
    try {
      const id = await AsyncStorage.getItem("userId");
      setUserId(id);
    } catch (err) {
      console.error("Lỗi khi lấy userId:", err);
      setError("Không thể lấy ID người dùng. Vui lòng thử lại.");
    }
  };

  const fetchUserData = async (id: string) => {
    try {
      setLoading(true);
      const userDataResponse = await UsersClient.get(id);
      if (!userDataResponse.success) {
        throw new Error(userDataResponse.message || "Không thể tải dữ liệu người dùng.");
      }
      const userData = userDataResponse.data;

      const displayName = userData.displayName || "Chưa đặt tên";
      const aboutMe = userData.aboutMe || "Chưa có giới thiệu";
      const userHashtag = userData.hashtag || `#${id.slice(-4)}`;
      const accountID = userData.account;
      const identificationID = userData.identification;

      // Fetch account data
      let accountEmail = "Không có email";
      let accountPassword = "Không có mật khẩu";
      if (accountID) {
        const accountDataResponse = await AccountsClient.get(accountID);
        if (accountDataResponse.success) {
          accountEmail = accountDataResponse.data.email || accountEmail;
          accountPassword = accountDataResponse.data.password || accountPassword;
        } else {
          console.warn("Could not fetch account data:", accountDataResponse.message);
        }
      }

      // Fetch identification data
      let cccd: CCCDData | null = null;
      if (identificationID) {
        const identificationDataResponse = await restClient.apiClient
          .service("apis/identifications")
          .get(identificationID);
        if (identificationDataResponse.success) {
          cccd = {
            number: identificationDataResponse.data.number || "",
            fullName: identificationDataResponse.data.fullName || "",
            dateOfBirth: identificationDataResponse.data.dateOfBirth || "",
            sex: identificationDataResponse.data.sex || "",
            nationality: identificationDataResponse.data.nationality || "",
            placeOfOrigin: identificationDataResponse.data.placeOfOrigin || "",
            placeOfResidence: identificationDataResponse.data.placeOfResidence || "",
            dateOfExpiry: identificationDataResponse.data.dateOfExpiry || "",
          };
        } else {
          console.warn("Could not fetch identification data:", identificationDataResponse.message);
        }
      }

      // Fetch hobbies
      const hobbiesResponse = await UsersClient.get(`${id}/hobbies`);
      const hobbies = hobbiesResponse.success && Array.isArray(hobbiesResponse.data)
        ? hobbiesResponse.data.map((hobby: any) => ({
            id: hobby._id,
            name: hobby.name,
          }))
        : [];

      setEmail(accountEmail);
      setPassword(accountPassword);
      setInitialUsername(displayName);
      setInitialIntro(aboutMe);
      setInitialHashtag(userHashtag);
      setUsername(displayName);
      setIntro(aboutMe);
      setHashtag(userHashtag);
      setPreferences(hobbies);
      setCccdData(cccd);
      setUser(userData);
    } catch (err: any) {
      setError(err.message || "Không thể tải dữ liệu hồ sơ.");
      console.error("Lỗi khi lấy dữ liệu người dùng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const hasChanges = username !== initialUsername || intro !== initialIntro;
    setIsChanged(hasChanges);
  }, [username, intro, initialUsername, initialIntro]);

  useEffect(() => {
    getUserId();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserData(userId);
    }
  }, [userId]);

  const handleSaveChanges = async () => {
    if (!userId) {
      setError("ID người dùng không khả dụng.");
      return;
    }
    try {
      setLoading(true);
      const updateData = { displayName: username, aboutMe: intro };
      const response = await UsersClient.patch(userId, updateData);
      if (response.success) {
        setInitialUsername(username);
        setInitialIntro(intro);
        setIsChanged(false);
        setError(null);
      } else {
        throw new Error(response.message || "Không thể lưu thay đổi.");
      }
    } catch (err: any) {
      setError(err.message || "Lỗi khi lưu thay đổi.");
      console.error("Lỗi khi lưu hồ sơ:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (oldPassword: string, newPassword: string) => {
    if (!user?.account) { // Ensure user and account are available
      throw new Error("Thông tin tài khoản không khả dụng.");
    }
    if (newPassword.length < 6) {
      throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự.");
    }
    if (newPassword === oldPassword) {
      throw new Error("Mật khẩu mới không được giống mật khẩu cũ.");
    }
    try {
      setLoading(true);
      const result = await AccountsClient.patch(`${user.account}/updatePassword`, { password: oldPassword, newPassword: newPassword });
      if (!result.success) {
        throw new Error(result.message || "Lỗi khi đổi mật khẩu từ server.");
      }
      setPassword(newPassword);
      setError(null);
    } catch (err: any) {
      console.error("Lỗi khi đổi mật khẩu:", err);
      throw new Error(err.message || "Lỗi không xác định khi đổi mật khẩu.");
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

  if (loading && !userId) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: Color.background }]}>
        <ActivityIndicator size="large" color={Color.mainColor2} />
        <Text style={{ color: Color.textPrimary, marginTop: 10 }}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (error && !loading) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: Color.background }]}>
        <Text style={[styles.errorText, { color: Color.error }]}>Lỗi: {error}</Text>
        <TouchableOpacity onPress={() => { getUserId(); setError(null); }} style={{ marginTop: 20 }}>
          <Text style={{ color: Color.mainColor2, fontSize: 16 }}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: Color.background }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 50}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollViewContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.sectionTitle, { color: Color.textPrimary }]}>Cài đặt hồ sơ</Text>

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
            <Text style={[styles.sectionTitle, { color: Color.textPrimary }]}>Thông tin cá nhân</Text>
            <View style={[styles.inputContainer, { backgroundColor: Color.backgroundSecondary, borderColor: Color.border }]}>
                <Text style={[styles.inputLabel, { color: Color.textSecondary }]}>Tên người dùng:</Text>
                <TextInput
                    style={[styles.textInput, { color: Color.textPrimary }]}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Tên của bạn"
                    placeholderTextColor={Color.textSecondary}
                    onFocus={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                />
            </View>
            <View style={[styles.inputContainer, { backgroundColor: Color.backgroundSecondary, borderColor: Color.border }]}>
                <Text style={[styles.inputLabel, { color: Color.textSecondary }]}>Giới thiệu bản thân:</Text>
                <TextInput
                    style={[styles.textArea, { color: Color.textPrimary }]}
                    value={intro}
                    onChangeText={setIntro}
                    placeholder="Giới thiệu về bản thân"
                    placeholderTextColor={Color.textSecondary}
                    multiline
                    onFocus={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                />
            </View>
            {/* Reusable button for navigation/displaying hashtag */}
            <ReusableButton
              label={user?.displayName || "Tên người dùng"}
              iconName="person-outline"
              extraInfo={hashtag}
              onPress={() => navigationMenu.navigate("MyProfile", { screen: "MyProfile", params: { userId: userId! } })}
            />
          </View>

          {isChanged && (
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: loading ? Color.backgroundTertiary : Color.mainColor2 }]}
              onPress={handleSaveChanges}
              disabled={loading}
            >
              <Text style={[styles.saveText, { color: Color.textOnMain2 }]}>
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </Text>
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
  scrollViewContent: {
    padding: 15,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
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
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginVertical: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2, // Keep elevation for Android shadows
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    marginLeft: 10,
  },
  icon: {
    marginRight: 5,
  },
  extraInfo: {
    fontSize: 14,
  },
  inputContainer: {
    marginTop: 15,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  textInput: {
    fontSize: 16,
    paddingVertical: 5,
  },
  textArea: {
    fontSize: 16,
    height: 120,
    textAlignVertical: "top",
    paddingVertical: 5,
  },
  saveButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  saveText: {
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
    fontSize: 16,
  },
});

export default ProfileScreen;