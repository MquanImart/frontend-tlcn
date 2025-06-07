import { Conversation } from "@/src/interface/interface_flex";
import { MapStackParamList } from "@/src/shared/routes/MapNavigation";
import { callPostGoogleApi } from "@/src/shared/services/API_Google";
import restClient from "@/src/shared/services/RestClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Location from 'expo-location';
import { Magnetometer } from 'expo-sensors';
import { useEffect, useRef, useState } from "react";
import { Alert, Linking } from "react-native";
import MapView from "react-native-maps";
import decodePolyline from "../../utils/DecodePolyline";
import { LocationRoute } from "../directions/interfaceAPIRoute";
import { RoutesResponse } from "../interfaceRoute";

type MapNavigationProp = StackNavigationProp<MapStackParamList, "CustomMap">;

function useRealDirections (
    locations: LocationRoute[]
) {
    const navigation = useNavigation<MapNavigationProp>();
    const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
    const [destinations, setDestinations] = useState<LocationRoute[]>(locations);
    const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number; }[]>([]);
    const [listSOS, setListSOS] = useState<string[]>([]);
    const [heading, setHeading] = useState(0);

    const mapRef = useRef<MapView | null>(null);

    useEffect(() => {
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission to access location was denied');
          return;
        }
    
        let location = await Location.getCurrentPositionAsync({});
        setLocation(location.coords);
      })();
      getAllSos();
    }, []);

    useEffect(() => {
      if (location) {
        const fetchRoutes = async () => {
          let allCoordinates: { latitude: number; longitude: number }[] = [];
          
          const points = [
            {
              latitude: location.latitude,
              longitude: location.longitude,
            },
            ...destinations,
          ];
    
          for (let i = 0; i < points.length - 1; i++) {
            const start = points[i];
            const end = points[i + 1];
    
            const routePoints = await getRoute("DRIVE", start, end);
            
            allCoordinates = [...allCoordinates, ...routePoints];
          }
    
          setCoordinates(allCoordinates);
        };
    
        fetchRoutes();
      }
    }, [location, destinations]);

    useEffect(() => {
        let subscription: Location.LocationSubscription;
      
        const startWatching = async () => {
          subscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 2000,
              distanceInterval: 5,
            },
            (newLocation) => setLocation(newLocation.coords)
          );
        };
      
        startWatching();
      
        return () => {
          if (subscription) {
            subscription.remove();
          }
        };
    }, []);

    useEffect(() => {
        const subscription = Magnetometer.addListener((data) => {
          const angle = getAngleFromMagnetometer(data);
          setHeading(angle);
        });
    
        Magnetometer.setUpdateInterval(1000);
    
        return () => subscription.remove();
    }, []);
    

    useEffect(() => {
        if (mapRef.current) {
          mapRef.current.animateCamera({
            heading: heading,
            pitch: 50,
          }, { duration: 300 });
        }
      }, [heading]);

    function getAngleFromMagnetometer({ x, y }: { x: number; y: number }) {
        let angle = Math.atan2(y, x) * (180 / Math.PI);
        return angle >= 0 ? angle : 360 + angle;
    }

    const getRoute = async (travelMode: "DRIVE" | "WALK" | "MOTORCYCLE", startLocation: LocationRoute, endLocation: LocationRoute) => {
      const url = 'https://routes.googleapis.com/directions/v2:computeRoutes';
      const header = { 'X-Goog-FieldMask': '*' };
      const body = {
          origin: { location: { latLng: {
            latitude: startLocation.latitude,
            longitude: startLocation.longitude
        } } },
          destination: { location: { latLng: {
            latitude: endLocation.latitude,
            longitude: endLocation.longitude
        } } },
          travelMode: travelMode === "MOTORCYCLE" ? "DRIVE" : travelMode, // Google chưa hỗ trợ MOTORCYCLE
          polylineQuality: 'HIGH_QUALITY',
          polylineEncoding: 'ENCODED_POLYLINE',
          routingPreference: 
              travelMode === "DRIVE" ? "TRAFFIC_AWARE" :
              travelMode === "MOTORCYCLE" ? "TRAFFIC_AWARE_OPTIMAL" : "TRAFFIC_UNAWARE",
      };
  
      try {
          const result = await callPostGoogleApi<RoutesResponse>(url, body, header);
          if (result && result.routes && result.routes.length) {
              const encodedPolyline = result.routes[0].polyline.encodedPolyline;
              const decodedPoints = decodePolyline(encodedPolyline);
              return decodedPoints;
          } else {
              return [];
          }
      } catch (error) {
        return [];
      }
    };

    const focusUserLocation = () => {
        if (mapRef.current && location) {
            // Tạo một camera mới với các tọa độ ban đầu
            mapRef.current.animateCamera({
                center: {
                    latitude: location.latitude,
                    longitude: location.longitude,
                },
                pitch: 50, // Góc nghiêng của bản đồ
                heading: heading, // Hướng nhìn
                altitude: 500, // Độ cao
                zoom: 15, // Zoom phù hợp
            });
        }
    }

    const getAllSos = async () => {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return;
        const conversationAPI = restClient.apiClient.service(`apis/conversations/sos`);
        const result = await conversationAPI.get(userId);
        if (result.success){
          setListSOS(result.data.map((item: Conversation) => item._id));
        }
    }

    const getCurrentLocation = async () : Promise<{lat: number, long: number}> => {
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
        return {lat: 0, long: 0};
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
          return {lat: 0, long: 0};
        }
      }
  
      const loc = await Location.getCurrentPositionAsync({});
      return {lat: loc.coords.latitude, long: loc.coords.longitude}
    };

    const handleSos = async () => {
      try {
        // Lấy vị trí hiện tại
        const { lat, long } = await getCurrentLocation();
        // Gửi tin nhắn SOS cho từng conversation
        listSOS.forEach((conversationId) => {
          sendMessage(conversationId, lat, long);
        });
      } catch (error) {
        alert('Lỗi khi lấy vị trí ');
      }
    };

    const sendMessage = async ( currConversationId: string, lat: number, long: number) => {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) return;
      try {
          const formData = new FormData();
      
          formData.append("conversationId", currConversationId);
          formData.append("sender", userId);
          formData.append("type", 'map');
          formData.append("message", `lat:${lat} long:${long}`);
      
          // Gửi FormData qua articlesClient.create
          const messageAPI = restClient.apiClient.service(`apis/messages`);
          const result = await messageAPI.create(formData);
      
          if (result.success) {
            Alert.alert("Thông báo","Gửi tín hiệu cầu cứu thành công, bạn đợi chút nhé.");
          } else {
            throw new Error(result.message);
            }
      } catch (error) {
        alert("Đã xảy ra lỗi!");
      }
    }
        
    return {
        location, setLocation,
        destinations,
        mapRef, heading,
        focusUserLocation, 
        navigation,
        coordinates,
        handleSos
    }
}

export default useRealDirections;