import { MapStackParamList } from "@/src/shared/routes/MapNavigation";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useEffect, useRef, useState } from "react";
import MapView from "react-native-maps";
import { callPostGoogleApi } from "@/src/shared/services/API_Google";
import { RoutesResponse } from "../interfaceRoute";
import { LocationRoute } from "./interfaceAPIRoute";
import decodePolyline from "../../utils/DecodePolyline";
import { Alert } from "react-native";
import axios from "axios";
import env from "@/env";
type MapNavigationProp = StackNavigationProp<MapStackParamList, "CustomMap">;

const useDirections = (start?: LocationRoute, end?: LocationRoute) => {
    const navigation = useNavigation<MapNavigationProp>();
    const [startLocation, setStartlocation] = useState<LocationRoute | null>(start?start:null);
    const [endLocation, setEndlocation] = useState<LocationRoute | null>(end?end:null);
    const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number; }[] | null>([]);

    const [routeDirections, setRouteDitections] = useState<RoutesResponse | null>(null);
    const mapRef = useRef<MapView | null>(null);

    const [visiableSearch, setVisiableSearch] = useState<boolean>(false);
    const [typeSearch, setTypeSearch] = useState<'START' | 'END' | null>(null);

    useEffect(() => {
        if (startLocation && endLocation && mapRef.current) {
            getRoute("DRIVE");
            
            mapRef.current.fitToCoordinates(
                [
                    { latitude: startLocation.latitude, longitude: startLocation.longitude },
                    { latitude: endLocation.latitude, longitude: endLocation.longitude }
                ],
                {
                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                    animated: true, 
                }
            );
        }
    }, [startLocation, endLocation]);
    
    const getRoute = async (travelMode: "DRIVE" | "WALK" | "MOTORCYCLE") => {
      const url = 'https://routes.googleapis.com/directions/v2:computeRoutes';
      const header = { 'X-Goog-FieldMask': '*' };

      const commonBody : any = {
          origin: { 
            location: { 
              latLng: {
                latitude: startLocation?.latitude,
                longitude: startLocation?.longitude
              } 
            } 
          },
          destination: { 
            location: { 
              latLng: {
                latitude: endLocation?.latitude,
                longitude: endLocation?.longitude
              } 
            } 
          },
          travelMode: travelMode === "MOTORCYCLE" ? "DRIVE" : travelMode, // Google chưa hỗ trợ MOTORCYCLE
          polylineQuality: 'HIGH_QUALITY',
          polylineEncoding: 'ENCODED_POLYLINE',
          routingPreference: 
              travelMode === "DRIVE" ? "TRAFFIC_AWARE" :
              travelMode === "MOTORCYCLE" ? "TRAFFIC_AWARE_OPTIMAL" : "TRAFFIC_UNAWARE",
      };

      if (travelMode === "MOTORCYCLE") {
        commonBody.routeModifiers = {
          avoidHighways: true,
          //avoidTolls: true,
          //avoidFerries: true
        };
      }
  
      try {
          const result = await callPostGoogleApi<RoutesResponse>(url, commonBody, header);
          if (result && result.routes && result.routes.length) {
              setRouteDitections(result);
              const encodedPolyline = result.routes[0].polyline.encodedPolyline;
              const decodedPoints = decodePolyline(encodedPolyline);
              setCoordinates(decodedPoints);
          } else {
              console.log('No routes found in response');
          }
      } catch (error) {
          console.error(error);
      }
    };

    const getRoutev1 = async (travelMode: "driving" | "walking" | "moto") => {
      if (!startLocation || !endLocation) {
        Alert.alert('Thông báo','Bạn phải chọn điểm đi và điểm đến!');
        return;
      }
      let mode = travelMode === "moto"? "driving": travelMode;
      let avoid =travelMode === "moto"? "highways": "";

      const origin = `${startLocation.latitude},${startLocation.longitude}`;
      const destination = `${endLocation.latitude},${endLocation.longitude}`;

      const apiKey = env.GOOGLE_MAPS_API_KEY;
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=${mode}&key=${apiKey}${
        avoid ? `&avoid=${avoid}` : ""
      }`;
      
      try {
        const response = await axios.get(url);
        const data = response.data;
          
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const encodedPolyline = route.overview_polyline.points;
          const decodedPoints = decodePolyline(encodedPolyline);
          setCoordinates(decodedPoints);

          return {
            polyline: encodedPolyline,
            legs: route.legs,
            summary: route.summary,
          };
        } else {
          Alert.alert('Thông báo', 'Không tìm thấy tuyến đường!')
          return null;
        }
      } catch (error) {
        Alert.alert('Thông báo', 'Không thể gọi API!')
        console.log(error);
        return null;
      }
    };

    const selectedSearch = (value: LocationRoute) => {
      if (typeSearch === 'START'){
        setStartlocation(value);
        getRoute("DRIVE");
        setVisiableSearch(false);
      } else if (typeSearch === 'END'){
        setEndlocation(value);
        getRoute("DRIVE");
        setVisiableSearch(false);
      }
    }

    const openSearch = (value: 'START'|'END') => {
      setTypeSearch(value);
      setVisiableSearch(true);
    }

    const changeTransport = (value: "DRIVE" | "WALK" | "MOTORCYCLE") => {
      getRoute(value);
    }

    const reverseRoute = (tab: "DRIVE" | "WALK" | "MOTORCYCLE") => {
      const startNew = endLocation;
      setEndlocation(startLocation);
      setStartlocation(startNew);

      getRoute(tab);
    }

    const navigationBegin = () => {
      if (startLocation && endLocation){
        navigation.navigate("Realtime", {locations: [endLocation]})
      }
    }
    return {
        setStartlocation, setEndlocation,
        mapRef, startLocation, endLocation,
        decodePolyline, coordinates, visiableSearch,
        selectedSearch, setVisiableSearch, openSearch,
        changeTransport, reverseRoute, routeDirections,
        navigationBegin, getRoutev1
    }
}

export default useDirections;