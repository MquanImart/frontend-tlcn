import restClient from '@/src/shared/services/RestClient';
import { useState } from 'react';

const useReportModal = (onReportUpdated: () => void) => {
  const [error, setError] = useState<string | null>(null);

  const handleUpdateReport = async (reportId: string, status: 'accepted' | 'rejected') => {
    try {
      const response = await restClient.apiClient.service('apis/reports').patch(reportId, { status });
      if (response.success) {
        setError(null);
        onReportUpdated();
        return response.data; // Trả về báo cáo đã cập nhật
      } else {
        setError(response.messages || 'Lỗi khi cập nhật báo cáo');
        return null;
      }
    } catch (err) {
      setError('Lỗi kết nối với server');
      return null;
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      const response = await restClient.apiClient.service('apis/reports').remove(reportId);
      if (response.success) {
        setError(null);
        onReportUpdated();
        return true;
      } else {
        setError(response.messages || 'Lỗi khi xóa báo cáo');
        return false;
      }
    } catch (err) {
      setError('Lỗi kết nối với server');
      return false;
    }
  };

  return {
    error,
    setError,
    handleUpdateReport,
    handleDeleteReport,
  };
};

export default useReportModal;