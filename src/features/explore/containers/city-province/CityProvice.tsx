import CommentItem from "@/src/features/newfeeds/components/CommentItem/CommentItem";
import Post from "@/src/features/newfeeds/components/post/Post";
import useNewFeed from "@/src/features/newfeeds/containers/newfeeds/useNewFeed";
import TabbarTop from "@/src/shared/components/tabbar-top/TabbarTop";
import { ExploreStackParamList } from "@/src/shared/routes/ExploreNavigation";
import getColor from "@/src/styles/Color";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RouteProp, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Modal from "react-native-modal";
import CardPage from "../../components/CardPage";
import HeaderProvince from "../../components/HeaderProvice";
import useCityProvince from "./useCityProvide";

const WINDOW_HEIGHT = Dimensions.get("window").height;
const HEIGHT_HEADER = WINDOW_HEIGHT - 300;

const CityProvince = () => {
  const colors = getColor();
  const route = useRoute<RouteProp<ExploreStackParamList, "CityProvice">>();
  const { provinceId } = route.params || {};
  const {
    translateViewAnimation,
    scrollY,
    currTab,
    setCurrTab,
    tabs,
    handleNavigateToPage,
    getHotPage,
    getProvince,
    getAllPage,
    getArticles,
    loadMoreArticles,
    province,
    hotPages,
    pages,
    articles,
    setArticles,
    isLoadingArticles,
    error,
  } = useCityProvince(provinceId);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const id = await AsyncStorage.getItem("userId");
      setUserId(id);
      await Promise.all([getProvince(), getHotPage(), getAllPage(), getArticles()]);
    };
    fetchData();
  }, [provinceId]);

  const {
    isModalVisible,
    currentArticle,
    newReply,
    openComments,
    closeComments,
    likeComment,
    replyToComment,
    setNewReply,
    likeArticle,
    calculateTotalComments,
    handleAddComment,
    deleteArticle,
    editArticle,
  } = useNewFeed(articles, setArticles);

  const handleScroll = (event: { nativeEvent: { contentOffset: { y: any; }; }; }) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollY.setValue(offsetY);
  };

  const contentPaddingTop = scrollY.interpolate({
    inputRange: [0, HEIGHT_HEADER], 
    outputRange: [HEIGHT_HEADER, 0],
    extrapolate: 'clamp', 
  });


  return (
    <View style={styles.container}>
      <HeaderProvince />
      {province ? (
        <View style={{ flex: 1 }}>
          <Animated.View style={[styles.header, translateViewAnimation]}>
            <Image style={styles.images} source={{ uri: province.avt }} />
            <LinearGradient
              colors={["rgba(75, 22, 76, 0)", "rgba(75, 22, 76, 1)"]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={[StyleSheet.absoluteFillObject, styles.flexEnd, styles.images]}
            >
              <View style={styles.boxTitle}>
                <Text style={styles.textName}>{province.name}</Text>
                <Text style={styles.textCountry}>Viet Nam</Text>
              </View>
              <View style={styles.tabs}>
                <TabbarTop tabs={tabs} startTab={currTab} setTab={setCurrTab} />
              </View>
            </LinearGradient>
          </Animated.View>
          <Animated.View style={[styles.contentListContainer, { paddingTop: contentPaddingTop }]}>
            {currTab === tabs[0].label ? (
              <FlatList
                data={articles}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <Post
                    userId={userId || ""}
                    article={item}
                    onCommentPress={() => openComments(item)}
                    onLike={() => likeArticle(item._id, item.createdBy._id)}
                    deleteArticle={deleteArticle}
                    editArticle={editArticle}
                  />
                )}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                onEndReached={loadMoreArticles}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                  isLoadingArticles ? (
                    <View style={styles.footer}>
                      <ActivityIndicator size="large" color={colors.mainColor1} />
                    </View>
                  ) : null
                }
                ListEmptyComponent={
                  <View style={styles.centered}>
                    <Text style={styles.emptyText}>
                      {isLoadingArticles ? "Đang tải..." : error || "Không có bài viết nào"}
                    </Text>
                  </View>
                }
              />
            ) : (
              <ScrollView
                onScroll={handleScroll}
                scrollEventThrottle={16}
                contentContainerStyle={styles.scrollViewContent}
              >
                {currTab === tabs[1].label ? (
                  hotPages ? (
                    <View style={styles.listPage}>
                      {hotPages.map((item) => (
                        <CardPage
                          key={item._id}
                          images={item.avt || "https://picsum.photos/200"}
                          name={item.name}
                          country="Viet Nam"
                          distance={2.3}
                          size={{ width: "32%", height: 160 }}
                          onPress={() => handleNavigateToPage(item._id)}
                        />
                      ))}
                    </View>
                  ) : (
                    <View style={styles.centered}>
                      <ActivityIndicator size="large" color={colors.mainColor1} />
                    </View>
                  )
                ) : pages ? (
                  <View style={styles.listPage}>
                    {pages.map((item) => (
                      <CardPage
                        key={item._id}
                        images={item.avt || "https://picsum.photos/200"}
                        name={item.name}
                        country="Viet Nam"
                        distance={2.3}
                        size={{ width: "32%", height: 160 }}
                        onPress={() => handleNavigateToPage(item._id)}
                      />
                    ))}
                  </View>
                ) : (
                  <View style={styles.centered}>
                    <ActivityIndicator size="large" color={colors.mainColor1} />
                  </View>
                )}
              </ScrollView>
            )}
          </Animated.View>

          <Modal
            isVisible={isModalVisible}
            onBackdropPress={closeComments}
            style={styles.modal}
          >
            <View style={styles.commentContainer}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentTitle}>
                  {calculateTotalComments(currentArticle?.comments || [])} bình luận
                </Text>
                <TouchableOpacity onPress={closeComments}>
                  <Ionicons name="close" size={24} color="black" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={currentArticle?.comments || []}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                 <CommentItem
                    userId={userId || ""}
                    comment={item}
                    onLike={likeComment}
                    onReply={replyToComment}
                />
                )}
              />
              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Viết bình luận..."
                  value={newReply}
                  onChangeText={setNewReply}
                />
                <TouchableOpacity onPress={handleAddComment}>
                  <Ionicons name="send" size={24} color={colors.mainColor1} />
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      ) : (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.mainColor1} />
        </View>
      )}
    </View>
  );
};

