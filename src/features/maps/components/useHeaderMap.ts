import { MapStackParamList } from "@/src/shared/routes/MapNavigation";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useState } from "react";
import { PlaceData, PlaceSuggestion } from "../containers/interfaceAPI";
import { callPostGoogleApi, callGetGoogleApi } from "@/src/shared/services/API_Google";
import { Keyboard } from "react-native";


type MapNavigationProp = StackNavigationProp<MapStackParamList, "CustomMap">;
const useHeaderMap = (getDetails: (details: PlaceData) => void, startTab?: string) => {
    const tabsMap = [
        {label: 'Bản đồ', icon: 'map'},
        {label: 'Đường đi', icon: 'place'},
        {label: 'Chuyến đi', icon: 'timeline'},
    ]
    const navigation = useNavigation<MapNavigationProp>();
    const [currTab, setCurrTab] = useState<string>(startTab?startTab:tabsMap[0].label);
    const [listSearch, setListSearch] = useState<PlaceSuggestion[]>([]);
    const [search, setSearch] = useState<string>("");
    const [isSearch, setIsSearch] = useState<boolean>(false);

    const handlePressTab = (key: string) => {
        setCurrTab(key);
        if (key === tabsMap[0].label){
            navigation.navigate("CustomMap");
        }
        else if (key === tabsMap[1].label){
            navigation.navigate("Directions", {});
        } else if (key === tabsMap[2].label){
            navigation.navigate("ListTrip");
        } 
    }

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
        setIsSearch(false);
        if (result) {
         getDetails(result);
        }
    };

      
    const pressBackIcon = () => {
        if (isSearch){
            setIsSearch(false);
            Keyboard.dismiss();
        } else {
            navigation.goBack()
        }
    }
    return {
        navigation, currTab, listSearch, 
        search, tabsMap, isSearch,
        fetchPlaces, handlePressTab,
        pressBackIcon, setIsSearch,
        getLatLngFromPlaceId, setSearch,
        setCurrTab
    }
}

export default useHeaderMap;