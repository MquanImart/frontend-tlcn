import { View, StyleSheet, Animated } from "react-native"
import MapView, { Marker } from "react-native-maps";
import HeaderMap from "../components/HeaderMap";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import CardDetails from "../components/CardDetails";
import ListSaveLocation from "./saved/ListSaved";
import useMap from "./useMap";
import { RouteProp, useRoute } from "@react-navigation/native";
import { MapStackParamList } from "@/src/shared/routes/MapNavigation";


const CustomMap = () => {
  useTheme()
  const route = useRoute<RouteProp<MapStackParamList, "CustomMap">>();
  const {lat, long} = route.params || {};

  const {
    mapRef,
    currSaved, selectedMarker,
    location, details,
    translateY, translateY_S,
    moveSaved,
    handleMapPress, closeDetails,
    getDetails, navigationDirection,
    clickSavedLocation,

  } = useMap(lat, long);

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
        />}
        {selectedMarker && <Marker
          coordinate={{
            latitude: selectedMarker.latitude,
            longitude: selectedMarker.longitude,
          }}
          title="Chọn"
        />}
      </MapView>
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
    }
  });

export default CustomMap;