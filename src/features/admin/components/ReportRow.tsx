// Đã loại bỏ import { useTheme } từ '@/src/contexts/ThemeContext';
// Đã loại bỏ import { colors as Color } từ '@/src/styles/DynamicColors';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Report } from '../interface';

interface ReportRowProps {
  report: Report;
  onUpdate: (reportId: string, status: 'accepted' | 'rejected') => void;
}

const { width } = Dimensions.get('window');
const ReportRow: React.FC<ReportRowProps> = ({ report, onUpdate }) => {
  // Đã loại bỏ useTheme();
  const reporterName = report._idReporter 
  const reportId = report._id || 'N/A';
  const reportStatus = report.status || 'pending';

  return (
    <View
      style={[
        styles.card,
        {
          // Thay thế Color.backGround và Color.backGround2 bằng mã hex
          backgroundColor: reportStatus === 'pending' ? '#FFFFFF' : '#F0F2F5', // Ví dụ: Light background, Light secondary background
          // Thay thế bằng mã hex cho màu viền
          borderLeftColor:
            reportStatus === 'pending' ? '#FF9500' : reportStatus === 'accepted' ? '#34C759' : '#FF3B30', // Warning, Success, Error
        },
      ]}
    >
      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          {/* Thay thế Color.textColor3 bằng mã hex */}
          <Text style={[styles.label, { color: '#9E9E9E' }]}>ID:</Text> 
          {/* Thay thế Color.textColor1 bằng mã hex */}
          <Text style={[styles.value, { color: '#212121' }]}>{reportId}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: '#9E9E9E' }]}>Người báo cáo:</Text>
          <Text style={[styles.value, { color: '#212121' }]}>{reporterName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: '#9E9E9E' }]}>Lý do:</Text>
          <Text style={[styles.value, { color: '#212121' }]} numberOfLines={2}>
            {report.reason || 'Không có lý do'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: '#9E9E9E' }]}>Ngày:</Text>
          <Text style={[styles.value, { color: '#212121' }]}>
            {report.reportDate ? new Date(report.reportDate).toLocaleDateString('vi-VN') : 'N/A'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: '#9E9E9E' }]}>Trạng thái:</Text>
          <Text
            style={[
              styles.value,
              {
                // Màu trạng thái bằng mã hex
                color:
                  reportStatus === 'pending'
                    ? '#FF9500' // Warning
                    : reportStatus === 'accepted'
                    ? '#34C759' // Success
                    : '#FF3B30', // Error
              },
            ]}
          >
            {reportStatus === 'pending' ? 'Chờ xử lý' : reportStatus === 'accepted' ? 'Đã duyệt' : 'Đã từ chối'}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        {reportStatus === 'pending' && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#34C759' }]} // Màu nền nút Duyệt
              onPress={() => onUpdate(report._id || '', 'accepted')}
              disabled={!report._id}
            >
              {/* Thay thế Color.white_homologous bằng mã hex */}
              <Text style={[styles.actionText, { color: '#FFFFFF' }]}>Duyệt</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#FF3B30' }]} // Màu nền nút Từ chối
              onPress={() => onUpdate(report._id || '', 'rejected')}
              disabled={!report._id}
            >
              <Text style={[styles.actionText, { color: '#FFFFFF' }]}>Từ chối</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000', // Giữ nguyên màu đen cho bóng đổ
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
    // color được đặt inline
  },
  value: {
    fontSize: 14,
    fontWeight: '400',
    flex: 1,
    // color được đặt inline
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    // color được đặt inline
  },
});

export default ReportRow;