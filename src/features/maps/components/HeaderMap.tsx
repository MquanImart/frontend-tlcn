import CIconButton from "@/src/shared/components/button/CIconButton";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { View, StyleSheet, TextInput, Dimensions, Text, TouchableOpacity } from "react-native"
import { FlatList } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/MaterialIcons";
import useHeaderMap from "./useHeaderMap";
import { PlaceData } from "../containers/interfaceAPI";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

const WIDTH_SCREEN = Dimensions.get('window').width;
const HEIGHT_SCREEN = Dimensions.get('window').height;

interface HeaderMapProps {
    startTab?: string;
    rightPress?: () => void;
    getDetails: (details: PlaceData) => void;
    closeDetails?: () => void;
}

const HeaderMap = ({startTab, rightPress, getDetails, closeDetails}: HeaderMapProps) => {
    useTheme();
    const {
        currTab, listSearch,
        search, tabsMap, isSearch,
        fetchPlaces, handlePressTab,
        pressBackIcon, setIsSearch,
        getLatLngFromPlaceId, setSearch,
        setCurrTab
    } = useHeaderMap(getDetails, startTab);

    const focusInput = () => {
        setIsSearch(true);
        if (closeDetails){
            closeDetails();
        }
    }

    useFocusEffect(
        useCallback(() => {
            if (startTab){
                const load = async () => {
                    setCurrTab(startTab);
                }
                load();
            }
        }, [])
    );

    return (
        <View style={[
            styles.container,
            isSearch && styles.containerSearch,
            isSearch && { backgroundColor: Color.background }
        ]}>
            <View  style={styles.searchBox}>
                <CIconButton icon={<Icon name={"chevron-left"} size={30} color={Color.textPrimary}/>}
                    onSubmit={pressBackIcon}
                    style={{
                    width: 50,
                    height: 50,
                    backColor: Color.backgroundSecondary,
                    radius: 50,
                    shadow: !isSearch
                }}/>
                <TextInput
                  style={[
                    styles.searchInput,
                    !isSearch && styles.shadow,
                    isSearch && styles.inputSearchFocus,
                    {
                      width: rightPress
                        ? isSearch
                          ? WIDTH_SCREEN - 80
                          : WIDTH_SCREEN - 130
                        : isSearch
                        ? WIDTH_SCREEN - 40
                        : WIDTH_SCREEN - 80,
                      backgroundColor: isSearch ? Color.backgroundTertiary : Color.backgroundSecondary,
                      color: Color.textPrimary
                    },
                  ]}
                  placeholder="Tìm kiếm"
                  placeholderTextColor={Color.textTertiary}
                  value={search}
                  onChangeText={(text) => {
                    fetchPlaces(text);
                  }}
                  onFocus={focusInput}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch("")} style={styles.deleteTextSearch}>
                    <Icon name="close" size={20} color={Color.textSecondary} />
                  </TouchableOpacity>
                )}
                {rightPress && !isSearch &&
                <CIconButton icon={<Icon name={"turned-in-not"} size={20} color={Color.textPrimary}/>}
                    onSubmit={() => {rightPress()}}
                    style={{
                    width: 50,
                    height: 50,
                    backColor: Color.backgroundSecondary,
                    radius: 50,
                    shadow: true
                }}/>
                }
            </View>
            {isSearch ? (
                <FlatList
                    style={[styles.boxSearch, {
                        borderTopColor: Color.border,
                    }]}
                    data={listSearch}
                    renderItem={({item}) =>
                        <TouchableOpacity
                            style={[styles.cardSearch, {
                                borderBottomColor: Color.border
                            }]}
                            key={item.placePrediction.placeId}
                            onPress={() => getLatLngFromPlaceId(item.placePrediction.placeId)}
                        >
                            <Text style={[styles.textSearch, { color: Color.textPrimary }]}>{item.placePrediction.text.text}</Text>
                        </TouchableOpacity>
                    }
                />
            ) : (
                <View style={styles.searchBox}>
                    {tabsMap.map((item, index) =>
                        <CIconButton key={index} icon={<Icon name={item.icon} size={15} color={currTab === item.label ? Color.textOnMain2 : Color.textPrimary}/>}
                            label={" " + item.label}
                            onSubmit={() => {handlePressTab(item.label)}}
                            style={{
                                width: 110,
                                height: 35,
                                backColor: currTab === item.label ? Color.mainColor2 : Color.backgroundSecondary, // Changed to backgroundSecondary
                                textColor: currTab === item.label ? Color.textOnMain2 : Color.textPrimary,
                                fontSize: 13,
                                radius: 50,
                                flex_direction: 'row',
                                shadow: true
                            }}
                        />
                    )}
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
      width: '100%',
      paddingTop: 40
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
    inputSearchFocus: {},
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
        borderTopWidth: 2,
    },
    cardSearch: {
        paddingVertical: 10,
        borderBottomWidth: 2,
    },
    textSearch: {},
    deleteTextSearch: {
        position: "absolute", right: 20
    }
  });


export default HeaderMap;