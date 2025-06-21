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
import { format, parseISO } from 'date-fns';
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

interface Download {
  id: string;
  name: string;
  type: 'pdf' | 'video' | 'audio' | 'document' | 'recipe-pack';
  size: string;
  downloadUrl: string;
  purchaseDate: string;
  expiryDate?: string;
  description?: string;
  thumbnail?: string;
}

const DownloadsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [downloads, setDownloads] = useState<Download[]>([]);
  const [filteredDownloads, setFilteredDownloads] = useState<Download[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with actual API call
  const mockDownloads: Download[] = [
    {
      id: '1',
      name: 'Keto Recipe Collection',
      type: 'recipe-pack',
      size: '25 MB',
      downloadUrl: 'https://example.com/downloads/keto-recipes.zip',
      purchaseDate: '2024-12-01T10:00:00Z',
      description: '50 delicious keto-friendly recipes',
    },
    {
      id: '2',
      name: 'Meal Prep Masterclass',
      type: 'video',
      size: '150 MB',
      downloadUrl: 'https://example.com/downloads/meal-prep-video.mp4',
      purchaseDate: '2024-11-15T14:30:00Z',
      expiryDate: '2025-11-15T14:30:00Z',
      description: '2-hour comprehensive meal prep training',
    },
    {
      id: '3',
      name: 'Macro Tracking Guide',
      type: 'pdf',
      size: '5 MB',
      downloadUrl: 'https://example.com/downloads/macro-guide.pdf',
      purchaseDate: '2024-10-20T09:15:00Z',
      description: 'Complete guide to tracking macronutrients',
    },
    {
      id: '4',
      name: 'Nutrition Podcast Series',
      type: 'audio',
      size: '80 MB',
      downloadUrl: 'https://example.com/downloads/nutrition-podcast.zip',
      purchaseDate: '2024-09-10T16:45:00Z',
      description: '10 episodes on nutrition science',
    },
  ];

  useEffect(() => {
    loadDownloads();
  }, []);

  useEffect(() => {
    filterDownloads();
  }, [downloads, searchQuery]);

  const loadDownloads = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDownloads(mockDownloads);
    } catch (error) {
      console.error('Error loading downloads:', error);
      Alert.alert('Error', 'Failed to load downloads. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterDownloads = () => {
    let filtered = downloads;

    if (searchQuery.trim()) {
      filtered = downloads.filter(
        download =>
          download.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          download.description
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredDownloads(filtered);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDownloads();
    setRefreshing(false);
  }, []);

  const handleDownload = async (download: Download) => {
    try {
      // Check if expired
      if (download.expiryDate) {
        const expiryDate = new Date(download.expiryDate);
        if (expiryDate < new Date()) {
          Alert.alert(
            'Download Expired',
            'This download has expired. Please contact support if you need access.',
          );
          return;
        }
      }

      Alert.alert('Download', `Download "${download.name}"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          onPress: () => {
            // Open download URL
            Linking.openURL(download.downloadUrl).catch(() => {
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

  const getTypeIcon = (type: Download['type']) => {
    switch (type) {
      case 'pdf':
        return 'file-text';
      case 'video':
        return 'video';
      case 'audio':
        return 'headphones';
      case 'recipe-pack':
        return 'book';
      case 'document':
        return 'file';
      default:
        return 'download';
    }
  };

  const getTypeColor = (type: Download['type']) => {
    switch (type) {
      case 'pdf':
        return colors.semantic.error;
      case 'video':
        return colors.semantic.info;
      case 'audio':
        return colors.semantic.warning;
      case 'recipe-pack':
        return colors.primary;
      case 'document':
        return colors.text.secondary;
      default:
        return colors.text.secondary;
    }
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const renderDownloadCard = ({ item }: { item: Download }) => {
    const expired = isExpired(item.expiryDate);

    return (
      <TouchableOpacity
        style={[styles.downloadCard, expired && styles.downloadCardExpired]}
        onPress={() => handleDownload(item)}
        activeOpacity={0.7}
        disabled={expired}>
        {/* Header */}
        <View style={styles.downloadHeader}>
          <View style={styles.downloadType}>
            <View
              style={[
                styles.typeIcon,
                { backgroundColor: getTypeColor(item.type) + '20' },
              ]}>
              <Icon
                name={getTypeIcon(item.type)}
                size={20}
                color={getTypeColor(item.type)}
              />
            </View>
            <View style={styles.downloadInfo}>
              <Text
                style={[styles.downloadName, expired && styles.expiredText]}
                numberOfLines={2}>
                {item.name}
              </Text>
              {item.description && (
                <Text
                  style={[
                    styles.downloadDescription,
                    expired && styles.expiredText,
                  ]}
                  numberOfLines={2}>
                  {item.description}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.downloadActions}>
            {expired ? (
              <View style={styles.expiredBadge}>
                <Text style={styles.expiredBadgeText}>Expired</Text>
              </View>
            ) : (
              <View style={styles.downloadButton}>
                <Icon name="download" size={20} color={colors.primary} />
              </View>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.downloadFooter}>
          <View style={styles.downloadMeta}>
            <Icon name="calendar" size={14} color={colors.text.secondary} />
            <Text style={styles.metaText}>
              {format(parseISO(item.purchaseDate), 'MMM d, yyyy')}
            </Text>
          </View>

          <View style={styles.downloadMeta}>
            <Icon name="hard-drive" size={14} color={colors.text.secondary} />
            <Text style={styles.metaText}>{item.size}</Text>
          </View>

          {item.expiryDate && !expired && (
            <View style={styles.downloadMeta}>
              <Icon name="clock" size={14} color={colors.semantic.warning} />
              <Text
                style={[styles.metaText, { color: colors.semantic.warning }]}>
                Expires {format(parseISO(item.expiryDate), 'MMM d, yyyy')}
              </Text>
            </View>
          )}
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
            onPress: () => setSearchQuery(''),
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
            // Navigate to store or website
            Linking.openURL('https://macrofriendlyfood.com/store');
          },
        }}
      />
    );
  };

  // Statistics
  const totalDownloads = downloads.length;
  const expiredDownloads = downloads.filter(d =>
    isExpired(d.expiryDate),
  ).length;
  const totalSize = downloads.reduce((acc, download) => {
    const sizeNum = parseFloat(download.size);
    return acc + sizeNum;
  }, 0);

  return (
    <PageContainer safeArea={false}>
      <Header title="Downloads" showBack={true} />

      <View style={styles.container}>
        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalDownloads}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {totalDownloads - expiredDownloads}
            </Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{totalSize.toFixed(0)} MB</Text>
            <Text style={styles.statLabel}>Total Size</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Input
            placeholder="Search downloads..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon="search"
            rightIcon={searchQuery ? 'x' : undefined}
            onRightIconPress={() => setSearchQuery('')}
            containerStyle={styles.searchInput}
          />
        </View>

        {/* Downloads List */}
        <FlatList
          data={filteredDownloads}
          renderItem={renderDownloadCard}
          keyExtractor={item => item.id}
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
          ListEmptyComponent={renderEmptyState}
        />
      </View>

      <LoadingOverlay
        visible={loading && !refreshing}
        message="Loading downloads..."
      />
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Statistics
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: spacing.sm,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h5,
    color: colors.text.primary,
    fontWeight: fontWeights.bold,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },

  // Search
  searchContainer: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  searchInput: {
    marginBottom: 0,
  },

  // List
  listContent: {
    padding: spacing.sm,
    flexGrow: 1,
  },

  // Download Cards
  downloadCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
    ...shadows.sm,
  },
  downloadCardExpired: {
    opacity: 0.6,
    backgroundColor: colors.gray[50],
  },

  // Download Header
  downloadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
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
  expiredBadge: {
    backgroundColor: colors.semantic.error + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  expiredBadgeText: {
    ...typography.bodySmall,
    color: colors.semantic.error,
    fontWeight: fontWeights.medium,
  },

  // Download Footer
  downloadFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  downloadMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
    marginBottom: spacing.xs,
  },
  metaText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },

  // Expired state
  expiredText: {
    color: colors.text.secondary,
  },
});

export default DownloadsScreen;
