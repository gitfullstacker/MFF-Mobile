import { useState, useCallback, useEffect } from 'react';
import { downloadService } from '../services/download';
import { Download, DownloadFilters } from '../types/download';
import { PaginatedResponse } from '../types/common';

export const useDownloads = () => {
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 0,
    pageSize: 20,
    totalPages: 0,
    hasMore: false,
  });

  const fetchDownloads = useCallback(
    async (filters?: DownloadFilters, append = false) => {
      try {
        if (!append) {
          setLoading(true);
        }
        setError(null);

        const response: PaginatedResponse<Download> =
          await downloadService.getDownloads(filters);

        if (append) {
          setDownloads(prev => [...prev, ...response.data]);
        } else {
          setDownloads(response.data);
        }

        setPagination({
          total: response.total,
          page: response.page,
          pageSize: response.pageSize,
          totalPages: response.totalPages,
          hasMore: response.hasMore,
        });
      } catch (err: any) {
        console.error('Error fetching downloads:', err);
        setError(err.message || 'Failed to fetch downloads');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  const refreshDownloads = useCallback(
    async (filters?: DownloadFilters) => {
      setRefreshing(true);
      await fetchDownloads({ ...filters, page: 0 });
    },
    [fetchDownloads],
  );

  const loadMoreDownloads = useCallback(
    async (filters?: DownloadFilters) => {
      if (pagination.hasMore && !loading) {
        const nextPage = pagination.page + 1;
        await fetchDownloads({ ...filters, page: nextPage }, true);
      }
    },
    [fetchDownloads, pagination.hasMore, pagination.page, loading],
  );

  const downloadFile = useCallback(async (download: Download) => {
    try {
      await downloadService.downloadFile(
        download.download_url,
        download.file.name,
      );
    } catch (err: any) {
      console.error('Error downloading file:', err);
      throw new Error(err.message || 'Failed to download file');
    }
  }, []);

  const searchDownloads = useCallback(
    async (searchTerm: string) => {
      await fetchDownloads({ search: searchTerm, page: 0 });
    },
    [fetchDownloads],
  );

  // Initial load
  useEffect(() => {
    fetchDownloads();
  }, [fetchDownloads]);

  return {
    downloads,
    loading,
    error,
    refreshing,
    pagination,
    fetchDownloads,
    refreshDownloads,
    loadMoreDownloads,
    downloadFile,
    searchDownloads,
  };
};
