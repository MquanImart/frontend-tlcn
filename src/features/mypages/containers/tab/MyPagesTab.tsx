import CardPage from "@/src/features/explore/components/CardPage";
import { PageProvince } from "@/src/features/explore/containers/city-province/interface";
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import React from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import useMyPagesTab from "./useMyPagesTab";

interface MyPagesTabProps {
  userId: string;
  handleScroll: (event: any) => void;
}

const MyPagesTab = ({ userId, handleScroll }: MyPagesTabProps) => {
  useTheme();
  const { filledData, handleNavigateToPage, loading, error } = useMyPagesTab(userId);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: Color.background }]}>
        <ActivityIndicator size="large" color={Color.mainColor2} />
        <Text style={{ color: Color.textSecondary }}>Đang tải...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: Color.background }]}>
        <Text style={{ color: Color.error }}>Lỗi: {error}</Text>
      </View>
    );
  }

  const renderPageItem = ({ item }: { item: PageProvince & { isFiller?: boolean } }) => {
    if (item.isFiller) {
      return <View style={styles.filler} />;
    }
    return (
      <CardPage
        images={item.avt?.url || null}
        name={item.name}
        country={"Viet Nam"}
        size={{ width: "32%", height: 160 }}
        onPress={() => handleNavigateToPage(item._id)}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: Color.background }]}>
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
    width: "32%",
    height: 160,
    backgroundColor: "transparent",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MyPagesTab;