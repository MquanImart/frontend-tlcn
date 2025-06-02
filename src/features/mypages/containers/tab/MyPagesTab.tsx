import React from "react";
import { View, StyleSheet, FlatList, ActivityIndicator, Text } from "react-native";
import getColor from "@/src/styles/Color";
import CardPage from "@/src/features/explore/components/CardPage";
import { Page } from "@/src/interface/interface_reference";
import useMyPagesTab from "./useMyPagesTab";

const Color = getColor();

interface MyPagesTabProps {
  userId: string;
  handleScroll: (event: any) => void;
}

const MyPagesTab = ({ userId, handleScroll }: MyPagesTabProps) => {
  const { filledData, handleNavigateToPage, loading, error } = useMyPagesTab(userId);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Color.mainColor1} />
        <Text>Đang tải...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: "red" }}>Lỗi: {error}</Text>
      </View>
    );
  }

  const renderPageItem = ({ item }: { item: Page & { isFiller?: boolean } }) => {
    if (item.isFiller) {
      return <View style={styles.filler} />;
    }
    return (
      <CardPage
        images={item.avt || "https://picsum.photos/200"}
        name={item.name} // name là required trong Page
        country={"Viet Nam"} // Giá trị mặc định vì Page không có country
        size={{ width: "32%", height: 160 }}
        onPress={() => handleNavigateToPage(item._id)}
      />
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={filledData}
        renderItem={renderPageItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        numColumns={3}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.backGround,
  },
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 10,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 10,
  },
  filler: {
    width: "32%", // Phải khớp với width của CardPage
    height: 160, // Phải khớp với height của CardPage
    backgroundColor: "transparent",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MyPagesTab;