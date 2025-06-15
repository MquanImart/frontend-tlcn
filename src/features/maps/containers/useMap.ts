import { MapStackParamList } from "@/src/shared/routes/MapNavigation";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useEffect, useRef, useState } from "react";
import MapView, { MapPressEvent } from "react-native-maps";
import * as Location from "expo-location";
import { Alert, Animated, Linking } from "react-native";
import { NearbySearchResponse, PlaceData } from "./interfaceAPI";
import { callGetGoogleApi, callPostGoogleApi } from "@/src/shared/services/API_Google";
import restClient from "@/src/shared/services/RestClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Address, MyPhoto } from "@/src/interface/interface_reference";

type MapNavigationProp = StackNavigationProp<MapStackParamList, "CustomMap">;

export interface LocationProps {
    latitude: number; 
    longitude: number;
}

export interface LocationArticlesProps {
    _id: string;
    address: Address;
    createdBy: {
      _id: string;
      displayName: string;
      avt: MyPhoto[];
    }
}

const useMap = (lat?: number, long?:number) => {
    const translateY = useRef(new Animated.Value(0)).current;
    const translateY_S = useRef(new Animated.Value(0)).current;
    const [loadingLocations, setLoadingLocations] = useState<boolean>(true);

    const navigation = useNavigation<MapNavigationProp>();
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const mapRef = useRef<MapView | null>(null);
    const [currSaved, setCurrSaved] = useState<boolean>(false);
    const [selectedMarker, setSelectedMarker] = useState<LocationProps | null>(lat && long? {latitude: lat, longitude: long} : null);
    const [details, setDetails] = useState<PlaceData | null>(null);

    const [locationArticles, setLocationArticles] = useState<LocationArticlesProps[] | null>(null);

    const moveDetails = (up: boolean) => {
        Animated.timing(translateY, {
          toValue: up?-400:400,
          duration: 500,
          useNativeDriver: true,
        }).start();
    };
    
    const moveSaved = (up: boolean) => {
        setCurrSaved(up);
        Animated.timing(translateY_S, {
          toValue: up?-600:600,
          duration: 500,
          useNativeDriver: true,
        }).start();
    };
    useEffect(() => {
      getLocationArticlesOfFriends();
    }, []);

    useEffect(() => {
      if (selectedMarker){
        getNearbyPlaces(selectedMarker.latitude, selectedMarker.latitude)
      }
    }, [selectedMarker]);
    
    useEffect(() => {
        (async () => {
          const { status } = await Location.getForegroundPermissionsAsync();
      
          if (status === "denied") {
            Alert.alert(
              "Quyền vị trí bị từ chối",
              "Bạn đã từ chối quyền vị trí. Hãy vào cài đặt để cấp lại quyền.",
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
                "Bạn cần cấp quyền vị trí trong cài đặt để sử dụng tính năng này.",
                [
                  { text: "Hủy", style: "cancel" },
                  { text: "Mở cài đặt", onPress: () => Linking.openSettings() }
                ]
              );
              return;
            }
          }
      
          const loc = await Location.getCurrentPositionAsync({});
          setLocation(loc);
        })();
    }, []);

    useEffect(() => {
      if (!mapRef.current || !selectedMarker) return;
      mapRef.current.animateToRegion({
        latitude: selectedMarker.latitude -0.002,
        longitude: selectedMarker.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }, [selectedMarker]);

    useEffect(() => {
      if (!mapRef.current || !location || selectedMarker) return;
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }, [location, loadingLocations]);
    
    const getLocationArticlesOfFriends = async () => {
      setLoadingLocations(true);
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (userId) {
          const userAPI = restClient.apiClient.service(`apis/users/friends-location-articles`);
          const result = await userAPI.get(userId);
          if (result.success) {
            const data: any[] = result.data || [];
            setLocationArticles(data);
          } else {
            setLocationArticles([]);
          }
        } else {
          setLocationArticles([]);
        }
      } catch (err) {
        console.log("Lỗi khi lấy locationArticles:", err);
        setLocationArticles([]);
      } finally {
        setLoadingLocations(false);
      }
    };

    const handleMapPress = (event: MapPressEvent) => {
        const location = event.nativeEvent.coordinate;
        setSelectedMarker(location);
        getNearbyPlaces(location.latitude, location.longitude);
        moveDetails(true);
    };

    const clickSavedLocation = (location: LocationProps) => {
      setSelectedMarker(location);
      getNearbyPlaces(location.latitude, location.longitude);
      moveSaved(false);
      moveDetails(true);
  };
      
    const closeDetails = () => {
        setSelectedMarker(null);
        moveDetails(false);
    };

    const getDetails = (newDtails: PlaceData) => {
      setDetails(newDtails);
      setSelectedMarker(newDtails.location);
      moveDetails(true);
    }
    
    const getNearbyPlaces = async (latitude: number, longitude: number) => {
      const baseUrl = "https://places.googleapis.com/v1/places:searchNearby";

      const data = {
        locationRestriction: {
          circle: {
            center: {
              latitude: latitude,
              longitude: longitude,
            },
            radius: 50.0, // Bán kính 50m
          },
        },
      };
    
      const headers = {
        "X-Goog-FieldMask": "*", // Chỉ lấy các trường cần thiết
      };
    
      // Gọi API
      const result = await callPostGoogleApi<NearbySearchResponse>(baseUrl, data, headers);
      if (result && result.places && result.places.length > 0) {
        const placeId = result.places[0].id; // Lấy placeId của địa điểm gần nhất
        
        // Nếu cần chi tiết hơn, gọi tiếp API Place Details
        fetchPlaceDetails(placeId);
      } else {
        console.log("Không tìm thấy địa điểm gần đây.");
      }
    }

    const fetchPlaceDetails = async (placeId: string) => {
      const baseUrl = `https://places.googleapis.com/v1/places/${placeId}`;
      const result = await callGetGoogleApi<PlaceData>(baseUrl, 
          {},
          { "X-Goog-FieldMask": "*" });
      if (result) {
       getDetails(result);
      }
    };

    const navigationDirection = () => {
      if (location && selectedMarker){
        navigation.navigate("Directions", {
          start: {longitude: location.coords.longitude, latitude: location.coords.latitude, displayName: "Vị trí của bạn"}, 
          end: {longitude: selectedMarker.longitude, latitude: selectedMarker.latitude, displayName: details && details.displayName.text || "Không xác định"}}
        )
      }
    }
    
    return {
        navigation, location,
        mapRef, details,
        currSaved, selectedMarker,
        translateY, translateY_S,
        setCurrSaved, closeDetails,
        moveDetails, moveSaved,
        handleMapPress, getDetails,
        navigationDirection, clickSavedLocation,
        locationArticles, loadingLocations
    }
}

export default useMap;