import TabBarCustom, { Tab } from '@/src/features/group/components/TabBarCustom';
import CButton from '@/src/shared/components/button/CButton';
import CHeader from '@/src/shared/components/header/CHeader'; // Import TabBarCustom and Tab interface
import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import React from 'react';
import { ActivityIndicator, Dimensions, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import ArticleRow from '../../components/ArticleRow';
import { Article } from '../../interface';
import ReportModalScreen from '../ReportModal/ReportModal';
import useAdminArticleList from './useAdminArticleList';

const { height, width } = Dimensions.get('window');
const AdminArticleListScreen: React.FC = () => {
  useTheme();
  const {
    articles,
    loading,
    error,
    modalVisible,
    selectedReports,
    openReportModal,
    closeReportModal,
    fetchArticles,
    totalPages,
    currentPage,
    setCurrentPage,
    filter,
    setFilter, // This is now handleFilterChange from the hook
  } = useAdminArticleList();

  const renderArticle = ({ item }: { item: Article }) => (
    <ArticleRow article={item} onPress={() => openReportModal(item.reports)} />
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Define tabs for TabBarCustom
  const tabs: Tab[] = [
    { label: 'Tất cả', icon: 'list' },
    { label: 'Đã xóa', icon: 'delete' },
    { label: 'Có báo cáo', icon: 'report' },
  ];

  // Map filter state to TabBarCustom's selectedTab
  const getSelectedTabLabel = (currentFilter: string) => {
    switch (currentFilter) {
      case 'all':
        return 'Tất cả';
      case 'deleted':
        return 'Đã xóa';
      case 'reported':
        return 'Có báo cáo';
      default:
        return 'Tất cả';
    }
  };

  // Map TabBarCustom's selected label to filter state
  const handleTabSelect = (tabLabel: string) => {
    switch (tabLabel) {
      case 'Tất cả':
        setFilter('all');
        break;
      case 'Đã xóa':
        setFilter('deleted');
        break;
      case 'Có báo cáo':
        setFilter('reported');
        break;
      default:
        setFilter('all');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <CHeader label="Danh sách bài viết" showBackButton={false} />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Color.mainColor1} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <CHeader label="Danh sách bài viết" showBackButton={false} />
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: Color.textColor1 }]}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Color.backGround, maxHeight: height }]}>
      <CHeader label="Danh sách bài viết" showBackButton={false} />
      <View style={styles.content}>
        {/* Integrate TabBarCustom here */}
        <TabBarCustom
          tabs={tabs}
          selectedTab={getSelectedTabLabel(filter)}
          onSelectTab={handleTabSelect}
          style={styles.tabBarCustomStyle}
          activeTabStyle={styles.activeTabStyle}
          inactiveTabStyle={styles.inactiveTabStyle}
          activeTextStyle={styles.activeTextStyle}
          inactiveTextStyle={styles.inactiveTextStyle}
        />

        <FlatList
          data={articles}
          renderItem={renderArticle}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={5}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={[styles.noArticles, { color: Color.textColor3 }]}>
              Không có bài viết nào
            </Text>
          }
          ListFooterComponent={
            <View style={styles.paginationContainer}>
              <CButton
                label="Trước"
                onSubmit={handlePrevPage}
                style={{
                  width: width * 0.3,
                  height: 40,
                  backColor: Color.mainColor1,
                  textColor: Color.white_homologous,
                  radius: 8,
                }}
                disabled={currentPage === 1}
              />
              <Text style={[styles.pageText, { color: Color.textColor1 }]}>
                Trang {currentPage} / {totalPages}
              </Text>
              <CButton
                label="Sau"
                onSubmit={handleNextPage}
                style={{
                  width: width * 0.3,
                  height: 40,
                  backColor: Color.mainColor1,
                  textColor: Color.white_homologous,
                  radius: 8,
                }}
                disabled={currentPage === totalPages}
              />
            </View>
          }
        />
      </View>
      <ReportModalScreen
        visible={modalVisible}
        onClose={closeReportModal}
        reports={selectedReports}
        onReportUpdated={fetchArticles}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.backGround,
  },
  content: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  listContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Color.backGround,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: Color.backGround,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Color.backGround1,
    borderRadius: 12,
    marginTop: 16,
    marginHorizontal: 8,
    alignSelf: 'center',
    width: width * 0.95,
  },
  pageText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: Color.textColor1,
    minWidth: 80,
  },
  filterContainer: { // This style is no longer used directly but kept for reference
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  noArticles: {
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 20,
  },
  // Styles for TabBarCustom
  tabBarCustomStyle: {
    marginBottom: 12,
    marginHorizontal: 0, // Adjust as needed
    borderRadius: 8,
    backgroundColor: Color.backGround2, // Match the original button background
    elevation: 0, // Remove shadow if not desired
    shadowOpacity: 0,
  },
  activeTabStyle: {
    backgroundColor: Color.mainColor1,
    borderRadius: 8, // Apply radius to active tab
    paddingHorizontal: 15, // Adjust padding
    paddingVertical: 10,
  },
  inactiveTabStyle: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  activeTextStyle: {
    color: Color.white_homologous, // Match original button text color
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  inactiveTextStyle: {
    color: Color.textColor1, // Match original button text color
    fontSize: 14,
  },
});

export default AdminArticleListScreen;
