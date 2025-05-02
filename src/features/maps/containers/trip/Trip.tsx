import { View, StyleSheet, Text, Animated } from "react-native"
import MapView, { Marker } from "react-native-maps";
import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import getColor from "@/src/styles/Color";
import { MapStackParamList } from "@/src/shared/routes/MapNavigation";
import { RouteProp, useRoute } from "@react-navigation/native";
import HeaderMap from "../../components/HeaderMap";
import DetailsTrip from "../../components/DetailsTrip";
import useTrip from "./useTrip";

export interface LocationProps{
  latitude: number; 
  longitude: number;
}

const Color = getColor();

const Trip = () => {
  const route = useRoute<RouteProp<MapStackParamList, "Trip">>();
  const { tripId } = route.params || {};

  const { trip, getTrip, setTrip } = useTrip(tripId);

  const translateY = useRef(new Animated.Value(0)).current;
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);

  const [isDetails, setIsDetails] = useState<boolean>(false);

  const moveDetails = (up: boolean) => {
    Animated.timing(translateY, {
      toValue: up?-350: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
    setIsDetails(up);
  };

  useEffect(() => {
    getTrip();
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);
  
  if (errorMsg || !trip) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <HeaderMap startTab="Chuyến đi" getDetails={() => {}}/>
      </View>
      <MapView
        ref={mapRef}
        style={styles.map}
      >
        {location && <Marker
          coordinate={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }}
          title="Vị trí của tôi"
        />}
        <Marker
          key={`start`}
          coordinate={{
            latitude: trip.startAddress.latitude,
            longitude: trip.startAddress.longitude,
          }}
          title={`Điểm bắt đầu`}
        />
        {trip.listAddress.map((item, index) => 
        <Marker
          key={`destination-${index}`}
          coordinate={{
            latitude: item.latitude,
            longitude: item.longitude,
          }}
          title={`Điểm dến thứ ${index + 1}`}
        />)}
        <Marker
          key={`end`}
          coordinate={{
            latitude: trip.endAddress.latitude,
            longitude: trip.endAddress.longitude,
          }}
          title={`Điểm dến cuối cùng`}
        />
      </MapView>
      <Animated.View style={[styles.details, {
            transform: [{ translateY }],
          }]}>
        <DetailsTrip trip={trip} setTrip={setTrip} closeDetails={() => {moveDetails(!isDetails)}} currState={isDetails}/>
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
      color: "red",
      fontSize: 16,
    },
    details: {
        width: '100%', height: 550,
        position: 'absolute',
        bottom: -380,
        backgroundColor: Color.backGround,
        paddingVertical: 10,
        borderStartEndRadius: 20, borderStartStartRadius: 20,
        zIndex: 5,
    },
  });
  
export default Trip;