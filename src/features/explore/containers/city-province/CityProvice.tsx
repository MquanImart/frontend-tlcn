// src/features/explore/containers/city-province/CityProvince.tsx

import CommentItem from "@/src/features/newfeeds/components/CommentItem/CommentItem";
import Post from "@/src/features/newfeeds/components/post/Post";
import useNewFeed from "@/src/features/newfeeds/containers/newfeeds/useNewFeed";
import TabbarTop from "@/src/shared/components/tabbar-top/TabbarTop";
import { ExploreStackParamList } from "@/src/shared/routes/ExploreNavigation";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Image } from 'expo-image';
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Modal from "react-native-modal";
import CardPage from "../../components/CardPage";
import HeaderProvince from "../../components/HeaderProvice";
import useCityProvince from "./useCityProvide";

const WINDOW_HEIGHT = Dimensions.get("window").height;
const HEADER_HEIGHT_RATIO = 0.4;
const HEIGHT_HEADER = WINDOW_HEIGHT * HEADER_HEIGHT_RATIO;
const PADDING_ANIMATED_RATIO = 0.05;
const PADDING_ANIMATED_HEIGHT = WINDOW_HEIGHT * PADDING_ANIMATED_RATIO;

const BOTTOM_TAB_BAR_HEIGHT = 60;

