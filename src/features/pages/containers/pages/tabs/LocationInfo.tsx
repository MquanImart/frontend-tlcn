import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform, Dimensions, ActivityIndicator } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import MapView, { Marker, Region } from "react-native-maps";
import getColor from "@/src/styles/Color";
import { Page } from "@/src/interface/interface_reference";
import useLocationInfo from "./useLocationInfo";

const Color = getColor();

interface LocationInfoProps {
  page: Page;
  currentUserId: string;
  role: string;
  onMessagePress: () => void;
}

const LocationInfo: React.FC<LocationInfoProps> = ({ page, currentUserId, role, onMessagePress }) => {
  const time = page.timeOpen && page.timeClose ? `${page.timeOpen} - ${page.timeClose}` : "Không có thông tin";

  const { address, error, loading } = useLocationInfo(page.address || "");
  // Định nghĩa region dựa trên address
  const mapRegion: Region = {
    latitude: address?.lat || 0,
    longitude: address?.long || 0,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  return (
    <View style={styles.container}>
      {/* Nút Nhắn Tin */}
      <TouchableOpacity style={styles.messageButton} onPress={onMessagePress}>
        <Text style={styles.messageText}>Nhắn tin</Text>
      </TouchableOpacity>

      {/* Tiêu đề địa điểm */}
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

      {/* Thời gian hoạt động */}
      <View style={styles.infoWrapper}>
        <View style={styles.iconContainer}>
          <Icon name="schedule" size={24} color={Color.mainColor1} />
        </View>
        <View>
          <Text style={styles.infoTitle}>Thời gian hoạt động</Text>
          <Text style={styles.infoText}>{time}</Text>
        </View>
      </View>

      {/* Hiển thị quyền của người dùng */}
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
            source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Google_Maps_icon_%282020%29.svg" }}
            style={styles.mapImage}
          />
        ) : loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Color.mainColor1} />
            <Text style={styles.loadingText}>Đang tải bản đồ...</Text>
          </View>
        ) : address?.lat && address?.long ? (
          <MapView
            style={styles.map}
            region={mapRegion} // Dùng region để cập nhật động
            scrollEnabled={false}
            zoomEnabled={true}
          >
            <Marker coordinate={{ latitude: address.lat, longitude: address.long }} />
          </MapView>
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