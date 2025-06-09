import { useTheme } from '@/src/contexts/ThemeContext';
import { colors as Color } from '@/src/styles/DynamicColors';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Report } from '../interface';

interface ReportRowProps {
  report: Report;
  onUpdate: (reportId: string, status: 'accepted' | 'rejected') => void;
}

const { width } = Dimensions.get('window');
const ReportRow: React.FC<ReportRowProps> = ({ report, onUpdate }) => {
  useTheme();
  const reporterName = report._idReporter 
  const reportId = report._id || 'N/A';
  const reportStatus = report.status || 'pending';

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: reportStatus === 'pending' ? Color.backGround : Color.backGround2,
          borderLeftColor:
            reportStatus === 'pending' ? '#FF9500' : reportStatus === 'accepted' ? '#34C759' : '#FF3B30',
        },
      ]}
    >
      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: Color.textColor3 }]}>ID:</Text>
          <Text style={[styles.value, { color: Color.textColor1 }]}>{reportId}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: Color.textColor3 }]}>Người báo cáo:</Text>
          <Text style={[styles.value, { color: Color.textColor1 }]}>{reporterName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: Color.textColor3 }]}>Lý do:</Text>
          <Text style={[styles.value, { color: Color.textColor1 }]} numberOfLines={2}>
            {report.reason || 'Không có lý do'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: Color.textColor3 }]}>Ngày:</Text>
          <Text style={[styles.value, { color: Color.textColor1 }]}>
            {report.reportDate ? new Date(report.reportDate).toLocaleDateString('vi-VN') : 'N/A'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: Color.textColor3 }]}>Trạng thái:</Text>
          <Text
            style={[
              styles.value,
              {
                color:
                  reportStatus === 'pending'
                    ? '#FF9500'
                    : reportStatus === 'accepted'
                    ? '#34C759'
                    : '#FF3B30',
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
              style={[styles.actionButton, { backgroundColor: '#34C759' }]}
              onPress={() => onUpdate(report._id || '', 'accepted')}
              disabled={!report._id}
            >
              <Text style={[styles.actionText, { color: Color.white_homologous }]}>Duyệt</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: '#FF3B30' }]}
              onPress={() => onUpdate(report._id || '', 'rejected')}
              disabled={!report._id}
            >
              <Text style={[styles.actionText, { color: Color.white_homologous }]}>Từ chối</Text>
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
    color: Color.textColor3,
  },
  value: {
    fontSize: 14,
    fontWeight: '400',
    flex: 1,
    color: Color.textColor1,
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
  },
});

export default ReportRow;