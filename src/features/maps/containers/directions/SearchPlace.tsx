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
        <View style={{backgroundColor: Color.background, flex: 1}}>
            <View  style={styles.searchBox}>
                <CIconButton icon={<Icon name={"chevron-left"} size={30} color={Color.textPrimary}/>}
                    onSubmit={onBack}
                    style={{
                    width: 50,
                    height: 50,
                    backColor: Color.backgroundSecondary,
                    radius: 50,
                    shadow: true
                }}/>
                <TextInput
                  style={[
                    styles.searchInput,
                    styles.shadow,
                    {
                      width: WIDTH_SCREEN - 80,
                      backgroundColor: Color.backgroundTertiary, // inputSearchFocus color
                      color: Color.textPrimary // Text color for input
                    },
                  ]}
                  placeholder="Tìm kiếm"
                  placeholderTextColor={Color.textTertiary}
                  value={search}
                  onChangeText={(text) => {
                    fetchPlaces(text);
                  }}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch("")} style={styles.deleteTextSearch}>
                    <Icon name="close" size={20} color={Color.textTertiary} />
                  </TouchableOpacity>
                )}
            </View>
            <TouchableOpacity style={[styles.mylocation, {borderColor: Color.border}]} key={`location-of-user`}
                    onPress={getLocationOfUser}
                >
                    <Text style={[styles.textmylocation, {color: Color.textPrimary}]}>Vị trí của bạn</Text>
                </TouchableOpacity>
            <FlatList style={styles.boxSearch} data={listSearch} renderItem={({item}) =>
                <TouchableOpacity style={[styles.cardSearch, {borderColor: Color.border}]} key={item.placePrediction.placeId}
                    onPress={() => getLatLngFromPlaceId(item.placePrediction.placeId)}
                >
                    <Text style={[styles.textSearch, {color: Color.textPrimary}]}>{item.placePrediction.text.text}</Text>
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
      },
      searchInput: {
          height: 50,
          paddingHorizontal: 10,
          fontSize: 16,
          borderRadius: 50,
      },
      shadow: {
          shadowColor: Color.shadow,
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.3,
          shadowRadius: 4.65,
          elevation: 8,
      },
      boxSearch: {
          marginHorizontal: 30,
      },
      cardSearch: {
          paddingVertical: 10,
          borderBottomWidth: 2,
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
        borderBottomWidth: 2,
      },
      textmylocation: {
        fontWeight: 'bold',
      }
})