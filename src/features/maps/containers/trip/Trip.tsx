import { View, StyleSheet, Text, Animated, TouchableOpacity, Dimensions } from "react-native"
import MapView, { Marker } from "react-native-maps";
import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { MapStackParamList } from "@/src/shared/routes/MapNavigation";
import { RouteProp, useRoute } from "@react-navigation/native";
import HeaderMap from "../../components/HeaderMap";
import DetailsTrip from "../../components/DetailsTrip";
import useTrip from "./useTrip";
import FormSuggested from "./FormSuggested";
import { Trip } from "@/src/interface/interface_detail";

export interface LocationProps{
  latitude: number;
  longitude: number;
}

const TripScreen = () => {
  useTheme();
  const route = useRoute<RouteProp<MapStackParamList, "Trip">>();
  const { tripId } = route.params || {};

  const { trip, getTrip, setTrip, changeListTrip } = useTrip(tripId);

  const translateY = useRef(new Animated.Value(0)).current;
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);
  const [showForm, setShowForm] = useState(false);

  const [isDetails, setIsDetails] = useState<boolean>(false);

  const handleChangeListTrip = (trip: Trip) => {
    changeListTrip(trip);
    setShowForm(false);
  }

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
        <Text style={[styles.errorText, { color: Color.error }]}>{errorMsg}</Text>
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
            backgroundColor: Color.background,
          }]}>
        <DetailsTrip trip={trip} setTrip={setTrip} closeDetails={() => {moveDetails(!isDetails)}} currState={isDetails}
          suggestedForm={setShowForm}
        />
      </Animated.View>
      {showForm && (
        <View style={[styles.overlay, { backgroundColor: Color.background }]}>
          <View style={[styles.boxTitle, { backgroundColor: Color.background + 'B3' }]}>
            <Text style={[styles.titleForm, { color: Color.textPrimary }]}>Gợi ý lộ trình</Text>
            <TouchableOpacity style={[styles.closeButton, { backgroundColor: Color.backgroundSecondary }]} onPress={() => setShowForm(false)}>
              <Text style={[styles.closeText, { color: Color.textPrimary }]}>✕</Text>
            </TouchableOpacity>
          </View>
          <FormSuggested tripId={tripId} numVisitPlaces={trip.listAddress} handleSubmitChange={handleChangeListTrip}/>
        </View>
      )}
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
      fontSize: 16,
    },
    details: {
      width: '100%', height: 550,
      position: 'absolute',
      bottom: -380,
      paddingVertical: 10,
      borderStartEndRadius: 20, borderStartStartRadius: 20,
      zIndex: 5,
    },
    boxTitle: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'center',
      position: 'absolute',
      top: 40,
      zIndex: 10,
      padding: 10,
    },
    titleForm: {
      fontSize: 20,
      fontWeight: 'bold'
    },
      overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      width: Dimensions.get("window").width,
      height: Dimensions.get("window").height,
      zIndex: 9,
    },
    closeButton: {
      position: "absolute",
      top: 5,
      right: 16,
      zIndex: 10,
      borderRadius: 20,
      padding: 6,
    },
    closeText: {
      fontSize: 18,
      fontWeight: "bold",
    },
  });

export default TripScreen;