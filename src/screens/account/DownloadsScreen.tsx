import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { PageContainer } from '../../components/layout/PageContainer';
import { Header } from '../../components/navigation/Header';
import { Input } from '../../components/forms/Input';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LoadingOverlay } from '../../components/feedback/LoadingOverlay';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
  shadows,
} from '../../theme';
import { useDownloads } from '../../hooks/useDownloads';
import { Download } from '@/types/download';

const DownloadsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  const {
    downloads: apiDownloads,
    loading,
    error,
    refreshing,
    pagination,
    refreshDownloads,
    loadMoreDownloads,
    downloadFile,
    searchDownloads,
  } = useDownloads();

  const [filteredDownloads, setFilteredDownloads] = useState<Download[]>([]);

  useEffect(() => {
    setFilteredDownloads(
      searchQuery.trim()
        ? apiDownloads.filter(download =>
            download.download_name
              .toLowerCase()
              .includes(searchQuery.toLowerCase()),
          )
        : apiDownloads,
    );
  }, [apiDownloads, searchQuery]);

  const handleRefresh = useCallback(async () => {
    await refreshDownloads();
  }, [refreshDownloads]);

  const handleLoadMore = useCallback(async () => {
    if (pagination.hasMore) {
      await loadMoreDownloads();
    }
  }, [loadMoreDownloads, pagination.hasMore]);

  const handleDownload = async (download: Download) => {
    try {
      Alert.alert('Download', `Download "${download.download_name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          onPress: () => {
            downloadFile({
              _id: download._id,
              download_url: download.download_url,
              file: { name: download.download_name },
            } as any).catch(() => {
              Alert.alert(
                'Error',
                'Unable to open download. Please try again.',
              );
            });
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to download file. Please try again.');
    }
  };

  const handleSearch = useCallback(
    (text: string) => {
      setSearchQuery(text);
      if (text.trim()) {
        searchDownloads(text);
      } else {
        refreshDownloads();
      }
    },
    [searchDownloads, refreshDownloads],
  );

  const renderDownloadCard = ({ item }: { item: Download }) => {
    return (
      <TouchableOpacity
        style={styles.downloadCard}
        onPress={() => handleDownload(item)}
        activeOpacity={0.7}>
        {/* Header */}
        <View style={styles.downloadHeader}>
          <View style={styles.downloadType}>
            <View
              style={[
                styles.typeIcon,
                { backgroundColor: colors.semantic.error + '20' },
              ]}>
              <Icon name="file-text" size={20} color={colors.semantic.error} />
            </View>
            <View style={styles.downloadInfo}>
              <Text style={styles.downloadName} numberOfLines={2}>
                {item.download_name}
              </Text>
              {item.product_name && (
                <Text style={styles.downloadDescription} numberOfLines={2}>
                  {item.product_name}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.downloadActions}>
            <View style={styles.downloadButton}>
              <Icon name="download" size={20} color={colors.primary} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (loading) return null;

    if (searchQuery) {
      return (
        <EmptyState
          title="No downloads found"
          description={`No downloads match "${searchQuery}"`}
          action={{
            label: 'Clear Search',
            onPress: () => {
              setSearchQuery('');
              refreshDownloads();
            },
          }}
        />
      );
    }

    return (
      <EmptyState
        title="No downloads yet"
        description="Your purchased digital content will appear here"
        action={{
          label: 'Browse Store',
          onPress: () => {
            Linking.openURL('https://macrofriendlyfood.com/store');
          },
        }}
      />
    );
  };

  return (
    <PageContainer safeArea={false}>
      <Header title="Downloads" showBack={true} />

      <View style={styles.container}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Input
            placeholder="Search downloads..."
            value={searchQuery}
            onChangeText={handleSearch}
            leftIcon="search"
            rightIcon={searchQuery ? 'x' : undefined}
            onRightIconPress={() => {
              setSearchQuery('');
              refreshDownloads();
            }}
            containerStyle={styles.searchInput}
          />
        </View>

        {/* Downloads List */}
        <FlatList
          data={filteredDownloads}
          renderItem={renderDownloadCard}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderEmptyState}
        />
      </View>

      {loading && !refreshing && (
        <LoadingOverlay message="Loading downloads..." />
      )}
    </PageContainer>
  );
};

// Keep all the existing styles exactly as they were
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  searchContainer: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  searchInput: {
    marginBottom: 0,
  },
  listContent: {
    padding: spacing.sm,
    flexGrow: 1,
  },
  downloadCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
    ...shadows.sm,
  },
  downloadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  downloadType: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  downloadInfo: {
    flex: 1,
  },
  downloadName: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: fontWeights.semibold,
    marginBottom: spacing.xs,
  },
  downloadDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  downloadActions: {
    alignItems: 'center',
  },
  downloadButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default DownloadsScreen;
