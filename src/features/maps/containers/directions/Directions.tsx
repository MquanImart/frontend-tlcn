import { View, StyleSheet, TouchableWithoutFeedback, Keyboard, Text, ActivityIndicator } from "react-native"
import HeaderDirection from "./HeaderDirection";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import MapView, { Marker, Polyline } from "react-native-maps";
import CIconButton from "@/src/shared/components/button/CIconButton";
import Icon from "react-native-vector-icons/MaterialIcons";
import CButton from "@/src/shared/components/button/CButton";
import { MapStackParamList } from "@/src/shared/routes/MapNavigation";
import { RouteProp, useRoute } from "@react-navigation/native";
import useDirections from "./useDirections";
import SearchPlace from "./SearchPlace";
import { formatRouteInfo } from "../../utils/formatRouteInfo";
import { useEffect, useState } from "react";


const Directions = () => {
    useTheme();
    const route = useRoute<RouteProp<MapStackParamList, "Directions">>();
    const { start, end } = route.params || {};
    const [isMapReady, setIsMapReady] = useState(false);

    const {
        mapRef, startLocation, endLocation,
        coordinates, visiableSearch,
        openSearch, setVisiableSearch,
        selectedSearch, changeTransport,
        reverseRoute, routeDirections,
        navigationBegin
    } = useDirections(start, end);

    const getInitialRegion = () => {
        if (!startLocation || !endLocation) {
          // Giá trị mặc định nếu chưa có tọa độ
          return {
            latitude: 0,
            longitude: 0,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          };
        }

        // Tính trung điểm giữa startLocation và endLocation
        const latitude = (startLocation.latitude + endLocation.latitude) / 2;
        const longitude = (startLocation.longitude + endLocation.longitude) / 2;

        // Tính khoảng cách để đặt delta (zoom level)
        const latDelta = Math.abs(startLocation.latitude - endLocation.latitude) * 1.5;
        const lonDelta = Math.abs(startLocation.longitude - endLocation.longitude) * 1.5;

        return {
          latitude,
          longitude,
          latitudeDelta: latDelta || 0.05, // Đảm bảo không bị 0
          longitudeDelta: lonDelta || 0.05,
        };
    };

    useEffect(() => {
    if (isMapReady && mapRef.current && startLocation && endLocation) {
      const coordinatesToFit = [
        {
          latitude: startLocation.latitude,
          longitude: startLocation.longitude,
        },
        {
          latitude: endLocation.latitude,
          longitude: endLocation.longitude,
        },
      ];

      // Gọi fitToCoordinates khi bản đồ đã sẵn sàng
      mapRef.current.fitToCoordinates(coordinatesToFit, {
        edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
        animated: true,
      });
    }
  }, [isMapReady, startLocation, endLocation]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={[styles.container, { backgroundColor: Color.background }]}>
            <View style={styles.searchContainer}>
                <HeaderDirection startLocation={startLocation} endLocation={endLocation}
                    openSearch={openSearch} changeTransport={changeTransport}
                    reverseRoute={reverseRoute}
                />
            </View>
            {(coordinates && startLocation && endLocation)?(
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={getInitialRegion()}
              onMapReady={() => setIsMapReady(true)} // Xác nhận bản đồ đã sẵn sàng
            >
                <Marker
                    coordinate={{
                        latitude: startLocation.latitude,
                        longitude: startLocation.longitude,
                    }}
                    title="Vị trí bắt đầu"
                />
                <Marker
                    coordinate={{
                        latitude: endLocation.latitude,
                        longitude: endLocation.longitude,
                    }}
                    title="Vị trí kết thúc"
                />
                <Polyline coordinates={coordinates} strokeWidth={4} strokeColor={Color.mainColor2} />
            </MapView>
            ):(
              <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator color={Color.mainColor2}/></View>
            )}
            {routeDirections &&
            <View style={[styles.actions, { backgroundColor: Color.backgroundSecondary }]}>
                <Text style={[styles.title, { color: Color.textPrimary }]}>{formatRouteInfo(routeDirections)}</Text>
                <View style={styles.boxActions}>
                <CIconButton icon={<Icon name={"place"} size={20} color={Color.textOnMain2}/>}
                    label=" Bắt đầu"
                    onSubmit={() => {navigationBegin()}}
                    style={{
                    width: 100,
                    height: 40,
                    backColor: Color.mainColor2,
                    textColor: Color.textOnMain2,
                    radius: 50,
                    shadow: true
                }}/>
                <CButton
                    label={"Tạo chuyến đi"}
                    onSubmit={() => {}}
                    style={{
                        width: 110,
                        height: 35,
                        fontSize: 13,
                        radius: 50,
                        flex_direction: 'row',
                        shadow: true,
                        backColor: Color.backgroundTertiary, // Adjusted for consistency
                        textColor: Color.textPrimary, // Adjusted for consistency
                    }}
                />
                </View>
            </View>}
            {visiableSearch && <View style={[styles.boxSearch, { backgroundColor: Color.background }]}>
                <SearchPlace
                onBack={() => {setVisiableSearch(false)}}
                selectedLocation={selectedSearch}/>
            </View>}
        </View>
    </TouchableWithoutFeedback>
  )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    searchContainer: {
      position: "absolute",
      top: 40,
      zIndex: 1,
    },
    map: {
      flex: 1,
    },
    errorText: {
      color: "red", // Keep as is if not in theme, otherwise apply Color.error
      fontSize: 16,
    },
    details: {
      width: '100%', height: 400,
      position: 'absolute',
      bottom: -400,
      // backgroundColor applied inline
      padding: 10,
      borderStartEndRadius: 20, borderStartStartRadius: 20
    },
    actions: {
        width: '100%',
        position: 'absolute',
        bottom: 0,
        padding: 20,
        // backgroundColor applied inline
        borderStartStartRadius: 20, borderStartEndRadius: 20
    },
    boxActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '70%'
    },
    title: {
        fontSize: 15,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    boxSearch: {
        position: 'absolute',
        top: 0,
        zIndex: 10,
        width: '100%',
        height: '100%',
        paddingTop: 40
    }
  });

export default Directions;