const Color = getColor();
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.backGround,
  },
  images: {
    width: "100%",
    height: HEIGHT_HEADER,
  },
  flexEnd: {
    justifyContent: "flex-end",
  },
  textName: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 35,
    fontWeight: "bold",
    paddingVertical: 5,
  },
  textCountry: {
    color: "rgba(255, 255, 255, 0.8)",
    textTransform: "uppercase",
    letterSpacing: 8,
    fontWeight: "500",
    textAlign: "center",
    paddingLeft: 8,
    paddingVertical: 5,
  },
  boxTitle: {
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 20,
  },
  tabs: {
    padding: 10,
    backgroundColor: Color.white_homologous,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  header: {
    position: "absolute",
    width: "100%",
    top: 0,
    zIndex: 9,
  },
  scrollViewContent: {
    flexGrow: 1,
    backgroundColor: Color.backGround,
  },
  listPage: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    padding: 10,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: Color.textColor3,
    fontStyle: "italic",
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  commentContainer: {
    height: 400,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
    backgroundColor: Color.white_homologous,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    marginBottom: 10,
    borderBottomColor: Color.borderColor1,
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Color.borderColor1,
    paddingVertical: 10,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginRight: 10,
  },
  footer: {
    padding: 10,
    alignItems: "center",
  },
  contentListContainer: {
    flex: 1,
    backgroundColor: Color.backGround,
  },
});

export default CityProvince;