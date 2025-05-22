import restClient from '@/src/shared/services/RestClient';
import { useEffect, useState } from 'react';
import { Article, Report } from '../../interface';

const ITEMS_PER_PAGE = 5;

type FilterType = 'all' | 'deleted' | 'reported';

const useAdminArticleList = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReports, setSelectedReports] = useState<Report[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<FilterType>('all'); // Giữ nguyên tên biến filter

  const fetchArticles = async (page: number = 1, selectedFilter: FilterType = filter) => {
    try {
      setLoading(true);
      const query: any = {
        $limit: ITEMS_PER_PAGE,
        $skip: (page - 1) * ITEMS_PER_PAGE,
      };

      // Thêm tham số lọc
      if (selectedFilter === 'deleted') {
        query.isDeleted = true;
      } else if (selectedFilter === 'reported') {
        query.hasReports = true;
        query.isDeleted = false; // Đảm bảo chỉ lấy bài viết có báo cáo chưa bị xóa
      } else { // 'all'
        query.isDeleted = false; // Chỉ lấy bài viết chưa xóa khi lọc 'all'
      }

      const response = await restClient.apiClient.service('apis/articles').find(query);
      if (response.success) {
        setArticles(response.data);
        // Đảm bảo totalItems được tính toán đúng
        const totalItems = response.total !== undefined ? response.total : response.data.length;
        setTotalPages(Math.ceil(totalItems / ITEMS_PER_PAGE));
      } else {
        setError(response.messages?.join(', ') || 'Lỗi khi lấy danh sách bài viết');
      }
    } catch (err) {
      setError('Lỗi kết nối với server');
    } finally {
      setLoading(false);
    }
  };

  const fetchReportById = async (reportId: string): Promise<Report | null> => {
    try {
      const response = await restClient.apiClient.service('apis/reports').get(reportId);
      if (response.success) {
        return response.data as Report;
      } else {
        console.warn(`Failed to fetch report with id ${reportId}: ${response.messages}`);
        return null;
      }
    } catch (err) {
      console.error(`Error fetching report with id ${reportId}:`, err);
      return null;
    }
  };

  const fetchReportsForArticle = async (reportIds: string[]) => {
    const reportPromises = reportIds.map(reportId => fetchReportById(reportId));
    const reports = (await Promise.all(reportPromises)).filter((report): report is Report => report !== null);
    setSelectedReports(reports);
  };

  useEffect(() => {
    fetchArticles(currentPage, filter);
  }, [currentPage, filter]);

  const openReportModal = (reports: Article['reports']) => {
    if (reports && Array.isArray(reports)) {
      const reportIds = reports.map((report: any) =>
        typeof report === 'string' ? report : report._id
      );
      fetchReportsForArticle(reportIds);
    } else {
      setSelectedReports([]);
    }
    setModalVisible(true);
  };

  const closeReportModal = () => {
    setModalVisible(false);
  };

  // Đổi tên hàm này thành setFilter để khớp với tên biến state và prop của TabBarCustom
  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi bộ lọc
  };

  return {
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
    setFilter: handleFilterChange, // Export hàm đã đổi tên
  };
};

export default useAdminArticleList;