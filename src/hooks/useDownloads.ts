import { useState, useCallback } from 'react';
import { downloadService } from '../services/download';
import { Download, DownloadFilters } from '../types/download';
import { useAtom } from 'jotai';
import { addToastAtom } from '@/store';

export const useDownloads = () => {
  const [, addToast] = useAtom(addToastAtom);

  const [filters, setFilters] = useState<DownloadFilters>();
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDownloads = useCallback(
    async (appliedFilters?: DownloadFilters, reset = false) => {
      if (loading && !reset && !refreshing) return;

      try {
        setLoading(true);
        const currentPage = reset ? 0 : page + 1;
        const filtersToUse = appliedFilters || filters;

        const response = await downloadService.getDownloads({
          ...filtersToUse,
          page: currentPage,
          pageSize: 20,
        });

        if (reset) {
          setDownloads(response.data);
          setPage(0);
        } else {
          // Prevent duplicates
          const existingIds = new Set(downloads.map(d => d._id));
          const newDownloads = response.data.filter(
            (download: Download) => !existingIds.has(download._id),
          );
          setDownloads(prev => [...prev, ...newDownloads]);
          setPage(currentPage);
        }

        setHasMore(response.hasMore);
      } catch (error: any) {
        addToast({
          message: error.response?.data?.message || 'Failed to fetch downloads',
          type: 'error',
          duration: 5000,
        });
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    [downloads, filters, page, loading, refreshing, setDownloads, addToast],
  );

  const loadMoreDownloads = useCallback(() => {
    if (!loading && hasMore) {
      fetchDownloads();
    }
  }, [loading, hasMore, fetchDownloads]);

  const refreshDownloads = useCallback(
    async (appliedFilters?: DownloadFilters) => {
      setRefreshing(true);
      await fetchDownloads(appliedFilters || filters, true);
      setRefreshing(false);
    },
    [fetchDownloads, filters],
  );

  const applyFilters = useCallback(
    (newFilters: DownloadFilters) => {
      setFilters(newFilters);
      fetchDownloads(newFilters, true);
    },
    [setFilters, fetchDownloads],
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

  return {
    downloads,
    filters,
    loading,
    refreshing,
    hasMore,
    fetchDownloads,
    loadMoreDownloads,
    refreshDownloads,
    applyFilters,
    downloadFile,
  };
};