const CityProvince = () => {
  useTheme();
  const route = useRoute<RouteProp<ExploreStackParamList, "CityProvice">>();
  const { provinceId } = route.params || {};
  const {
    translateViewAnimation,
    scrollY,
    currTab,
    handleChangeTab,
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
    selectedMedia,
    isCommentChecking,
    pickMedia,
  } = useNewFeed(articles, setArticles);

  const onScrollAnimated = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: true,
  });

  return (
    <View style={[styles.container, { backgroundColor: Color.background }]}>
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
              <View style={[styles.tabs, { backgroundColor: Color.backgroundSecondary }]}>
                <TabbarTop tabs={tabs} startTab={currTab} setTab={handleChangeTab} />
              </View>
            </LinearGradient>
          </Animated.View>
          <View style={{ height: PADDING_ANIMATED_HEIGHT }} />
          <View style={[styles.contentListContainer, { backgroundColor: Color.background }]}>
            <Animated.FlatList
              style={{
                flex: 1,
                display: currTab === tabs[0].label ? "flex" : "none",
              }}
              contentContainerStyle={{
                paddingTop: HEIGHT_HEADER - PADDING_ANIMATED_HEIGHT / 2,
                paddingBottom: BOTTOM_TAB_BAR_HEIGHT + 20,
              }}
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
              onScroll={onScrollAnimated}
              scrollEventThrottle={16}
              onEndReached={loadMoreArticles}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                isLoadingArticles ? (
                  <View style={styles.footer}>
                    <ActivityIndicator size="large" color={Color.mainColor2} />
                  </View>
                ) : null
              }
              ListEmptyComponent={
                <View style={styles.centered}>
                  <Text style={[styles.emptyText, { color: Color.textSecondary }]}>
                    {isLoadingArticles ? "Đang tải..." : error || "Không có bài viết nào"}
                  </Text>
                </View>
              }
            />
            <Animated.ScrollView
              style={{
                flex: 1,
                display: currTab === tabs[0].label ? "none" : "flex",
              }}
              onScroll={onScrollAnimated}
              scrollEventThrottle={16}
              contentContainerStyle={[
                styles.scrollViewContent,
                {
                  backgroundColor: Color.background,
                  paddingTop: HEIGHT_HEADER - PADDING_ANIMATED_HEIGHT / 2,
                  paddingBottom: BOTTOM_TAB_BAR_HEIGHT + 20,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                {currTab === tabs[1].label ? (
                  hotPages ? (
                    <View style={styles.listPage}>
                      {hotPages.map((item) => (
                        <CardPage
                          key={item._id}
                          images={item.avt?.url || null}
                          name={item.name}
                          country="Viet Nam"
                          size={{ width: "32%", height: 160 }}
                          onPress={() => handleNavigateToPage(item._id)}
                        />
                      ))}
                    </View>
                  ) : (
                    <View style={styles.centered}>
                      <ActivityIndicator size="large" color={Color.mainColor2} />
                    </View>
                  )
                ) : pages ? (
                  <View style={styles.listPage}>
                    {pages.map((item) => (
                      <CardPage
                        key={item._id}
                        images={item.avt?.url || null}
                        name={item.name}
                        country="Viet Nam"
                        size={{ width: "32%", height: 160 }}
                        onPress={() => handleNavigateToPage(item._id)}
                      />
                    ))}
                  </View>
                ) : (
                  <View style={styles.centered}>
                    <ActivityIndicator size="large" color={Color.mainColor2} />
                  </View>
                )}
              </View>
            </Animated.ScrollView>
          </View>

          <Modal
            isVisible={isModalVisible}
            onBackdropPress={closeComments}
            style={styles.modal}
            backdropOpacity={0.5}
            animationIn="slideInUp"
            animationOut="slideOutDown"
            useNativeDriver={true}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            >
              <View style={[styles.commentContainer, { backgroundColor: Color.background }]}>
                <View style={[styles.commentHeader, { borderBottomColor: Color.border }]}>
                  <Text style={[styles.commentTitle, { color: Color.textPrimary }]}>
                    {calculateTotalComments(currentArticle?.comments || [])} bình luận
                  </Text>
                  <TouchableOpacity onPress={closeComments}>
                    <Ionicons name="close" size={24} color={Color.textPrimary} />
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
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={styles.commentList}
                  keyboardShouldPersistTaps="handled"
                  initialNumToRender={10}
                  maxToRenderPerBatch={10}
                  windowSize={5}
                  removeClippedSubviews={true}
                  getItemLayout={(data, index) => ({ length: 100, offset: 100 * index, index })}
                  nestedScrollEnabled={true}
                  onScrollBeginDrag={() => Keyboard.dismiss()}
                />

                {selectedMedia && selectedMedia.length > 0 && (
                  <View style={styles.mediaPreviewContainer}>
                    {selectedMedia.map((media, index) => (
                      <Image key={index} source={{ uri: media.uri }} style={styles.mediaPreview} />
                    ))}
                  </View>
                )}

                <View
                  style={[
                    styles.commentInputContainer,
                    {
                      backgroundColor: Color.backgroundSecondary,
                      borderColor: Color.border,
                    },
                  ]}
                >
                  <TouchableOpacity onPress={pickMedia} activeOpacity={0.7}>
                    <Ionicons name="image" size={24} color={Color.mainColor2} />
                  </TouchableOpacity>
                  <TextInput
                    style={[
                      styles.commentInput,
                      {
                        color: Color.textPrimary,
                      },
                    ]}
                    placeholder="Viết bình luận..."
                    placeholderTextColor={Color.textTertiary}
                    value={newReply}
                    onChangeText={setNewReply}
                    multiline
                    onSubmitEditing={() => Keyboard.dismiss()}
                  />
                  {isCommentChecking ? (
                    <ActivityIndicator size="small" color={Color.mainColor2} />
                  ) : (
                    <TouchableOpacity onPress={handleAddComment} activeOpacity={0.7}>
                      <Ionicons name="send" size={20} color={Color.mainColor2} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </KeyboardAvoidingView>
          </Modal>
        </View>
      ) : (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Color.mainColor2} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontStyle: "italic",
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  commentContainer: {
    height: WINDOW_HEIGHT * 0.6,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 15,
    maxHeight: WINDOW_HEIGHT * 0.8,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    paddingHorizontal: 10,
    maxHeight: 100,
  },
  footer: {
    padding: 10,
    alignItems: "center",
  },
  contentListContainer: {
    flex: 1,
  },
  paddingAnimated: {
    height: PADDING_ANIMATED_HEIGHT,
  },
  commentList: {
    flexGrow: 1,
    paddingBottom: 10,
  },
  mediaPreviewContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 10,
  },
  mediaPreview: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 5,
  },
});

export default CityProvince;