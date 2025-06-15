import { View, StyleSheet, Animated, ActivityIndicator, Text, Image } from "react-native"
import MapView, { Marker, Callout } from "react-native-maps";
import HeaderMap from "../components/HeaderMap";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import CardDetails from "../components/CardDetails";
import ListSaveLocation from "./saved/ListSaved";
import useMap, { LocationArticlesProps } from "./useMap";
import { RouteProp, useRoute } from "@react-navigation/native";
import { MapStackParamList } from "@/src/shared/routes/MapNavigation";

interface FriendLocationMarkerProps {
  item: LocationArticlesProps;
}

const FriendLocationMarker: React.FC<FriendLocationMarkerProps> = ({ item }) => {
  const latRaw = item.address?.lat;
  const longRaw = item.address?.long;
  const latNum = latRaw != null ? Number(latRaw) : NaN;
  const longNum = longRaw != null ? Number(longRaw) : NaN;
  if (isNaN(latNum) || isNaN(longNum)) {
    return null;
  }

  const creator = item.createdBy;
  const displayName = creator?.displayName || 'Bạn bè đã ghé thăm';

  const avatarArr = creator?.avt;
  const avatarUrl = avatarArr && avatarArr.length > 0
    ? avatarArr[avatarArr.length - 1].url
    : null;

  return (
    <Marker
      key={item._id} // key sẽ được truyền khi dùng trong map
      coordinate={{ latitude: latNum, longitude: longNum }}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            borderWidth: 1,
            borderColor: '#fff',
          }}
        />
      ) : (
        <Image
          source={require('@/src/assets/images/default/default_user.png')}
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
          }}
        />
      )}
      <Callout tooltip>
        <View style={styles.markerText}>
          <Text>{displayName}</Text>
        </View>
      </Callout>
    </Marker>
  );
};

const CustomMap = () => {
  useTheme()
  const route = useRoute<RouteProp<MapStackParamList, "CustomMap">>();
  const {lat, long} = route.params || {};

  const {
    mapRef,
    currSaved, selectedMarker,
    location, details,
    translateY, translateY_S,
    locationArticles,
    loadingLocations,
    moveSaved,
    handleMapPress, closeDetails,
    getDetails, navigationDirection,
    clickSavedLocation,

  } = useMap(lat, long);

  if (!locationArticles) return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator/></View>

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <HeaderMap startTab="Bản đồ" getDetails={getDetails} rightPress={() => moveSaved(!currSaved)} closeDetails={closeDetails}/>
      </View>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 10.762622,
          longitude: 106.660172,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        onPress={handleMapPress}
      >
        {location && <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="Vị trí của tôi"
          image={require('@/src/assets/images/default/default_user.png')}
        />}
        {selectedMarker && <Marker
          coordinate={{
            latitude: selectedMarker.latitude,
            longitude: selectedMarker.longitude,
          }}
          title="Chọn"
        />}
        {locationArticles?.map(item => (
          <FriendLocationMarker key={item._id} item={item} />
        ))}
      </MapView>
      {loadingLocations && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Đang tải điểm của bạn bè...</Text>
        </View>
      )}
      <Animated.View style={[styles.details, {
            transform: [{ translateY }],
            backgroundColor: Color.background, 
          },]}>
        <CardDetails
          details={details} closeDetails={closeDetails}
          pressDirection={navigationDirection} location={selectedMarker}
        />
      </Animated.View>

      <Animated.View style={[styles.saveds, {
            transform: [{ translateY: translateY_S }],
            backgroundColor: Color.background, 
          },]}>
        <ListSaveLocation clickItem={clickSavedLocation} open={currSaved} setOpen={moveSaved}/>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    searchContainer: {
      position: "absolute",
      zIndex: 1,
    },
    map: {
      flex: 1,
    },
    errorText: {
      color: Color.error,
      fontSize: 16,
    },
    details: {
      width: '100%', height: 400,
      position: 'absolute',
      bottom: -400,
      padding: 10,
      borderStartEndRadius: 20, borderStartStartRadius: 20,
      zIndex: 5,
    },
    saveds: {
      width: '100%', height: 600,
      position: 'absolute',
      bottom: -600,
      padding: 10,
      borderStartEndRadius: 20, borderStartStartRadius: 20,
      zIndex: 6,
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.7)',
      zIndex: 10,
    },
    markerText: {
      backgroundColor: 'white',
      padding: 5,
      borderRadius: 6,
      borderColor: '#fff',
      borderWidth: 1,
      minWidth: 100,
      alignItems: 'center',
    }
  });

export default CustomMap;