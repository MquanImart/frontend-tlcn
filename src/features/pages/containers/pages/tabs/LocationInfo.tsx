// src/features/pages/containers/tabs/LocationInfo.tsx (Đã sửa)
import { Location as MapLocationType } from "@/src/features/maps/containers/directions/interfaceLocation";
import { Page } from "@/src/interface/interface_reference";
import { PageStackParamList } from "@/src/shared/routes/PageNavigation"; // Đảm bảo đúng PageStackParamList
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Image } from 'expo-image';
import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import Icon from "react-native-vector-icons/MaterialIcons";
import useLocationInfo from "./useLocationInfo";

interface LocationInfoProps {
  page: Page;
  currentUserId: string;
  role: string;
  onMessagePress: () => void;
}
type LocationInfoNavigationProp = StackNavigationProp<PageStackParamList, "MapNavigation">;
const LocationInfo: React.FC<LocationInfoProps> = ({ page, currentUserId, role, onMessagePress }) => {
  useTheme()
  const navigation = useNavigation<LocationInfoNavigationProp>();
  const time = page.timeOpen && page.timeClose ? `${page.timeOpen} - ${page.timeClose}` : "Không có thông tin";
  const { address, error, loading } = useLocationInfo(page.address || "");
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

  const mapRegion = {
    latitude: address?.lat || 0,
    longitude: address?.long || 0,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();

      if (status === "denied") {
        Alert.alert(
          "Quyền vị trí bị từ chối",
          "Bạn đã từ chối quyền vị trí. Hãy vào cài đặt để cấp phép.",
          [
            { text: "Hủy", style: "cancel" },
            { text: "Mở cài đặt", onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }

      if (status !== "granted") {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        if (newStatus !== "granted") {
          Alert.alert(
            "Không thể truy cập vị trí",
            "Bạn cần cấp quyền vị trí để sử dụng tính năng này.",
            [
              { text: "Hủy", style: "cancel" },
              { text: "Mở cài đặt", onPress: () => Linking.openSettings() }
            ]
          );
          return;
        }
      }

      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation(loc);
    })();
  }, []);

  const handleMapPress = () => {
    if (address?.lat && address?.long) {
      try {
        navigation.navigate("MapNavigation", {
          screen: "Directions", 
          params: {
            start: userLocation
              ? {
                  latitude: userLocation.coords.latitude,
                  longitude: userLocation.coords.longitude,
                  displayName: "Vị trí của bạn",
                }
              : undefined,
            end: {
              latitude: address.lat,
              longitude: address.long,
              displayName: page.name || "Địa điểm",
            } as MapLocationType, 
          },
        });
        // -----------------------------------------------------------------------
      } catch (err) {
        console.error("Lỗi điều hướng:", err);
        Alert.alert("Lỗi", "Không thể điều hướng đến Directions. Vui lòng thử lại.");
      }
    } else {
      Alert.alert("Lỗi", "Không có tọa độ hợp lệ để điều hướng.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Nút nhắn tin */}
      <TouchableOpacity style={styles.messageButton} onPress={onMessagePress}>
        <Text style={styles.messageText}>Nhắn tin</Text>
      </TouchableOpacity>

      {/* Tên địa điểm */}
      <Text style={styles.placeName}>{page.name}</Text>

      {/* Thông tin địa chỉ */}
      <View style={styles.infoWrapper}>
        <View style={styles.iconContainer}>
          <Icon name="place" size={24} color={Color.mainColor1} />
        </View>
        <Text style={styles.infoText}>
          {address
            ? [address.street, address.ward, address.district, address.province].filter(Boolean).join(", ")
            : error || "Không có địa chỉ"}
        </Text>
      </View>

      {/* Giờ hoạt động */}
      <View style={styles.infoWrapper}>
        <View style={styles.iconContainer}>
          <Icon name="schedule" size={24} color={Color.mainColor1} />
        </View>
        <View>
          <Text style={styles.infoTitle}>Thời gian hoạt động</Text>
          <Text style={styles.infoText}>{time}</Text>
        </View>
      </View>

      {/* Vai trò người dùng */}
      <View style={styles.infoWrapper}>
        <View style={styles.iconContainer}>
          <Icon name="person" size={24} color={Color.mainColor1} />
        </View>
        <Text style={styles.infoText}>
          {role === "isOwner"
            ? "Chủ sở hữu"
            : role === "isAdmin"
            ? "Quản trị viên"
            : role === "isFollower"
            ? "Người theo dõi"
            : "Người xem"}
        </Text>
      </View>

      {/* Bản đồ */}
      <View style={styles.mapContainer}>
        {Platform.OS === "web" ? (
          <Image
            source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Maps_icon_%282020%29.svg" }}
            style={styles.mapImage}
            onError={(e) => console.warn("Lỗi tải hình ảnh:", e)}
          />
        ) : loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Color.mainColor1} />
            <Text style={styles.loadingText}>Đang tải bản đồ...</Text>
          </View>
        ) : address?.lat && address?.long ? (
          <TouchableOpacity activeOpacity={0.8} onPress={handleMapPress} disabled={!address?.lat || !address?.long}>
            <MapView
              style={styles.map}
              region={mapRegion}
              scrollEnabled={false}
              zoomEnabled={true}
            >
              <Marker coordinate={{ latitude: address.lat, longitude: address.long }} />
            </MapView>
          </TouchableOpacity>
        ) : (
          <Text style={styles.errorText}>Không thể hiển thị bản đồ: {error || "Không có tọa độ"}</Text>
        )}
      </View>
    </View>
  );
};

export default LocationInfo;

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 10,
  },
  placeName: {
    fontSize: 20,
    fontWeight: "bold",
    color: Color.textColor1,
    marginBottom: 12,
  },
  infoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#F5F5F5",
    borderRadius: 50,
    padding: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Color.textColor1,
  },
  infoText: {
    fontSize: 14,
    color: Color.textColor1,
    flex: 1,
  },
  mapContainer: {
    width: width - 40,
    height: 200,
    borderRadius: 15,
    overflow: "hidden",
    marginTop: 10,
    backgroundColor: "#EAEAEA",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  messageButton: {
    marginBottom: 10,
    backgroundColor: Color.mainColor1,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  messageText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: Color.textColor1,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    padding: 10,
  },
});