import { Address, MyPhoto, Page } from "@/src/interface/interface_reference";
import { PageStackParamList } from "@/src/shared/routes/PageNavigation";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Dimensions, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Icon from "react-native-vector-icons/MaterialIcons";
import AdminInviteModal from "./AdminInviteModal";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_HEIGHT = (SCREEN_HEIGHT / 3) + (SCREEN_HEIGHT / 15);

type NavigationProp = StackNavigationProp<PageStackParamList>;

interface PageHeaderProps {
  page: Page;
  currentUserId: string;
  role: string;
  updatePage: () => void;
  avatar: MyPhoto | null;
  address: Address | null;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  handleMorePress: () => void;
  pendingInvites: any[];
  acceptAdminInvite: (userId: string) => void;
  declineAdminInvite: (userId: string) => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  page,
  currentUserId,
  role,
  updatePage,
  avatar,
  address,
  modalVisible,
  setModalVisible,
  handleMorePress,
  pendingInvites,
  acceptAdminInvite,
  declineAdminInvite,
}) => {
  useTheme()
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <View style={styles.reflectionContainer2}>
        <ImageBackground source={{ uri: avatar?.url || "" }} style={styles.reflectionImage2} imageStyle={styles.reflectionImageStyle}>
          <LinearGradient colors={["rgba(0,0,0,0.1)", "transparent"]} style={styles.reflectionGradient} />
        </ImageBackground>
      </View>

      <View style={styles.reflectionContainer1}>
        <ImageBackground source={{ uri: avatar?.url || "" }} style={styles.reflectionImage1} imageStyle={styles.reflectionImageStyle}>
          <LinearGradient colors={["rgba(0,0,0,0.3)", "transparent"]} style={styles.reflectionGradient} />
        </ImageBackground>
      </View>

      <View style={styles.imageWrapper}>
        <ImageBackground source={{ uri: avatar?.url || "" }} style={styles.headerImage} imageStyle={styles.imageStyle} />
      </View>

      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={Color.white_white} />
        </TouchableOpacity>

        <View style={styles.weatherContainer}>
          <MaterialCommunityIcons name="weather-sunny" size={30} color={"#FFD700"} style={styles.sunIcon} />
          <TouchableOpacity onPress={() => {
            navigation.navigate("WeatherDetail", { lat: address?.lat ?? 0, lon: address?.long ?? 0 });
          }}>
            <MaterialCommunityIcons name="cloud" size={34} color={Color.white_white} style={styles.cloudIcon} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoAndMoreContainer}>
        <View style={styles.infoBackground}>
          <Text style={styles.title}>{page.name}</Text>
          <Text style={styles.subtitle}>{address?.province}, {address?.district}</Text>
        </View>

        <TouchableOpacity style={styles.moreButton} onPress={handleMorePress}>
            <MaterialCommunityIcons name="dots-vertical" size={30} color={Color.white_white} />
            {pendingInvites.length > 0 && <View style={styles.notificationBadge} />}
        </TouchableOpacity>
      </View>

      <AdminInviteModal
        visible={modalVisible}
        invites={pendingInvites}
        onAccept={acceptAdminInvite}
        onDecline={declineAdminInvite}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

export default PageHeader;

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: Color.backGround,
    paddingBottom: SCREEN_HEIGHT * 0.0375,
  },
  imageWrapper: {
    position: "absolute",
    top: 0,
    zIndex: 3,
    width: "100%",
  },
  headerImage: {
    height: IMAGE_HEIGHT * 0.9,
    width: "100%",
  },
  imageStyle: {
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  reflectionContainer1: {
    position: "absolute",
    top: IMAGE_HEIGHT * 0.8,
    width: "85%",
    height: SCREEN_HEIGHT * 0.0625,
    overflow: "hidden",
    opacity: 0.5,
    borderRadius: 20,
    backgroundColor: Color.backGround,
    zIndex: 2,
    shadowColor: Color.white_contrast,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  reflectionImage1: {
    height: "100%",
    transform: [{ scaleY: -1 }],
  },
  reflectionContainer2: {
    position: "absolute",
    top: IMAGE_HEIGHT * 0.9,
    width: "70%",
    height: SCREEN_HEIGHT * 0.04375,
    overflow: "hidden",
    opacity: 0.2,
    borderRadius: 15,
    backgroundColor: Color.backGround,
    zIndex: 1,
    shadowColor: Color.white_white,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reflectionImage2: {
    height: "100%",
    transform: [{ scaleY: -1 }],
  },
  reflectionImageStyle: {
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  reflectionGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  topBar: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.05,
    left: SCREEN_WIDTH * 0.05,
    right: SCREEN_WIDTH * 0.05,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 5,
  },
  backButton: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: SCREEN_WIDTH * 0.02,
    borderRadius: 20,
    shadowColor: Color.white_white,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  weatherContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SCREEN_HEIGHT * 0.0075,
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 20,
  },
  sunIcon: {
    marginRight: SCREEN_WIDTH * -0.05,
    marginTop: SCREEN_HEIGHT * -0.005,
  },
  cloudIcon: {
    marginLeft: SCREEN_WIDTH * 0.0125,
  },
  distanceButton: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.1125,
    right: SCREEN_WIDTH * 0.05,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingVertical: SCREEN_HEIGHT * 0.0075,
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Color.border,
    zIndex: 5,
    shadowColor: Color.white_white,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  infoAndMoreContainer: {
    position: "absolute",
    top: IMAGE_HEIGHT * 0.5,
    left: SCREEN_WIDTH * 0.05,
    right: SCREEN_WIDTH * 0.05,
    zIndex: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoBackground: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: SCREEN_WIDTH * 0.025,
    borderRadius: 12,
    shadowColor: Color.white_white,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    flexShrink: 1,
  },
  title: {
    color: Color.white_white,
    fontSize: 26,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    flexWrap: 'wrap',
  },
  subtitle: {
    color: Color.white_white,
    fontSize: 15,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  followButton: {
    position: "absolute",
    left: SCREEN_WIDTH * 0.65,
    top: SCREEN_HEIGHT * 0.0375,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingVertical: SCREEN_HEIGHT * 0.0075,
    paddingHorizontal: SCREEN_WIDTH * 0.025,
    borderRadius: 20,
    shadowColor: Color.white_white,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 5,
  },
  followText: {
    color: Color.white_white,
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: SCREEN_WIDTH * 0.0125,
  },
  moreButton: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: SCREEN_WIDTH * 0.02,
    borderRadius: 20,
    shadowColor: Color.white_white,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 5,
    flexShrink: 0,
    marginLeft: SCREEN_WIDTH * 0.02,
  },
  notificationBadge: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.0025,
    right: SCREEN_WIDTH * 0.005,
    width: SCREEN_WIDTH * 0.025,
    height: SCREEN_HEIGHT * 0.0125,
    backgroundColor: "red",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Color.white_white,
  },
});