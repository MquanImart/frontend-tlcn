import { View, StyleSheet, Image, Dimensions, ScrollView, Text, Animated, ActivityIndicator } from "react-native"
import HeaderProvice from "../../components/HeaderProvice";
import getColor from "@/src/styles/Color";
import { LinearGradient } from "expo-linear-gradient";
import TabbarTop from "@/src/shared/components/tabbar-top/TabbarTop";
import CardPage from "../../components/CardPage";
import { RouteProp, useRoute } from "@react-navigation/native";
import { ExploreStackParamList } from "@/src/shared/routes/ExploreNavigation";
import useCityProvince from "./useCityProvide";
import { useEffect } from "react";

const WINDOW_HEIGHT = Dimensions.get('window').height;
const HEIGHT_HEADER = WINDOW_HEIGHT - 300;

const CityProvice = () => {
    const route = useRoute<RouteProp<ExploreStackParamList, "CityProvice">>();
    const { provinceId } = route.params || {};
    
    const { 
        translateViewAnimation, scrollY,
        currTab, setCurrTab, tabs,
        handleNavigateToPage,
        getHotPage, getProvince, getAllPage,
        province, hotPages, pages
    } = useCityProvince(provinceId);
    
    useEffect(() => {
        getHotPage();
        getProvince();
        getAllPage();
    }, []);

    return (
    <View style={styles.container}>
        <HeaderProvice/>
        {province ? (
        <View>
        <Animated.View style={[styles.header, translateViewAnimation]}>
            <Image style={styles.images} source={{ uri: province.avt }} />
            <LinearGradient 
                  colors={['rgba(75, 22, 76, 0)', 'rgba(75, 22, 76, 1)']}
                  start={{ x: 0.5, y: 0 }}
                  end={{ x: 0.5, y: 1 }}
                  style={[StyleSheet.absoluteFillObject, styles.flexEnd, styles.images]}
                >
                    <View style={styles.boxTitle}>
                        <Text style={styles.textName}>{province.name}</Text>
                        <Text style={styles.textCountry}>Viet Nam</Text>
                    </View>
                    <View style={styles.tabs}>
                        <TabbarTop tabs={tabs} startTab={currTab} setTab={setCurrTab}/>
                    </View>
            </LinearGradient>
        </Animated.View>
        <View style={styles.upperHeaderPlacehoder}/>
        <ScrollView 
            onScroll={e => {
                const offsetY = e.nativeEvent.contentOffset.y;
                scrollY.setValue(offsetY);
            }}
            scrollEventThrottle={16}
        >
            <View style={styles.paddingContent}/>
            <View style={styles.scrollViewContent}>
            {currTab === tabs[0].label ? (
                <View>
                </View>
            ) : (
            currTab === tabs[1].label ? 
            ( hotPages ? (
                    <View style={styles.listPage}>
                        {hotPages.map((item, index) => 
                        <CardPage 
                          key={index}
                          images={item.avt?item.avt: "https://picsum.photos/200"} 
                          name={item.name} 
                          country={"Viet Nam"} 
                          distance={2.3} 
                          size={{
                            width: "32%",
                            height: 160
                          }}
                          onPress={() => handleNavigateToPage(item._id)}
                        />
                      )}
                    </View>
                    ) : (<View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator/></View>)
            ) : (
            pages ? (
                <View style={styles.listPage}>
                    {pages.map((item, index) => 
                    <CardPage 
                      key={index}
                      images={item.avt?item.avt: "https://picsum.photos/200"} 
                      name={item.name} 
                      country={"Viet Nam"} 
                      distance={2.3} 
                      size={{
                        width: "32%",
                        height: 160
                      }}
                      onPress={() => handleNavigateToPage(item._id)}
                    />
                  )}
                </View>
                ): (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator/></View>
                )
            ))}
            </View>
        </ScrollView>
        </View>
        ) : (<View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}><ActivityIndicator/></View>)}
    </View>
    )
}

const Color = getColor();
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Color.backGround,
    },
    images: {
        width: '100%', height: HEIGHT_HEADER
    },
    flexEnd: {
        justifyContent: 'flex-end',
    },
    textName: {
        color: 'rgba(255, 255, 255, 0.8)',
        fontSize: 35,
        fontWeight: 'bold',
        paddingVertical: 5,
    },
    textCountry: {
        color: 'rgba(255, 255, 255, 0.8)',
        textTransform: 'uppercase',
        letterSpacing: 8,
        fontWeight: '500',
        textAlign: 'center',
        paddingLeft: 8,
        paddingVertical: 5,
    },
    boxTitle: {
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 20,
    },
    textContent: {
        width: '90%',
        alignSelf: 'center',
        textAlign: 'justify',
        color: 'rgba(255, 255, 255, 0.5)',
        paddingVertical: 5,
    },
    tabs: {
        padding: 10,
        backgroundColor: Color.white_homologous,
        borderStartStartRadius: 30, borderStartEndRadius: 30
    },
    header: {
        position: 'absolute',
        width: '100%',
        top: 0,
        zIndex: 9
    },
    paddingContent: {
        height: 200,
    },
    scroll: {
        height: WINDOW_HEIGHT
    },
    scrollViewContent: {
        backgroundColor: Color.backGround,
        height: WINDOW_HEIGHT
    },
    upperHeaderPlacehoder: {
        height: WINDOW_HEIGHT-500
    },
    boxContent: {
        width: '100%',
        height: WINDOW_HEIGHT - 300,
        padding: 5,
        backgroundColor: Color.backGround,
    },
    row: {
        width: '100%',
        justifyContent: 'space-between',
        flexDirection: 'row',
        marginBottom: 5,
    },
    listPage: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
    }
})

export default CityProvice;