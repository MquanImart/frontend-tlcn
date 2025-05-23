import { View, StyleSheet, Text, Animated, Dimensions } from "react-native"
import MapView, { Marker } from "react-native-maps";
import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import getColor from "@/src/styles/Color";
import HeaderMap from "../../components/HeaderMap";
import useTrip from "./useTrip";
import { SuggestedDetails } from "./FormSuggested";
import restClient from "@/src/shared/services/RestClient";
import { FlatList } from "react-native-gesture-handler";

export interface LocationProps{
  latitude: number; 
  longitude: number;
}

const Color = getColor();

interface ResultSuggestedProps{
    input: SuggestedDetails;
}

interface RouteDetail {
  route: number[];
  score: number;
  bestStartHour: number;
  distandce: number; // Có vẻ như đây là một lỗi chính tả, nên là "distance"
  duration: number;
  description: string;
}

const ResultSuggested = ({ input } : ResultSuggestedProps) => {

  const { trip, getTrip } = useTrip(input.tripId);

  const translateY = useRef(new Animated.Value(0)).current;
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);

  const [suggested, setSuggested] = useState<RouteDetail[]>([]);
  const moveDetails = (up: boolean) => {
    Animated.timing(translateY, {
      toValue: up?-350: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    getTrip();
    getSuggestedAPI();
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

  const getSuggestedAPI = async () => {
    const routeAPI = restClient.apiClient.service('apis/ai/route-suggestions');
    const result = await routeAPI.create(input);
    setSuggested(result);
  }
  
  if (errorMsg || !trip) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
        <FlatList data={suggested} renderItem={({item}) => 
            <CardResult route={item.route} description={item.description}/>
        }/>
      </Animated.View>
    </View>
  )
}

const CardResult = ({route, description} : {route: number[]; description: string}) => {

    return (
        <View>

        </View>
    )
}
const styles = StyleSheet.create({
    container: {
      width: "100%", height: '100%'
    },
    searchContainer: {
      position: "absolute",
      zIndex: 1,
    },
    map: {
      flex: 1,
      marginTop: 10
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
    boxTitle: {
      flexDirection: 'row',
      justifyContent: 'center'
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
      backgroundColor: "white", // hoặc rgba(0,0,0,0.5) nếu muốn làm mờ nền
      zIndex: 999,
      paddingTop: 60, // chừa chỗ cho nút đóng
    },
    closeButton: {
      position: "absolute",
      top: 0,
      right: 16,
      zIndex: 1000,
      backgroundColor: "#eee",
      borderRadius: 20,
      padding: 6,
    },
    closeText: {
      fontSize: 18,
      fontWeight: "bold",
    },
  });
  
export default ResultSuggested;