import CButton from '@/src/shared/components/button/CButton';
import CHeader from '@/src/shared/components/header/CHeader';
import getColor from '@/src/styles/Color';
import React from 'react';
import { ActivityIndicator, Alert, Dimensions, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import TabBarCustom, { Tab } from '@/src/features/group/components/TabBarCustom';
import { Account } from '@/src/interface/interface_reference';
import useAdminAccountList from './useAdminAccountList';

const { height, width } = Dimensions.get('window');

const AccountRow: React.FC<{ account: Account; onDelete: (accountId: string) => void }> = ({ account, onDelete }) => {
  const colors = getColor();

  const confirmDelete = () => {
    Alert.alert(
      'Xác nhận xóa tài khoản',
      `Bạn có chắc chắn muốn xóa tài khoản ${account.email}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          onPress: () => onDelete(account._id),
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: account._destroy ? colors.backGround2 : colors.backGround,
          borderLeftColor: account.state === 'online' ? '#34C759' : '#FF3B30',
        },
      ]}
    >
      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.textColor3 }]}>Email:</Text>
          <Text style={[styles.value, { color: colors.textColor1 }]}>{account.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.textColor3 }]}>SĐT:</Text>
          <Text style={[styles.value, { color: colors.textColor1 }]}>{account.phone || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.textColor3 }]}>Vai trò:</Text>
          <Text style={[styles.value, { color: colors.textColor1 }]}>{account.role}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.textColor3 }]}>Trạng thái:</Text>
          <Text
            style={[
              styles.value,
              { color: account.state === 'online' ? '#34C759' : '#FF3B30' },
            ]}
          >
            {account.state === 'online' ? 'Trực tuyến' : 'Ngoại tuyến'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: colors.textColor3 }]}>Tạo lúc:</Text>
          <Text style={[styles.value, { color: colors.textColor1 }]}>
            {new Date(account.createdAt).toLocaleDateString('vi-VN')}
          </Text>
        </View>
      </View>
      {!account._destroy && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#FF3B30' }]}
          onPress={confirmDelete}
        >
          <Text style={[styles.actionText, { color: colors.white_homologous }]}>Xóa</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

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

  // Define tabs for TabBarCustom based on your FilterType
  const tabs: Tab[] = [
    { label: 'Tất cả tài khoản', icon: 'list' }, // Corresponds to 'all_active' or 'all'
    { label: 'Đã xóa', icon: 'delete' },
    { label: 'Trực tuyến', icon: 'wifi-tethering' },
    { label: 'Ngoại tuyến', icon: 'wifi-off' },
  ];

  // Helper function to map current filter to tab label
  const getSelectedTabLabel = (currentFilter: string) => {
    switch (currentFilter) {
      case 'all':
      case 'all_active': // 'all_active' is the default and likely maps to 'Tất cả tài khoản'
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

  // Handler for tab selection
  const handleTabSelect = (tabLabel: string) => {
    switch (tabLabel) {
      case 'Tất cả tài khoản':
        setFilter('all_active'); // Use 'all_active' as default filter for "Tất cả tài khoản"
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
          <ActivityIndicator size="large" color={getColor().mainColor1} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <CHeader label="Danh sách tài khoản" showBackButton={false} />
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: getColor().textColor1 }]}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: getColor().backGround, maxHeight: height }]}>
      <CHeader label="Danh sách tài khoản" showBackButton={false} />
      <View style={styles.content}>
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
          data={accounts}
          renderItem={renderAccount}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          initialNumToRender={5}
          maxToRenderPerBatch={10}
          windowSize={5}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={[styles.noAccounts, { color: getColor().textColor3 }]}>
              Không có tài khoản nào
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
  noAccounts: {
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 20,
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
    color: getColor().textColor3,
  },
  value: {
    fontSize: 14,
    fontWeight: '400',
    flex: 1,
    color: getColor().textColor1,
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
    backgroundColor: getColor().backGround2,
    elevation: 0,
    shadowOpacity: 0,
  },
  activeTabStyle: {
    backgroundColor: getColor().mainColor1,
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
    color: getColor().white_homologous,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  inactiveTextStyle: {
    color: getColor().textColor1,
    fontSize: 14,
  },
});

export default AdminAccountListScreen;