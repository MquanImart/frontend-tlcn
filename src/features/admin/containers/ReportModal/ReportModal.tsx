import getColor from '@/src/styles/Color';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ReportRow from '../../components/ReportRow';
import { Report } from '../../interface/index';
import useReportModal from './useReportModal';

interface ReportModalScreenProps {
  visible: boolean;
  onClose: () => void;
  reports: Report[];
  onReportUpdated: () => void;
}

const { width, height } = Dimensions.get('window');
const Color = getColor();
const ReportModalScreen: React.FC<ReportModalScreenProps> = ({
  visible,
  onClose,
  reports: initialReports,
  onReportUpdated,
}) => {
  const { error, setError, handleUpdateReport } = useReportModal(onReportUpdated);
  const Color = getColor();
  const [reports, setReports] = useState<Report[]>(initialReports);

  // Cập nhật reports khi initialReports thay đổi
  useEffect(() => {
    setReports(initialReports);
  }, [initialReports]);

  // Xác nhận trước khi cập nhật báo cáo
  const confirmUpdateReport = async (reportId: string, status: 'accepted' | 'rejected') => {
    if (status === 'accepted') {
      Alert.alert(
        'Xác nhận chấp nhận báo cáo',
        'Chấp nhận báo cáo này sẽ ẩn bài viết liên quan khỏi hệ thống. Bạn có chắc chắn muốn tiếp tục?',
        [
          { text: 'Hủy', style: 'cancel' },
          {
            text: 'Đồng ý',
            onPress: () => updateReport(reportId, status),
            style: 'destructive',
          },
        ]
      );
    } else {
      updateReport(reportId, status);
    }
  };

  // Cập nhật báo cáo và danh sách reports
  const updateReport = async (reportId: string, status: 'accepted' | 'rejected') => {
    const updatedReport = await handleUpdateReport(reportId, status);
    if (updatedReport) {
      setReports((prevReports) =>
        prevReports.map((report) =>
          report._id === reportId ? { ...report, status } : report
        )
      );

      onClose();
    }
  };


  const safeReports = Array.isArray(reports) ? reports : [];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { width: width * 0.9, maxHeight: height * 0.8, backgroundColor: Color.backGround }]}>
          <Text style={[styles.modalTitle, { color: Color.textColor1 }]}>
            Danh sách báo cáo
          </Text>
          {safeReports.length > 0 ? (
            <FlatList
              data={safeReports}
              renderItem={({ item }) => (
                <ReportRow
                  report={item}
                  onUpdate={confirmUpdateReport}
                />
              )}
              keyExtractor={(item) => item._id || Math.random().toString()}
              style={styles.reportList}
              initialNumToRender={5}
              maxToRenderPerBatch={10}
              windowSize={5}
            />
          ) : (
            <Text style={[styles.noReports, { color: Color.textColor3 }]}>
              Không có báo cáo nào
            </Text>
          )}
          {error && (
            <Text style={[styles.errorText, { color: 'red' }]}>{error}</Text>
          )}
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: Color.mainColor2 }]}
            onPress={onClose}
          >
            <Text style={[styles.closeButtonText, { color: Color.white_homologous }]}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Color.borderColor1,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  reportList: {
    maxHeight: height * 0.6,
    marginBottom: 12,
  },
  noReports: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    paddingVertical: 10,
  },
  errorText: {
    fontSize: 12,
    marginBottom: 12,
    textAlign: 'center',
  },
  closeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ReportModalScreen;