import CIconButton from "@/src/shared/components/button/CIconButton";
import { callGetGoogleApi, callPostGoogleApi } from "@/src/shared/services/API_Google";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { useState } from "react";
import { TextInput, TouchableOpacity, View, StyleSheet, FlatList, Dimensions, Text, Alert, Linking } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons";
import { PlaceData, PlaceSuggestion } from "../interfaceAPI";
import { LocationRoute } from "./interfaceAPIRoute";
import * as Location from "expo-location";

const WIDTH_SCREEN = Dimensions.get('window').width;
const HEIGHT_SCREEN = Dimensions.get('window').height;

interface SearchPlaceProps {
    onBack: () => void;
    selectedLocation: (value: LocationRoute) => void;
}

const SearchPlace = ({onBack, selectedLocation} : SearchPlaceProps) => {
    useTheme();
    const [search, setSearch] = useState<string>("");
    const [listSearch, setListSearch] = useState<PlaceSuggestion[]>([]);

    const fetchPlaces = async (input: string) => {
        setSearch(input);
        const url = "https://places.googleapis.com/v1/places:autocomplete";
        
        const body = {
          input,
          languageCode: "vi",
          locationBias: {
            rectangle: {
              low: { latitude: 8.1790665, longitude: 102.14441 },
              high: { latitude: 23.393395, longitude: 109.469077 },
            },
          },
        };
        
        const result = await callPostGoogleApi<{ suggestions: PlaceSuggestion[] }>(
            url, body
        );
        
        if (result) {
          setListSearch(result.suggestions);
        } else {
          setListSearch([]);
        }
    };
    const getLatLngFromPlaceId = async (placeId: string) => {
        const baseUrl = `https://places.googleapis.com/v1/places/${placeId}`;
        const result = await callGetGoogleApi<PlaceData>(baseUrl, 
            {},
            { "X-Goog-FieldMask": "*" });
        if (result) {
            selectedLocation({
                longitude: result.location.longitude,
                latitude: result.location.latitude,
                displayName: result.displayName.text,
                address: result.formattedAddress
            })
        }
    };
    
    const getLocationOfUser = async () => {
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
        selectedLocation({
            longitude: loc.coords.longitude,
            latitude: loc.coords.latitude,
            displayName: "Vị trí của bạn",
            address: `${loc.coords.latitude} , ${loc.coords.longitude}`
        })
    };

    return (
        <View>
            <View  style={styles.searchBox}>
                <CIconButton icon={<Icon name={"chevron-left"} size={30} color={Color.white_contrast}/>} 
                    onSubmit={onBack} 
                    style={{
                    width: 50,
                    height: 50,
                    backColor: Color.backGround,
                    radius: 50,
                    shadow: true
                }}/>
                <TextInput
                  style={[
                    styles.searchInput,
                    styles.shadow,
                    styles.inputSearchFocus,
                    {
                      width: WIDTH_SCREEN - 80
                    },
                  ]}
                  placeholder="Tìm kiếm"
                  placeholderTextColor={Color.textColor3}
                  value={search}
                  onChangeText={(text) => {
                    fetchPlaces(text);
                  }}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch("")} style={styles.deleteTextSearch}>
                    <Icon name="close" size={20} color="gray" />
                  </TouchableOpacity>
                )}
            </View>
            <TouchableOpacity style={styles.mylocation} key={`location-of-user`}
                    onPress={getLocationOfUser}
                >
                    <Text style={styles.textmylocation}>Vị trí của bạn</Text>
                </TouchableOpacity>
            <FlatList style={styles.boxSearch} data={listSearch} renderItem={({item}) => 
                <TouchableOpacity style={styles.cardSearch} key={item.placePrediction.placeId}
                    onPress={() => getLatLngFromPlaceId(item.placePrediction.placeId)}
                >
                    <Text style={styles.textSearch}>{item.placePrediction.text.text}</Text>
                </TouchableOpacity>
            }/>
        </View>
    )
}

export default SearchPlace;

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width: '100%',
      },
      containerSearch: {
          height: HEIGHT_SCREEN,
          backgroundColor: Color.backGround
        },
      searchBox: {
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingHorizontal: 10,
          alignItems: 'center',
          marginVertical: 5,
      },
      inputSearchFocus: {
          backgroundColor: Color.backGround2
      },
      searchInput: {
          height: 50,
          paddingHorizontal: 10,
          fontSize: 16,
          borderRadius: 50,
          backgroundColor: Color.backGround,
      },
      shadow: {
          shadowColor: "#000", // Màu bóng
          shadowOffset: {
            width: 0, // Đổ bóng theo chiều ngang
            height: 4, // Đổ bóng theo chiều dọc
          },
          shadowOpacity: 0.3, // Độ mờ của bóng (0 - 1)
          shadowRadius: 4.65, // Độ mờ viền của bóng
          elevation: 8, // Dùng cho Android (giá trị càng cao bóng càng đậm)
      },
      boxSearch: {
          marginHorizontal: 30,
      },
      cardSearch: { 
          paddingVertical: 10,
          borderBottomWidth: 2, borderColor: Color.backGround2
      },
      textSearch: {
  
      },
      deleteTextSearch: { 
          position: "absolute", right: 20 
      },
      mylocation: {
        marginTop: 10,
        paddingVertical: 10,
        marginHorizontal: 30,
        borderBottomWidth: 2, borderColor: Color.backGround2
      },
      textmylocation: {
        fontWeight: 'bold'
      }
})