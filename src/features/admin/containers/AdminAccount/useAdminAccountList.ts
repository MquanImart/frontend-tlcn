import { Account } from '@/src/interface/interface_reference';
import restClient from '@/src/shared/services/RestClient';
import { useEffect, useState } from 'react';

const ITEMS_PER_PAGE = 5;

type FilterType = 'all' | 'all_active' | 'deleted' | 'online' | 'offline';

const useAdminAccountList = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<FilterType>('all_active');

  const fetchAccounts = async (page: number = 1, selectedFilter: FilterType = filter) => {
    try {
      setLoading(true);
      const query: any = {
        filter: selectedFilter,
        page,
        limit: ITEMS_PER_PAGE,
      };

      const response = await restClient.apiClient.service('apis/accounts').find(query);

      if (response.success) {
        setAccounts(response.data);
        setTotalPages(response.pagination?.totalPages || 1);
        setError(null);
      } else {
        setError(response.message || 'Lỗi khi lấy danh sách tài khoản');
      }
    } catch (err: any) {
      console.error('Fetch accounts error:', err);
      setError(err.message || 'Lỗi kết nối với server');
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (accountId: string) => {
    try {
      const response = await restClient.apiClient.service('apis/accounts').patch(accountId, {
        _destroy: Date.now(),
      });
      if (response.success) {
        setError(null);
        fetchAccounts(currentPage, filter);
        return true;
      } else {
        setError(response.message || 'Lỗi khi xóa tài khoản');
        return false;
      }
    } catch (err: any) {
      console.error('Delete account error:', err);
      setError(err.message || 'Lỗi kết nối với server');
      return false;
    }
  };

  useEffect(() => {
    fetchAccounts(currentPage, filter);
  }, [currentPage, filter]);

  const handleSetFilter = (newFilter: FilterType) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  return {
    accounts,
    loading,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
    filter,
    setFilter: handleSetFilter,
    fetchAccounts,
    deleteAccount,
  };
};

export default useAdminAccountList;