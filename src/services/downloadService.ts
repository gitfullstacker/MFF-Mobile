import { apiClient } from './api';
import { Download, DownloadFilters } from '../types/download';
import { PaginatedResponse } from '../types/common';

export const downloadService = {
  async getDownloads(
    filters?: DownloadFilters,
  ): Promise<PaginatedResponse<Download>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    return apiClient.get(`/downloads?${params.toString()}`);
  },

  async downloadFile(downloadUrl: string, fileName: string): Promise<void> {
    // For React Native, we'll use the linking to open the URL
    // The actual file download will be handled by the system browser
    const { Linking } = require('react-native');
    await Linking.openURL(downloadUrl);
  },
};
