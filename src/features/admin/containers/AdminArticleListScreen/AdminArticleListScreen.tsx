import CButton from '@/src/shared/components/button/CButton';
import CHeader from '@/src/shared/components/header/CHeader';
import getColor from '@/src/styles/Color';
import React from 'react';
import { ActivityIndicator, Dimensions, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import ArticleRow from '../../components/ArticleRow';
import { Article } from '../../interface';
import ReportModalScreen from '../ReportModal/ReportModal';
import useAdminArticleList from './useAdminArticleList';

const { height, width } = Dimensions.get('window');

const AdminArticleListScreen: React.FC = () => {
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

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <CHeader label="Danh sách bài viết" showBackButton={false} />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={getColor().mainColor1} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <CHeader label="Danh sách bài viết" showBackButton={false} />
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: getColor().textColor1 }]}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getColor().backGround, maxHeight: height }]}>
      <CHeader label="Danh sách bài viết" showBackButton={false} />
      <View style={styles.content}>
        <View style={styles.filterContainer}>
          <CButton
            label="Tất cả"
            onSubmit={() => setFilter('all')}
            style={{
              width: width * 0.28,
              height: 40,
              backColor: filter === 'all' ? getColor().mainColor1 : getColor().backGround2,
              textColor: filter === 'all' ? getColor().white_homologous : getColor().textColor1,
              radius: 8,
            }}
          />
          <CButton
            label="Đã xóa"
            onSubmit={() => setFilter('deleted')}
            style={{
              width: width * 0.28,
              height: 40,
              backColor: filter === 'deleted' ? getColor().mainColor1 : getColor().backGround2,
              textColor: filter === 'deleted' ? getColor().white_homologous : getColor().textColor1,
              radius: 8,
            }}
          />
          <CButton
            label="Có báo cáo"
            onSubmit={() => setFilter('reported')}
            style={{
              width: width * 0.28,
              height: 40,
              backColor: filter === 'reported' ? getColor().mainColor1 : getColor().backGround2,
              textColor: filter === 'reported' ? getColor().white_homologous : getColor().textColor1,
              radius: 8,
            }}
          />
        </View>
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
            <Text style={[styles.noArticles, { color: getColor().textColor3 }]}>
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
                  backColor: getColor().mainColor1,
                  textColor: getColor().white_homologous,
                  radius: 8,
                }}
                disabled={currentPage === 1}
              />
              <Text style={[styles.pageText, { color: getColor().textColor1 }]}>
                Trang {currentPage} / {totalPages}
              </Text>
              <CButton
                label="Sau"
                onSubmit={handleNextPage}
                style={{
                  width: width * 0.3,
                  height: 40,
                  backColor: getColor().mainColor1,
                  textColor: getColor().white_homologous,
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
    backgroundColor: getColor().backGround,
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
    backgroundColor: getColor().backGround,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: getColor().backGround,
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
    backgroundColor: getColor().backGround1,
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
    color: getColor().textColor1,
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
});

export default AdminArticleListScreen;