import CButton from '@/src/shared/components/button/CButton';
import CHeader from '@/src/shared/components/header/CHeader';
import React from 'react';
import { ActivityIndicator, Dimensions, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import TabBarCustom, { Tab } from '@/src/features/group/components/TabBarCustom';
import { Account } from '@/src/interface/interface_reference';
import useAdminAccountList from './useAdminAccountList';
import AccountRow from '../../components/AccountRow';

const { height, width } = Dimensions.get('window');

const AdminAccountListScreen: React.FC = () => {
  const {
    accounts,
    loading,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
    filter,
    setFilter,
    deleteAccount,
  } = useAdminAccountList();

  // Lọc tài khoản trên frontend: chỉ giữ tài khoản có role === "user"
  const filteredAccounts = accounts.filter((account) => account.role === 'user');

  const renderAccount = ({ item }: { item: Account }) => (
    <AccountRow account={item} onDelete={deleteAccount} />
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
    { label: 'Tất cả tài khoản', icon: 'list' },
    { label: 'Đã xóa', icon: 'delete' },
    { label: 'Trực tuyến', icon: 'wifi-tethering' },
    { label: 'Ngoại tuyến', icon: 'wifi-off' },
  ];

  const getSelectedTabLabel = (currentFilter: string) => {
    switch (currentFilter) {
      case 'all':
      case 'all_active':
        return 'Tất cả tài khoản';
      case 'deleted':
        return 'Đã xóa';
      case 'online':
        return 'Trực tuyến';
      case 'offline':
        return 'Ngoại tuyến';
      default:
        return 'Tất cả tài khoản';
    }
  };

  const handleTabSelect = (tabLabel: string) => {
    switch (tabLabel) {
      case 'Tất cả tài khoản':
        setFilter('all_active');
        break;
      case 'Đã xóa':
        setFilter('deleted');
        break;
      case 'Trực tuyến':
        setFilter('online');
        break;
      case 'Ngoại tuyến':
        setFilter('offline');
        break;
      default:
        setFilter('all_active');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <CHeader label="Danh sách tài khoản" showBackButton={false} />
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#4B164C" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <CHeader label="Danh sách tài khoản" showBackButton={false} />
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: '#212121' }]}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#F5F5F5', maxHeight: height }]}>
      <CHeader label="Danh sách tài khoản" showBackButton={false} />
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
          data={filteredAccounts} // Sử dụng filteredAccounts thay vì accounts
          renderItem={renderAccount}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={5}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={[styles.noAccounts, { color: '#9E9E9E' }]}>
              Không có tài khoản nào
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
    backgroundColor: '#F8F8F8',
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
    color: '#212121',
    minWidth: 80,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  noAccounts: {
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 20,
    color: '#9E9E9E',
  },
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 12,
  },
  cardContent: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
    color: '#9E9E9E',
  },
  value: {
    fontSize: 14,
    fontWeight: '400',
    flex: 1,
    color: '#212121',
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabBarCustomStyle: {
    marginBottom: 12,
    marginHorizontal: 0,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    elevation: 0,
    shadowOpacity: 0,
  },
  activeTabStyle: {
    backgroundColor: '#4B164C',
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
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  inactiveTextStyle: {
    color: '#212121',
    fontSize: 14,
  },
});

export default AdminAccountListScreen;