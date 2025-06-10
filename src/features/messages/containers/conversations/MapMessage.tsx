import { Image } from 'expo-image';
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';

interface MapMessageProps {
    addressString: string;
}
const MapMessage= ({addressString} : MapMessageProps) => {
    useTheme();
    const [loading, setLoading] = useState<boolean>(false);
    const [mapRegion, setMapRegion] = useState<Region | null>(null);

    useEffect(() => {
        const location = parseLatLong(addressString);
        setMapRegion({
            latitude: location.lat,
            longitude: location.long,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
        })
    },[]);

    const parseLatLong = (addressString: string) : {lat: number, long: number} => {
        try {
          const match = addressString.match(/lat:([-]?[\d.]+)\s+long:([-]?[\d.]+)/);
          if (!match) throw new Error("Invalid address format");

          const lat = parseFloat(match[1]);
          const long = parseFloat(match[2]);

          console.log(lat, long);
          return { lat, long };
        } catch (error) {
          return {lat: 0, long: 0}
        }
    };

    return (
        <View style={[styles.mapContainer, { backgroundColor: Color.backgroundTertiary }]}>
          {Platform.OS === "web" ? (
            <Image
              source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/e/ec/Maps_icon_%282020%29.svg" }}
              style={styles.mapImage}
            />
          ) : loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Color.mainColor2} />
              <Text style={[styles.loadingText, { color: Color.textPrimary }]}>Đang tải bản đồ...</Text>
            </View>
          ) : mapRegion ? (
            <MapView
              style={styles.map}
              region={mapRegion}
              scrollEnabled={false}
              zoomEnabled={true}
            >
              <Marker coordinate={{ latitude: mapRegion.latitude, longitude:mapRegion.longitude }} />
            </MapView>
          ) : (
            <Text style={[styles.errorText, { color: Color.error }]}>Không thể hiển thị bản đồ: {"Không có tọa độ"}</Text>
          )}
        </View>
    )
}

const styles = StyleSheet.create({
  mapContainer: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    overflow: "hidden",
    marginTop: 10,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  mapImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  messageButton: {
    marginBottom: 10,
    backgroundColor: Color.mainColor2,
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  messageText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
  },
  errorText: {
    textAlign: "center",
    padding: 10,
  },
});

export default MapMessage;