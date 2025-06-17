import CHeaderIcon from "@/src/shared/components/header/CHeaderIcon";
import { View, StyleSheet, Animated, TouchableOpacity, Text, TextInput, Dimensions, ActivityIndicator } from "react-native"
import RecentPage from "../../components/RecentPage";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color, colors } from '@/src/styles/DynamicColors';
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
    useTheme();
    const tabbarNavigation = useNavigation<TabbarNavigationProp>();
    const { tabbarPosition,handleScroll} = useScrollTabbar();
    const {
        navigation, animationHeight, toggleExpand,
        currTab, setCurrTab, expanded,
         filterProvinces,
        search, handleSearch,
        recentPage,
        getUserId,
        isLoading,
        reloadSuggested
    } = useDiscovery();

    useEffect(() => {
        getUserId();
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <View style={{
              flex: 1,
              backgroundColor: Color.background // Màu nền động
            }}>
                <CHeaderIcon label={"Khám phá"}
                    IconLeft={"chevron-left"} onPressLeft={() => {tabbarNavigation.goBack()}}
                    borderIcon={true}
                />
                <RecentPage recent={recentPage}/>
                <View style={{
                  backgroundColor: Color.background, // Màu nền động
                  shadowColor: Color.shadow, // Màu bóng đổ động
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.2,
                  shadowRadius: 5,
                  elevation: 5,
                }}>
                    <Animated.View style={[styles.boxOptions, { height: animationHeight }]}>
                        <View style={styles.options}>
                            <View style={[styles.tabs, {
                              shadowColor: Color.shadow, // Màu bóng đổ động
                              shadowOffset: {
                                width: 0,
                                height: 4,
                              },
                              shadowOpacity: 0.3,
                              shadowRadius: 4.65,
                              elevation: 8,
                            }]}>
                                <TouchableOpacity style={currTab === "nb" ? {
                                  width: 110,
                                  padding: 10,
                                  backgroundColor: Color.mainColor2, // Màu nền cho tab đang chọn
                                  borderRadius: 50
                                } : {
                                  width: 90,
                                  padding: 10,
                                  backgroundColor: 'transparent',
                                  borderRadius: 50
                                }} onPress={() => {setCurrTab("nb")}}>
                                    <Text style={currTab === "nb" ? {
                                      alignSelf: 'center',
                                      color: Color.white // Màu chữ t
                                    } : {
                                      alignSelf: 'center',
                                     color: colors.black 
                                    }}>Nổi bật</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={currTab !== "nb" ? {
                                  width: 110,
                                  padding: 10,
                                  backgroundColor: Color.mainColor2,
                                  borderRadius: 50
                                } : {
                                  width: 90,
                                  padding: 10,
                                  backgroundColor: 'transparent', 
                                  borderRadius: 50
                                }} onPress={() => {setCurrTab("dd")}}>
                                    <Text style={currTab !== "nb" ? {
                                      alignSelf: 'center',
                                      color: Color.white // Màu chữ trên tab đang chọn
                                    } : {
                                      alignSelf: 'center',
                                      color: colors.black 
                                    }}>Địa điểm</Text>
                                </TouchableOpacity>
                            </View>
                            {currTab === 'nb'? (
                              <TouchableOpacity style={styles.search} onPress={reloadSuggested}>
                                <Text style={{
                                  fontSize: 12,
                                  color: Color.textSecondary
                                }}>Tải lại gợi ý</Text>
                            </TouchableOpacity>
                            ):(
                              <TouchableOpacity style={styles.search} onPress={toggleExpand}>
                                <Text style={{
                                  fontSize: 12,
                                  color: Color.textSecondary // Màu chữ "Tìm kiếm"
                                }}>{expanded?"Ẩn tìm kiếm":"Tìm kiếm"}</Text>
                            </TouchableOpacity>
                            )}
                        </View>
                        {isLoading && <Text style={styles.reloadText}>Đang tải lại danh sách gợi ý</Text>}
                        {expanded && (
                        <View style={{
                          height: 60,
                          paddingVertical: 10, paddingHorizontal: 20,
                          backgroundColor: Color.background, // Nền cho phần mở rộng tìm kiếm
                          borderEndEndRadius: 10, borderEndStartRadius: 10,
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                            <TextInput style={{
                                width: '70%',
                                borderWidth: 0.5,
                                padding: 10,
                                borderRadius: 20,
                                borderColor: Color.border, 
                                color: Color.textPrimary, // Màu chữ khi gõ
                                backgroundColor: Color.backgroundTertiary, // Màu nền input
                            }}
                                placeholder="Tìm kiếm..."
                                placeholderTextColor={Color.textTertiary}
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
                        style={{
                          width: '100%',
                          height: WINDOW_HEIGHT - 300,
                          padding: 5,
                          backgroundColor: Color.background, 
                        }}
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
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color={Color.mainColor2}/></View>
                    )}
                </View>
            </View>
            <CTabbar tabbarPosition={tabbarPosition} startTab={"explore"}/>
        </View>
    )
}

const styles = StyleSheet.create({
    boxOptions: {
        width: '100%',
    },
    options: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        borderRadius: 10,
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: Color.backgroundSecondary, 
        borderRadius: 50,
    },
    search: {
        padding: 10,
    },
    row: {
        width: '100%',
        justifyContent: 'space-between',
        flexDirection: 'row',
        marginBottom: 5,
    },
    reloadText: {
      alignSelf: 'center',
      fontSize: 10
    }
});

export default Discovery;