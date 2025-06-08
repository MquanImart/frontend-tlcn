import CInput from "@/src/features/authentication/components/CInput";
import CButton from "@/src/shared/components/button/CButton";
import CIconButton from "@/src/shared/components/button/CIconButton";
import { AuthStackParamList } from "@/src/shared/routes/AuthNavigation";
import restClient from "@/src/shared/services/RestClient";
import getColor from "@/src/styles/Color";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import axios from "axios";
import { Image } from 'expo-image';
import * as ImagePicker from "expo-image-picker";
import React, { useRef, useState } from "react";
import { ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const Color = getColor();
type NavigationProp = StackNavigationProp<AuthStackParamList, "Login">;
type IDVerificationRouteProp = RouteProp<AuthStackParamList, "IDVerification">;

const extractCCCDData = async (imageUri: string, mimeType: string = 'image/jpeg') => {
    try {
        const formData = new FormData();
        formData.append('cccdImage', {
            uri: imageUri,
            type: mimeType,
            name: 'cccd.jpg',
        } as any);

        const response = await restClient.apiClient
            .service("apis/identifications/extract")
            .create(formData);
        if (!response || !response.success) {
            throw new Error(response?.messages || 'Lỗi server không xác định');
        }
        const cccdData = response.data;
        return {
            number: cccdData.number || '',
            fullName: cccdData.fullName || '',
            dateOfBirth: cccdData.dateOfBirth || '',
            sex: cccdData.sex || '',
            nationality: cccdData.nationality || '',
            placeOfOrigin: cccdData.placeOfOrigin || '',
            placeOfResidence: cccdData.placeOfResidence || '',
            dateOfExpiry: cccdData.dateOfExpiry || '',
        };
    } catch (error) {
        if (error instanceof Error && error.message.includes("E11000 duplicate key error collection")) {
            throw new Error("Căn cước công dân đã được sử dụng!");
        }
        throw new Error("Căn cước công dân không hợp lệ");
    }
};

// Hàm tính tuổi từ ngày sinh
const calculateAge = (dateOfBirth: string): number => {
    try {
        // Giả định dateOfBirth có định dạng DD/MM/YYYY
        const dob = new Date(dateOfBirth.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1')); // Chuyển DD/MM/YYYY sang YYYY-MM-DD
        if (isNaN(dob.getTime())) {
            throw new Error('Ngày sinh không hợp lệ');
        }

        const today = new Date(); // Sử dụng ngày hiện tại
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        const dayDiff = today.getDate() - dob.getDate();

        // Giảm tuổi nếu chưa đến ngày sinh nhật
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age--;
        }

        return age;
    } catch (error) {
        throw new Error('Không thể tính tuổi từ ngày sinh');
    }
};

const IDVerification = () => {
    const [displayName, setDisplayName] = useState<string>("");
    const [hashtag, setHashtag] = useState<string>("");
    const [selectedImage, setSelectedImage] = useState<{ uri: string, type: string } | null>(null);
    const [cccdData, setCccdData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<IDVerificationRouteProp>();
    const emailOrPhone = route.params?.emailOrPhone;
    const password = route.params?.password;
    const codeInputRef = useRef<TextInput>(null);

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Thông báo", "Bạn cần cấp quyền truy cập thư viện ảnh!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled && result.assets?.length) {
            const imageData = { uri: result.assets[0].uri, type: "image" };
            setSelectedImage(imageData);
            setCccdData(null);
        }
    };

    const handleTakePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
            Alert.alert("Thông báo", "Bạn cần cấp quyền truy cập máy ảnh!");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled && result.assets?.length) {
            const imageData = { uri: result.assets[0].uri, type: "image" };
            setSelectedImage(imageData);
            setCccdData(null);
        }
    };

    const handleCreateAccount = async () => {
        if (isLoading) return;

        if (!displayName || !hashtag) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ tên và mã hashtag.");
            return;
        }
        const hashtagCheck = await restClient.apiClient
            .service("apis/accounts/check-hashtag")
            .create({ hashtag });
        if (hashtagCheck.exists) {
            Alert.alert("Lỗi", "Hashtag đã tồn tại trong hệ thống");
            return;
        }
        if (!selectedImage) {
            Alert.alert("Lỗi", "Vui lòng chọn hoặc chụp ảnh CCCD.");
            return;
        }

        setIsLoading(true);

        try {
            const data = await extractCCCDData(selectedImage.uri);
            setCccdData(data);

            // Kiểm tra tuổi từ ngày sinh
            const age = calculateAge(data.dateOfBirth);
            if (age < 18) {
                Alert.alert("Lỗi", "Bạn phải từ 18 tuổi trở lên để tạo tài khoản!");
                return;
            }

            // Tạo các trường chi tiết của address từ placeOfResidence
            let province = "";
            let district = "";
            let ward = "";
            let street = "";
            let placeName = "";
            let lat: number | null = null;
            let long: number | null = null;

            if (data.placeOfResidence) {
                const addressParts = data.placeOfResidence.split(", ").map((part: string) => part.trim());
                province = addressParts[addressParts.length - 1] || "";
                district = addressParts[addressParts.length - 2] || "";
                ward = addressParts[addressParts.length - 3] || "";
                street = addressParts[0] || "";

                // Gọi API Nominatim để lấy lat, lon
                const fullAddress = `${ward}, ${district}, ${province}`.trim();
                try {
                    const response = await axios.get(
                        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddress)}&format=json&limit=1`
                    );
                    const result = response.data[0];
                    if (result) {
                        lat = parseFloat(result.lat);
                        long = parseFloat(result.lon);
                    } else {
                        console.warn("Không tìm thấy tọa độ cho địa chỉ:", fullAddress);
                    }
                } catch (apiError) {
                    console.error("Lỗi khi gọi Nominatim API:", apiError);
                    Alert.alert("Cảnh báo", "Không thể lấy tọa độ địa chỉ. Tiếp tục mà không có lat/long.");
                }
            }

            // Gọi API createAccount
            const result = await restClient.apiClient
                .service("apis/accounts/create")
                .create({
                    email: emailOrPhone,
                    password,
                    displayName,
                    hashtag,
                    number: data.number,
                    fullName: data.fullName,
                    dateOfBirth: data.dateOfBirth,
                    sex: data.sex,
                    nationality: data.nationality || "Việt Nam",
                    placeOfOrigin: data.placeOfOrigin,
                    placeOfResidence: data.placeOfResidence,
                    dateOfExpiry: data.dateOfExpiry,
                    province,
                    district,
                    ward,
                    street,
                    placeName,
                    lat,
                    long,
                });

            if (result.success) {
                Alert.alert("Thành công", "Tài khoản đã được tạo!", [
                    { text: "OK", onPress: () => navigation.navigate("PreferenceSelection", { email: emailOrPhone }) },
                ]);
            } else {
                Alert.alert("Lỗi", result.message || "Không thể tạo tài khoản.");
            }
        } catch (error) {
            Alert.alert("Lỗi", error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()} accessible={false}>
                <View style={styles.innerContainer}>
                    <View style={styles.bannerContainer}>
                        <Image
                            source={require("../../../../assets/images/logo.png")}
                            style={styles.bannerImage}
                        />
                    </View>

                    <Text style={styles.title}>Chúng tôi gọi bạn là</Text>

                    <View style={styles.row}>
                        <View style={{ flex: 7 }}>
                            <CInput
                                placeholder="Nhập tên"
                                value={displayName}
                                onChangeText={setDisplayName}
                                returnKeyType="next"
                                onSubmitEditing={() => codeInputRef.current?.focus()}
                                style={{
                                    width: "100%",
                                    height: 50,
                                    backColor: Color.white_homologous,
                                    textColor: Color.white_contrast,
                                    radius: 25,
                                    borderColor: Color.mainColor2,
                                }}
                            />
                        </View>
                        <View style={{ flex: 3 }}>
                            <CInput
                                ref={codeInputRef}
                                placeholder="#"
                                value={hashtag}
                                onChangeText={setHashtag}
                                returnKeyType="done"
                                style={{
                                    width: "100%",
                                    height: 50,
                                    backColor: Color.white_homologous,
                                    textColor: Color.white_contrast,
                                    radius: 25,
                                    borderColor: Color.mainColor2,
                                }}
                            />
                        </View>
                    </View>

                    <Text style={styles.subText}>Mã # dùng để phân biệt bạn với những người dùng cùng tên</Text>

                    <Text style={styles.sectionTitle}>Căn cước công dân</Text>
                    <View style={styles.imageButton}>
                        <TouchableOpacity onPress={handlePickImage}>
                            <Text style={styles.imageButtonText}>Chọn ảnh</Text>
                        </TouchableOpacity>
                        <CIconButton
                            icon={<Icon name={"photo-camera"} size={35} color={Color.white_homologous} />}
                            onSubmit={handleTakePhoto}
                            style={{
                                width: 70,
                                height: 50,
                                backColor: Color.mainColor1,
                                textColor: Color.textColor2,
                                radius: 25,
                                shadow: true,
                            }}
                        />
                    </View>

                    {selectedImage && (
                        <Image source={{ uri: selectedImage.uri }} style={{ width: 100, height: 100, marginBottom: 20 }} />
                    )}

                    {isLoading ? (
                        <ActivityIndicator size="large" color={Color.mainColor1} />
                    ) : (
                        <CButton
                            label="Xác nhận"
                            onSubmit={handleCreateAccount}
                            style={{
                                width: "85%",
                                height: 50,
                                backColor: Color.mainColor1,
                                textColor: Color.white_homologous,
                                fontSize: 18,
                                radius: 25,
                            }}
                        />
                    )}

                    <TouchableOpacity>
                        <Text style={styles.loginText}>
                            Bạn đã có tài khoản?{" "}
                            <Text style={styles.loginLink} onPress={() => navigation.navigate("Login")}>
                                Đăng nhập
                            </Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default IDVerification;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.white_homologous,
    },
    innerContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    bannerContainer: {
        marginBottom: 20,
    },
    bannerImage: {
        width: 300,
        height: 300,
        resizeMode: "contain",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: Color.white_contrast,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: Color.white_contrast,
        marginBottom: 10,
    },
    row: {
        flexDirection: "row",
        width: "85%",
        alignItems: "center",
        marginBottom: 0,
    },
    subText: {
        fontSize: 12,
        color: Color.textColor4,
        textAlign: "center",
        marginBottom: 10,
    },
    imageButton: {
        flexDirection: "row",
        alignItems: "center",
        width: "85%",
        height: 50,
        justifyContent: "space-between",
        borderRadius: 25,
        borderWidth: 1,
        borderColor: Color.mainColor1,
        marginBottom: 20,
    },
    imageButtonText: {
        color: Color.white_contrast,
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 120,
    },
    loginText: {
        marginTop: 20,
        fontSize: 14,
        color: Color.white_contrast,
    },
    loginLink: {
        color: Color.mainColor2,
        fontWeight: "bold",
    },
});