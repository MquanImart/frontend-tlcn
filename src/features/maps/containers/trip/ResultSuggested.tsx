import { View, StyleSheet, Text, Animated, Dimensions, ActivityIndicator, TouchableOpacity } from "react-native"
import MapView, { Marker } from "react-native-maps";
import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import useTrip from "./useTrip";
import { SuggestedDetails } from "./FormSuggested";
import restClient from "@/src/shared/services/RestClient";
import { FlatList } from "react-native-gesture-handler";
import CIconButton from "@/src/shared/components/button/CIconButton";
import Icon from "react-native-vector-icons/MaterialIcons";
import { CLocation, Trip } from "@/src/interface/interface_detail";
import AsyncStorage from "@react-native-async-storage/async-storage";
import formatBoldText from "@/src/shared/utils/FormatBoldText";

export interface LocationProps{
  latitude: number;
  longitude: number;
}

interface RouteDetail {
  route: number[];
  score: number;
  bestStartHour: number;
  distance: number;
  duration: number;
  description: string;
}

interface ResultSuggestedProps{
    input: SuggestedDetails;
    handleSubmitChange: (trip: Trip) => void;
}

const ResultSuggested = ({ input, handleSubmitChange } : ResultSuggestedProps) => {
  useTheme();
  const { trip, getTrip } = useTrip(input.tripId);

  const translateY = useRef(new Animated.Value(0)).current;
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const mapRef = useRef<MapView>(null);
  const [isDetails, setIsDetails] = useState<boolean>(false);

  const [suggested, setSuggested] = useState<RouteDetail[]>([]);
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
    setSuggested(result.data);
  }

  if (errorMsg || !trip) {
    return (
      <View style={styles.container}>
        <Text style={[styles.errorText, { color: Color.error }]}>{errorMsg}</Text>
      </View>
    );
  }

  if (!suggested || suggested.length <= 0)
    return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator color={Color.mainColor2}/></View>

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
            backgroundColor: Color.background,
          }]}>
        <View style={styles.boxSuggest}>
          <Text style={[styles.name, { color: Color.textPrimary }]}>Danh sách đề xuất</Text>
          <CIconButton icon={<Icon name={isDetails?"keyboard-arrow-down":"keyboard-arrow-up"} size={20} color={Color.textPrimary}/>}
              onSubmit={() => {moveDetails(!isDetails)}}
              style={{
                  width: 50,
                  height: 50,
                  fontSize: 13,
                  radius: 50,
                  flex_direction: 'row',
                  backColor: 'transparent',
                  textColor: 'transparent'
              }}
          />
        </View>
        <FlatList style={styles.list} data={suggested} renderItem={({item}) =>
            <CardResult trip={trip} route={item.route} description={item.description} bestStartHour={item.bestStartHour}
              handleSubmitChange={handleSubmitChange}
            />
        }/>
      </Animated.View>
    </View>
  )
}

const CardResult = ({
  trip, route, description, bestStartHour, handleSubmitChange
} : {
  trip: Trip, route: number[]; description: string, bestStartHour: number, handleSubmitChange: (trip: Trip) => void
  }
) => {
  const getLocationFromRoute = (index: number): CLocation => {
    if (index === 0) return trip.startAddress;
    if (index === route.length - 1) return trip.endAddress;
    return trip.listAddress[route[index] - 1];
  };

  const updateTrip = async (id: string, data: Trip) => {
    const userId = await AsyncStorage.getItem("userId");
    if (userId){
      const mapAPI = restClient.apiClient.service(`apis/trips`);
      const result = await mapAPI.patch(id, {
        name: data.name,
        startAddress: data.startAddress,
        listAddress: data.listAddress,
        endAddress: data.endAddress
      })
      if (result.success){
        return true;
      }
      return false;
    }
    return false;
  }

  const handleUseThisTrip = async () => {
    try {
      const newListAddress = route
        .slice(1, route.length - 1)
        .map(index => trip.listAddress[index - 1]);

      const updatedTrip: Trip = {
        ...trip,
        listAddress: newListAddress
      };

      const result = await updateTrip(trip._id, updatedTrip);
      if (result){
        handleSubmitChange(updatedTrip);
      } else {
        alert('Không thể sử dụng tuyến đường này. Vui lòng thử lại sau!')
      }
    } catch (err) {
      alert('Có lỗi xảy ra khi thay đổi tuyến đường. Vui lòng thử lại sau!')
    }
  };

  const orderedLocations = route.map((_, i) => getLocationFromRoute(i));

  return (
    <View style={[styles.card, { backgroundColor: Color.backgroundSecondary, borderColor: Color.border }]}>
      <Text style={[{ fontSize: 18, fontWeight: 'bold', color: Color.textPrimary }]}>
        {trip.name}
      </Text>
      <Text style={[styles.textLabel, { color: Color.textPrimary }]}>Thời gian xuất phát: {bestStartHour}:00</Text>
      <Text style={[styles.textLabel, { color: Color.textPrimary }]}>Lộ trình di chuyển</Text>
      {orderedLocations.map((loc, index) => (
        <View key={index} style={{ marginBottom: 4 }}>
          <Text style={[styles.textLocation, { color: Color.textPrimary }]}>
            {index + 1}. {loc.displayName}
          </Text>
        </View>
      ))}
      <Text style={[styles.textLabel, { color: Color.textPrimary }]}>Mô tả</Text>
      <Text style={[{ fontStyle: 'italic', color: Color.textPrimary }]}>{formatBoldText(description)}</Text>
      <View style={{width: '100%'}}>
        <TouchableOpacity style={[styles.button, { backgroundColor: Color.mainColor2 }]} onPress={handleUseThisTrip}>
          <Text style={[styles.textButton, { color: Color.textOnMain2 }]}>Sử dụng lịch trình này</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
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
    name: {
      fontSize: 20,
      fontWeight: 'bold',
      marginVertical: 20,
    },
    boxSuggest: {
      width: '100%', height: '13%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 10
    },
    textLocation: {
      fontWeight: '500'
    },
    textLabel: {
      fontSize: 17,
      fontWeight: '600',
      marginTop: 10,
    },
    card: {
      padding: 5,
      borderWidth: 1,
      borderRadius: 8,
      margin: 5,
      marginBottom: 50
    },
    textButton: {
      textAlign: 'center',
      fontWeight: '300'
    },
    button:{
      width: '60%',
      alignSelf: 'center',
      padding: 10,
      borderRadius: 5
    },
    list: {
      height: '87%',
    }
  });

export default ResultSuggested;