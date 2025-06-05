import { Address } from "@/src/interface/interface_reference";
import getColor from "@/src/styles/Color";
import React from "react";
import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import MapView, { Marker } from "react-native-maps";
import Icon from "react-native-vector-icons/MaterialIcons";
import useMapPicker from "./useMapPicker";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const Color = getColor();

interface MapPickerDialogProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (coords: { latitude: number; longitude: number }, address: Address) => void;
}

const MapPickerDialog: React.FC<MapPickerDialogProps> = ({ isVisible, onClose, onConfirm }) => {
  const {
    location,
    mapRef,
    selectedMarker,
    details,
    listSearch,
    search,
    isSearch,
    setSearch,
    setIsSearch,
    handleMapPress,
    fetchPlaces,
    getLatLngFromPlaceId,
    confirmLocation,
  } = useMapPicker(onConfirm, onClose);

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, isSearch && styles.searchContainerFull]}>
        <View style={styles.searchBox}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (isSearch) {
                setIsSearch(false);
              } else {
                onClose();
              }
            }}
          >
            <Icon name="chevron-left" size={30} color={Color.white_contrast} />
          </TouchableOpacity>
          <TextInput
            style={[styles.searchInput, isSearch && styles.inputSearchFocus]}
            placeholder="Tìm kiếm địa điểm"
            placeholderTextColor={Color.textColor3}
            value={search}
            onChangeText={(text) => fetchPlaces(text)}
            onFocus={() => setIsSearch(true)}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")} style={styles.deleteTextSearch}>
              <Icon name="close" size={20} color="gray" />
            </TouchableOpacity>
          )}
        </View>
        {isSearch && listSearch.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <FlatList
              style={styles.boxSearch}
              data={listSearch}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cardSearch}
                  key={item.placePrediction.placeId}
                  onPress={() => getLatLngFromPlaceId(item.placePrediction.placeId)}
                >
                  <View style={styles.cardSearchContent}>
                    <Icon name="place" size={20} color={Color.textColor3} style={styles.cardSearchIcon} />
                    <Text style={styles.textSearch}>{item.placePrediction.text.text}</Text>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.placePrediction.placeId}
              initialNumToRender={10}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
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
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Vị trí của tôi"
            pinColor="blue"
          />
        )}
        {selectedMarker && (
          <Marker
            coordinate={{
              latitude: selectedMarker.latitude,
              longitude: selectedMarker.longitude,
            }}
            title="Địa điểm đã chọn"
          />
        )}
      </MapView>

      {selectedMarker && (
        <TouchableOpacity
          style={[styles.confirmButton, { backgroundColor: Color.mainColor1 }]}
          onPress={confirmLocation}
        >
          <Text style={[styles.buttonText, { color: Color.textColor2 }]}>Xác nhận vị trí này</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Color.backGround,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    left: 20,
    backgroundColor: Color.borderColor1,
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  closeButtonText: {
    fontSize: 20,
    color: Color.textColor1,
    fontWeight: "600",
  },
  searchContainer: {
    position: "absolute",
    top: 40,
    left: 10,
    right: 10,
    zIndex: 10,
    borderRadius: 12,
    padding: 6,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  searchContainerFull: {
    backgroundColor: Color.backGround,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  backButton: {
    width: 50,
    height: 50,
    backgroundColor: Color.backGround,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
    borderRadius: 25,
    backgroundColor: Color.backGround,
  },
  inputSearchFocus: {
    backgroundColor: Color.backGround2,
  },
  deleteTextSearch: {
    position: "absolute",
    right: 20,
    top: 15,
  },
  suggestionsContainer: {
    maxHeight: SCREEN_HEIGHT * 0.4, // Giới hạn chiều cao tối đa là 40% màn hình
    backgroundColor: Color.backGround,
    borderRadius: 12,
    marginTop: 5,
    paddingVertical: 5,
  },
  boxSearch: {
    marginHorizontal: 10,
  },
  cardSearch: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Color.backGround2,
  },
  cardSearchContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardSearchIcon: {
    marginRight: 8,
  },
  textSearch: {
    fontSize: 16,
    color: Color.textColor1,
  },
  map: {
    flex: 1,
  },
  confirmButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default MapPickerDialog;