import { MapStackParamList } from "@/src/shared/routes/MapNavigation";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useState } from "react";
import { callPostGoogleApi, callGetGoogleApi } from "@/src/shared/services/API_Google";
import { Keyboard } from "react-native";
import { Trip } from "@/src/interface/interface_detail";
import { removeVietnameseTones } from "@/src/shared/utils/removeVietnameseTones";


type MapNavigationProp = StackNavigationProp<MapStackParamList, "CustomMap">;
const useHeaderTrip = (listTrip: Trip[], startTab?: string) => {
    const tabsMap = [
        {label: 'Bản đồ', icon: 'map'},
        {label: 'Đường đi', icon: 'place'},
        {label: 'Chuyến đi', icon: 'timeline'},
    ]
    const navigation = useNavigation<MapNavigationProp>();
    const [currTab, setCurrTab] = useState<string>(startTab?startTab:tabsMap[0].label);
    const [listSearch, setListSearch] = useState<Trip[]>(listTrip);
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

    const pressBackIcon = () => {
        if (isSearch){
            setIsSearch(false);
            Keyboard.dismiss();
        } else {
            navigation.goBack()
        }
    }

    const searchTrip = (value: string) => {
        setSearch(value);
        const lowerCaseValue = removeVietnameseTones(value)
      
        const filteredTrips = listTrip.filter((trip) => {
            const nameCase = removeVietnameseTones(trip.name);
            const startCase = removeVietnameseTones(trip.startAddress.displayName);
            const endCase = removeVietnameseTones(trip.endAddress.displayName);

            const nameMatch = nameCase.includes(lowerCaseValue);
            const startMatch = startCase.includes(lowerCaseValue);
            const endMatch = endCase.includes(lowerCaseValue);
            
            // Kiểm tra nếu có ít nhất 1 địa chỉ trong listAddress chứa value
            const listMatch = trip.listAddress.some(address => {
                const listCase = removeVietnameseTones(address.displayName);
                return listCase.includes(lowerCaseValue);
            }
            );
          
            return nameMatch || startMatch || endMatch || listMatch;
        });
      
        setListSearch(filteredTrips);
      };
      

    return {
        navigation, currTab, listSearch, 
        search, tabsMap, isSearch,
        handlePressTab, setSearch,
        pressBackIcon, setIsSearch,
        setCurrTab,
        searchTrip
    }
}

export default useHeaderTrip;