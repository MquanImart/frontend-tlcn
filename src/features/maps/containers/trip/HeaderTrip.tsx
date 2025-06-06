import CIconButton from "@/src/shared/components/button/CIconButton";
import getColor from "@/src/styles/Color";
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
const Color = getColor();

interface HeaderMapProps {
    startTab?: string;
    trips: Trip[];
    closeDetails?: () => void;
}

const HeaderTrip = ({startTab, trips, closeDetails}: HeaderMapProps) => {
    
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
        <View style={[styles.container, isSearch && styles.containerSearch]}>
            <View  style={styles.searchBox}>
                <CIconButton icon={<Icon name={"chevron-left"} size={30} color={Color.white_contrast}/>} 
                    onSubmit={pressBackIcon} 
                    style={{
                    width: 50,
                    height: 50,
                    backColor: Color.backGround,
                    radius: 50,
                    shadow: !isSearch
                }}/>
                <TextInput
                  style={[
                    styles.searchInput,
                    !isSearch && styles.shadow,
                    isSearch && styles.inputSearchFocus,
                    {
                        width: isSearch ? WIDTH_SCREEN - 40 : WIDTH_SCREEN - 80
                    },
                  ]}
                  placeholder="Tìm kiếm"
                  placeholderTextColor={Color.textColor3}
                  value={search}
                  onChangeText={(text) => {
                    searchTrip(text);
                  }}
                  onFocus={focusInput} 
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch("")} style={styles.deleteTextSearch}>
                    <Icon name="close" size={20} color="gray" />
                  </TouchableOpacity>
                )}
            </View>
                <View style={styles.line}/>
            {isSearch ? (
                <FlatList style={styles.boxSearch} data={listSearch} renderItem={({item}) => 
                    <CardTrip trip={item} deleteTrip={deleteTrip}/>
                }/>
            ) : (
                <View style={styles.searchBox}>
                    {tabsMap.map((item, index) => 
                        <CIconButton key={index} icon={<Icon name={item.icon} size={15} color={currTab === item.label ? Color.white_homologous : Color.white_contrast}/>} 
                            label={" " + item.label}
                            onSubmit={() => {handlePressTab(item.label)}} 
                            style={{
                                width: 110,
                                height: 35,
                                backColor: currTab === item.label ? Color.mainColor1 : undefined,
                                textColor: currTab === item.label ? Color.textColor2 : undefined,
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
    line: {
        borderTopWidth: 1,
        borderColor: Color.textColor3,
        width: '90%',
        alignSelf: 'center',
    }
  });
  

export default HeaderTrip;