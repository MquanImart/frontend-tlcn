import CIconButton from "@/src/shared/components/button/CIconButton";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { View, StyleSheet, TextInput, Dimensions, Text, TouchableOpacity } from "react-native"
import { FlatList } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import useHeaderTrip from "./useHeaderTrip";
import { Trip } from "@/src/interface/interface_detail";
import CardTrip from "../../components/CardTrip";
import useListTrip from "./useListTrip";

const WIDTH_SCREEN = Dimensions.get('window').width;
const HEIGHT_SCREEN = Dimensions.get('window').height;

interface HeaderMapProps {
    startTab?: string;
    trips: Trip[];
    closeDetails?: () => void;
}

const HeaderTrip = ({startTab, trips, closeDetails}: HeaderMapProps) => {
    useTheme();
    const {
        currTab, listSearch,
        search, tabsMap, isSearch,
        handlePressTab, pressBackIcon,
        setIsSearch, setSearch,
        setCurrTab, searchTrip
    } = useHeaderTrip(trips, startTab);

    const {
        deleteTrip
    } = useListTrip();

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
        <View style={[styles.container, isSearch && [styles.containerSearch, { backgroundColor: Color.background }]]}>
            <View  style={styles.searchBox}>
                <CIconButton icon={<Icon name={"chevron-left"} size={30} color={Color.textPrimary}/>}
                    onSubmit={pressBackIcon}
                    style={{
                    width: 50,
                    height: 50,
                    backColor: Color.backgroundSecondary, // Changed from backGround
                    radius: 50,
                    shadow: !isSearch
                }}/>
                <TextInput
                  style={[
                    styles.searchInput,
                    !isSearch && styles.shadow,
                    isSearch && [styles.inputSearchFocus, { backgroundColor: Color.backgroundTertiary }], // Changed from backGround2
                    {
                        width: isSearch ? WIDTH_SCREEN - 40 : WIDTH_SCREEN - 80,
                        backgroundColor: isSearch ? Color.backgroundTertiary : Color.backgroundSecondary, // Changed from backGround
                        color: Color.textPrimary // Ensure input text color is dynamic
                    },
                  ]}
                  placeholder="Tìm kiếm"
                  placeholderTextColor={Color.textTertiary} // Changed from textColor3
                  value={search}
                  onChangeText={(text) => {
                    searchTrip(text);
                  }}
                  onFocus={focusInput}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch("")} style={styles.deleteTextSearch}>
                    <Icon name="close" size={20} color={Color.textTertiary} /> {/* Changed from "gray" */}
                  </TouchableOpacity>
                )}
            </View>
                <View style={[styles.line, { borderColor: Color.border }]}/> {/* Changed from textColor3 */}
            {isSearch ? (
                <FlatList style={styles.boxSearch} data={listSearch} renderItem={({item}) =>
                    <CardTrip trip={item} deleteTrip={deleteTrip}/>
                }/>
            ) : (
                <View style={styles.searchBox}>
                    {tabsMap.map((item, index) =>
                        <CIconButton key={index} icon={<Icon name={item.icon} size={15} color={currTab === item.label ? Color.textOnMain2 : Color.textPrimary}/>} // Changed colors
                            label={" " + item.label}
                            onSubmit={() => {handlePressTab(item.label)}}
                            style={{
                                width: 110,
                                height: 35,
                                backColor: currTab === item.label ? Color.mainColor2 : undefined,
                                textColor: currTab === item.label ? Color.textOnMain2 : undefined, // Changed from textColor2
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
    inputSearchFocus: {
        // backgroundColor handled inline
    },
    searchInput: {
        height: 50,
        paddingHorizontal: 10,
        fontSize: 16,
        borderRadius: 50,
        // backgroundColor handled inline
    },
    shadow: {
        shadowColor: Color.shadow, // Changed from hardcoded #000
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    boxSearch: {

    },
    cardSearch: {
        paddingVertical: 10,
        borderBottomWidth: 2,
        borderColor: Color.border 
    },
    textSearch: {

    },
    deleteTextSearch: {
        position: "absolute", right: 20
    },
    line: {
        borderTopWidth: 1,
        width: '90%',
        alignSelf: 'center',
    }
  });

export default HeaderTrip;