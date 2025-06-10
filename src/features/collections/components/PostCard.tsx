 // Adjust path if needed
import { Collection } from "@/src/interface/interface_reference";
import CButton from "@/src/shared/components/button/CButton";
import { CollectionStackParamList } from "@/src/shared/routes/CollectionNavigation";
import timeAgo from "@/src/shared/utils/TimeAgo";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Image } from 'expo-image';
import { useState } from "react";
import { Animated, Button, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Icon from "react-native-vector-icons/MaterialIcons";
import { ViewCardCollection } from "../containers/post/interface";

export interface PostCardProps {
    _id: string;
    content: string;
    author: {
        _id: string;
        displayName: string;
    };
    savedDate: number;
    img?: string;
    collectionId: string;
    deleteArticle: (itemId: string, collectionId: string) => void;
    changeCollection: (currCollectionId: string, newCollectionId: string, itemId: string) => void;
    listCollections: ViewCardCollection[];
}

type CollectionNavigationProp = StackNavigationProp<CollectionStackParamList>;

const PostCard = ({ _id, collectionId, content, author, savedDate, img, deleteArticle, changeCollection, listCollections }: PostCardProps) => {
  useTheme()
  const navigation = useNavigation<CollectionNavigationProp>();
  const [expanded, setExpanded] = useState(false);
  const [animationHeight] = useState(new Animated.Value(100));
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (collection: Collection) => {
    handleChangeCollection(collection);
    setModalVisible(false);
  };

  const toggleExpand = () => {
    const targetHeight = expanded ? 100 : 180;
    Animated.timing(animationHeight, {
      toValue: targetHeight,
      duration: 300,
      useNativeDriver: false,
    }).start(() => setExpanded(!expanded));
  };

  const handleDelete = () => {
    deleteArticle(_id, collectionId);
  };

  const handleChangeCollection = (collection: Collection) => {
    changeCollection(collectionId, collection._id, _id);
  };

  // New function to handle navigation to ArticleDetail
  const handleArticlePress = () => {
    navigation.navigate("ArticleDetail", { articleId: _id });
  };

  return (
    <Animated.View style={[styles.container, { height: animationHeight }]}>
      <View style={styles.mainContent}>
        <TouchableOpacity style={styles.boxContent} onPress={handleArticlePress}>
          <Image style={styles.images} source={{ uri: img }} resizeMode="cover" />
          <View style={styles.content}>
            <Text style={styles.textContent} numberOfLines={2} ellipsizeMode="tail">
              {content}
            </Text>
            <Text style={styles.textDes}>Tác giả: {author.displayName}</Text>
            <Text style={styles.textDes}>Đã lưu {timeAgo(savedDate)}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={toggleExpand}>
          <Icon name={expanded ? "expand-less" : "expand-more"} size={30} color={Color.mainColor2} />
        </TouchableOpacity>
      </View>
      {expanded && (
        <View style={styles.boxExpand}>
          <CButton
            label={"Xóa"}
            onSubmit={handleDelete}
            style={{
              width: "30%",
              height: 40,
              textColor: Color.mainColor2,
              borderColor: Color.mainColor2,
              borderWidth: 1,
            }}
          />
          <CButton
            label={"Đổi bộ sưu tập"}
            onSubmit={() => setModalVisible(true)}
            style={{
              width: "60%",
              height: 40,
              textColor: Color.textColor2,
              backColor: Color.mainColor2,
            }}
          />
        </View>
      )}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Chọn Bộ Sưu Tập</Text>
            <FlatList
              data={listCollections}
              keyExtractor={(item) => item.collection._id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.item} onPress={() => handleSelect(item.collection)}>
                  <Text style={styles.itemText}>{item.collection.name}</Text>
                </TouchableOpacity>
              )}
            />
            <Button title="Đóng" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: 10,
    overflow: "hidden",
  },
  mainContent: {
    width: "100%",
    height: 100,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 5,
  },
  boxContent: {
    width: "90%",
    height: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  option: {
    width: "10%",
    height: "100%",
    justifyContent: "center",
    alignContent: "center",
  },
  images: {
    width: 90,
    height: 90,
    borderRadius: 10,
  },
  content: {
    width: "65%",
    height: "100%",
    justifyContent: "space-around",
  },
  textContent: {
    fontWeight: "bold",
    fontSize: 15,
  },
  textDes: {
    fontSize: 13,
  },
  boxExpand: {
    alignSelf: "center",
    width: "90%",
    padding: 15,
    backgroundColor: Color.white,
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  itemText: {
    fontSize: 16,
  },
});

export default PostCard;