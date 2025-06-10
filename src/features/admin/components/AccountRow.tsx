import React from 'react';
import {
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Account } from '@/src/interface/interface_reference'; // Make sure this path is correct

interface AccountRowProps {
  account: Account;
  onDelete: (accountId: string) => void;
}

const { width } = Dimensions.get('window');

const AccountRow: React.FC<AccountRowProps> = ({ account, onDelete }) => {
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
          backgroundColor: account._destroy ? '#E0E0E0' : '#FFFFFF',
          borderLeftColor: account.state === 'online' ? '#34C759' : '#FF3B30',
        },
      ]}
    >
      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: '#9E9E9E' }]}>Email:</Text>
          <Text style={[styles.value, { color: '#212121' }]}>{account.email}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: '#9E9E9E' }]}>SĐT:</Text>
          <Text style={[styles.value, { color: '#212121' }]}>{account.phone || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: '#9E9E9E' }]}>Vai trò:</Text>
          <Text style={[styles.value, { color: '#212121' }]}>{account.role}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: '#9E9E9E' }]}>Trạng thái:</Text>
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
          <Text style={[styles.label, { color: '#9E9E9E' }]}>Tạo lúc:</Text>
          <Text style={[styles.value, { color: '#212121' }]}>
            {new Date(account.createdAt).toLocaleDateString('vi-VN')}
          </Text>
        </View>
      </View>
      {!account._destroy && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#FF3B30' }]}
          onPress={confirmDelete}
        >
          <Text style={[styles.actionText, { color: '#FFFFFF' }]}>Xóa</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default AccountRow;