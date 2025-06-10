import CIconButton from "@/src/shared/components/button/CIconButton";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { View, StyleSheet, TextInput, Dimensions, TouchableOpacity, Text } from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons";
import { useState } from "react";
import CButton from "@/src/shared/components/button/CButton"; // Assuming CButton is updated
import { StackNavigationProp } from "@react-navigation/stack";
import { MapStackParamList } from "@/src/shared/routes/MapNavigation";
import { useNavigation } from "@react-navigation/native";
import { LocationRoute } from "./interfaceAPIRoute";

const WIDTH_SCREEN = Dimensions.get('window').width;

interface TabMapProps {
    label: string;
    key: "DRIVE" | "WALK" | "MOTORCYCLE";
}
const tabsMap : TabMapProps[] = [
    {label: 'Ô tô', key: 'DRIVE'},
    {label: 'Xe máy', key: 'MOTORCYCLE'},
    {label: 'Đi bộ', key: 'WALK'},
]
type MapNavigationProp = StackNavigationProp<MapStackParamList, "CustomMap">;

interface HeaderDirectionProps {
    startLocation: LocationRoute | null;
    endLocation: LocationRoute | null;
    openSearch: (value: 'START'|'END') => void;
    changeTransport: (value: "DRIVE" | "WALK" | "MOTORCYCLE") => void;
    reverseRoute: (value: "DRIVE" | "WALK" | "MOTORCYCLE") => void;
}
const HeaderDirection = ({startLocation, endLocation, openSearch, changeTransport, reverseRoute} : HeaderDirectionProps) => {
    useTheme();
    const navigation = useNavigation<MapNavigationProp>();
    const [currTab, setCurrTab] = useState<"DRIVE" | "WALK" | "MOTORCYCLE">(tabsMap[0].key);

    const handlePressTab = (key: "DRIVE" | "WALK" | "MOTORCYCLE") => {
        setCurrTab(key);
        changeTransport(key);
    }

    return (
        <View style={styles.container}>
            <View  style={styles.searchBox}>
                <CIconButton icon={<Icon name={"chevron-left"} size={20} color={Color.textPrimary}/>}
                    onSubmit={() => {navigation.goBack()}}
                    style={{
                    width: 50,
                    height: 50,
                    backColor: Color.backgroundSecondary,
                    radius: 50,
                    shadow: true
                }}/>
                <TouchableOpacity style={[styles.buttonSearch, { backgroundColor: Color.backgroundSecondary, borderColor: Color.border }]} onPress={() => openSearch('START')}>
                    <Text style={[(!startLocation || !startLocation.displayName) && styles.textSearch, {color: startLocation?.displayName ? Color.textPrimary : Color.textTertiary}]}>
                        {(startLocation && startLocation.displayName) || "Điểm bắt đầu"}
                    </Text>
                </TouchableOpacity>
            </View>
            <View  style={styles.searchBox}>
                <CIconButton icon={<Icon name={"swap-vert"} size={20} color={Color.textPrimary}/>}
                    onSubmit={() => {reverseRoute(currTab)}}
                    style={{
                    width: 50,
                    height: 50,
                    backColor: Color.backgroundSecondary,
                    radius: 50,
                    shadow: true
                }}/>
                <TouchableOpacity style={[styles.buttonSearch, { backgroundColor: Color.backgroundSecondary, borderColor: Color.border }]} onPress={() => openSearch('END')}>
                    <Text style={[(!endLocation || !endLocation.displayName) && styles.textSearch, {color: endLocation?.displayName ? Color.textPrimary : Color.textTertiary}]}>
                        {(endLocation && endLocation.displayName) || "Điểm kết thúc"}
                    </Text>
                </TouchableOpacity>
            </View>
            <View style={styles.searchBox}>
                {tabsMap.map((item, index) =>
                    <CButton key={index}
                        label={" " + item.label}
                        onSubmit={() => {handlePressTab(item.key)}}
                        style={{
                            width: 110,
                            height: 35,
                            backColor: currTab === item.key ? Color.mainColor2 : Color.backgroundTertiary,
                            textColor: currTab === item.key ? Color.textOnMain2 : Color.textPrimary,
                            fontSize: 13,
                            radius: 50,
                            flex_direction: 'row'
                        }}
                    />
                )}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      width: '100%',
    },
    searchBox: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        alignItems: 'center',
        marginVertical: 5,
    },
    shadow: {
        shadowColor: Color.shadow,
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3,
    },
    buttonSearch: {
        width: WIDTH_SCREEN - 80,
        height: 50,
        paddingHorizontal: 10,
        fontSize: 16,
        borderRadius: 10,
        justifyContent: 'center',
        borderWidth: 1,
    },
    textSearch: {
    }
  });

export default HeaderDirection;