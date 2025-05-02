import CHeaderIcon from "@/src/shared/components/header/CHeaderIcon";
import { View, StyleSheet, Animated, TouchableOpacity, Text, TextInput, Dimensions, ActivityIndicator } from "react-native"
import RecentPage from "../../components/RecentPage";
import getColor from "@/src/styles/Color";
import CardExplore from "../../components/CardExplore";
import { FlatList } from "react-native-gesture-handler";
import useScrollTabbar from "@/src/shared/components/tabbar/useScrollTabbar";
import CTabbar from "@/src/shared/components/tabbar/CTabbar";
import useDiscovery from "./useDiscovery";
import { useEffect } from "react";
import Outstanding from "./Outstanding";
import { TabbarStackParamList } from "@/src/shared/routes/TabbarBottom";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";

const WINDOW_HEIGHT = Dimensions.get('window').height;

type TabbarNavigationProp = StackNavigationProp<TabbarStackParamList, 'Menu'>;
const Discovery = () => {
    const tabbarNavigation = useNavigation<TabbarNavigationProp>();
    const { tabbarPosition,handleScroll} = useScrollTabbar();
    const { 
        navigation, animationHeight, toggleExpand, 
        currTab, setCurrTab, expanded,
         filterProvinces,
        search, handleSearch,
        recentPage,
        getUserId
    } = useDiscovery();

    useEffect(() => {
        getUserId();
    }, []);

    return (
        <View style={{flex: 1}}>
            <View style={styles.container}>
                <CHeaderIcon label={"Khám phá"} 
                    IconLeft={"chevron-left"} onPressLeft={() => {tabbarNavigation.goBack()}}
                    borderIcon={true}
                />
                <RecentPage recent={recentPage}/>
                <View style={styles.mainContent}>
                    <Animated.View style={[styles.boxOptions, { height: animationHeight }]}>
                        <View style={styles.options}>
                            <View style={[styles.tabs, styles.shadow]}>
                                <TouchableOpacity style={currTab === "nb"?styles.currTab:styles.tab} onPress={() => {setCurrTab("nb")}}>
                                    <Text style={currTab === "nb"?styles.currText:styles.textTab}>Nổi bật</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={currTab !== "nb"?styles.currTab:styles.tab} onPress={() => {setCurrTab("dd")}}>
                                    <Text style={currTab !== "nb"?styles.currText:styles.textTab}>Địa điểm</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity style={styles.search} onPress={toggleExpand}>
                                <Text style={styles.textSearch}>{expanded?"Ẩn tìm kiếm":"Tìm kiếm"}</Text>
                            </TouchableOpacity>
                        </View>
                        {expanded && (
                        <View style={styles.boxExpand}>
                            <TextInput style={styles.textInput} 
                                placeholder="Tìm kiếm..."
                                placeholderTextColor={Color.textColor3}
                                value={search}
                                onChangeText={(value) => handleSearch(value)}
                            />
                        </View>
                        )}
                    </Animated.View>
                    {currTab === 'nb' ? (
                        <Outstanding handleScroll={handleScroll}/>
                    )
                    : filterProvinces ? (
                        <FlatList onScroll={handleScroll}
                        style={styles.boxContent} 
                        data={filterProvinces} 
                        renderItem={({item}) => (
                            <CardExplore 
                              images={item.avt} 
                              name={item.name} 
                              country={"Viet Nam"} 
                              size={{
                                width: "49%",
                                height: 250
                              }}
                              onPress={() => {navigation.navigate("CityProvice", {provinceId: item._id})}}
                            />
                        )}
                        numColumns={2}
                        columnWrapperStyle={styles.row}
                    />
                    ) : (
                        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator/></View>
                    )}
                </View>
            </View>
            <CTabbar tabbarPosition={tabbarPosition} startTab={"explore"}/>
        </View>
    )
}

const Color = getColor();
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.backGround
    },
    boxOptions: {
        width: '100%',
    },
    options: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        borderRadius: 10,
    },
    boxExpand: {
        height: 60,
        paddingVertical: 10, paddingHorizontal: 20,
        backgroundColor: Color.backGround,
        borderEndEndRadius: 10, borderEndStartRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: Color.backGround,
        borderRadius: 50,
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
    currTab: {
        width: 110,
        padding: 10,
        backgroundColor: Color.mainColor1,
        borderRadius: 50
    },
    tab: {
        width: 90,
        padding: 10,
        backgroundColor: Color.backGround,
        borderRadius: 50
    },
    currText: {
        alignSelf: 'center',
        color: Color.textColor2
    },
    textTab: {
        alignSelf: 'center',
        color: Color.textColor1
    },
    search: {
        padding: 10,
    },
    textSearch: {
        fontSize: 12,
        color: Color.textColor3
    },
    textInput: {
        width: '70%',
        borderWidth: 0.5,
        padding: 10,
        borderRadius: 20,
    },
    boxContent: {
        width: '100%',
        height: WINDOW_HEIGHT - 300,
        padding: 5,
        backgroundColor: Color.backGround,
    },
    mainContent: {
        backgroundColor: Color.backGround,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    row: {
        width: '100%',
        justifyContent: 'space-between',
        flexDirection: 'row',
        marginBottom: 5,
    },
    tabbar: {
        width: '100%',
    }
})

export default Discovery;