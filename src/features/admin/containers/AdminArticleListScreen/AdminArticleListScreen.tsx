import TabBarCustom, { Tab } from '@/src/features/group/components/TabBarCustom';
import CButton from '@/src/shared/components/button/CButton';
import CHeader from '@/src/shared/components/header/CHeader';
// Loại bỏ các import liên quan đến theme động
// import { useTheme } from '@/src/contexts/ThemeContext';
// import { colors as Color } from '@/src/styles/DynamicColors';
import React from 'react';
import { ActivityIndicator, Dimensions, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import ArticleRow from '../../components/ArticleRow';
import { Article } from '../../interface';
import ReportModalScreen from '../ReportModal/ReportModal';
import useAdminArticleList from './useAdminArticleList';

const { height, width } = Dimensions.get('window');

const AdminArticleListScreen: React.FC = () => {
  // Loại bỏ useTheme()
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
    setFilter,
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

  const tabs: Tab[] = [
    { label: 'Tất cả', icon: 'list' },
    { label: 'Đã xóa', icon: 'delete' },
    { label: 'Có báo cáo', icon: 'report' },
  ];

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
          <ActivityIndicator size="large" color="#4B164C" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <CHeader label="Danh sách bài viết" showBackButton={false} />
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: '#212121' }]}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#F5F5F5', maxHeight: height }]}>
      <CHeader label="Danh sách bài viết" showBackButton={false} />
      {/* Ensure no literal whitespace/newlines directly between View and its immediate children. */}
      {/* If this is the culprit, compacting these lines often resolves it. */}
      <View style={styles.content}>
        <TabBarCustom
          tabs={tabs}
          selectedTab={getSelectedTabLabel(filter)}
          onSelectTab={handleTabSelect}
          style={[styles.tabBarCustomStyle, { backgroundColor: '#E0E0E0' }]}
          activeTabStyle={[styles.activeTabStyle, { backgroundColor: '#4B164C' }]}
          inactiveTabStyle={styles.inactiveTabStyle}
          activeTextStyle={[styles.activeTextStyle, { color: '#FFFFFF' }]}
          inactiveTextStyle={[styles.inactiveTextStyle, { color: '#212121' }]}
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
            <Text style={[styles.noArticles, { color: '#9E9E9E' }]}>
              Không có bài viết nào
            </Text>
          }
          ListFooterComponent={
            <View style={[styles.paginationContainer, { backgroundColor: '#F8F8F8' }]}>
              <CButton
                label="Trước"
                onSubmit={handlePrevPage}
                style={{
                  width: width * 0.3,
                  height: 40,
                  backColor: '#4B164C',
                  textColor: '#FFFFFF',
                  radius: 8,
                }}
                disabled={currentPage === 1}
              />
              <Text style={[styles.pageText, { color: '#212121' }]}>
                Trang {currentPage} / {totalPages}
              </Text>
              <CButton
                label="Sau"
                onSubmit={handleNextPage}
                style={{
                  width: width * 0.3,
                  height: 40,
                  backColor: '#4B164C',
                  textColor: '#FFFFFF',
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
    backgroundColor: '#F5F5F5',
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
    backgroundColor: '#F5F5F5',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    borderRadius: 12,
    marginTop: 16,
    marginHorizontal: 8,
    alignSelf: 'center',
    width: width * 0.95,
    backgroundColor: '#F8F8F8',
  },
  pageText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    minWidth: 80,
  },
  filterContainer: {
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
  tabBarCustomStyle: {
    marginBottom: 12,
    marginHorizontal: 0,
    borderRadius: 8,
    elevation: 0,
    shadowOpacity: 0,
  },
  activeTabStyle: {
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  inactiveTabStyle: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  activeTextStyle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  inactiveTextStyle: {
    fontSize: 14,
  },
});

export default AdminArticleListScreen;