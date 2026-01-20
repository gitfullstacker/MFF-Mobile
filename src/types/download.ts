export interface FileInfo {
  name: string;
  file: string;
}

export interface Download {
  _id: string;
  download_id: string;
  user_id: number;
  download_url: string;
  product_id: number;
  product_name: string;
  download_name: string;
  order_id: number;
  order_key: string;
  downloads_remaining: string;
  access_expires: string;
  access_expires_gmt: string;
  file: FileInfo;
  created_at: string;
  updated_at: string;
}

export interface DownloadFilters {
  page?: number;
  pageSize?: number;
  search?: string;
}
