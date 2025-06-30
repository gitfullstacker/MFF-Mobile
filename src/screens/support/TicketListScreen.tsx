import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { format, parseISO } from 'date-fns';
import { PageContainer } from '../../components/layout/PageContainer';
import { Header } from '../../components/navigation/Header';
import { Input } from '../../components/forms/Input';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LoadingOverlay } from '../../components/feedback/LoadingOverlay';
import { useTickets } from '../../hooks/useTickets';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
  shadows,
} from '../../theme';
import { Ticket } from '../../types/ticket';
import { useNavigationHelpers } from '@/hooks/useNavigation';

const TicketListScreen: React.FC = () => {
  const { navigateToCreateTicket, navigateToTicketDetail } =
    useNavigationHelpers();

  const { tickets, loading, fetchTickets, refreshTickets } = useTickets();

  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'bug' | 'feature'
  >('all');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadTickets(true);
  }, [selectedFilter]);

  useEffect(() => {
    filterTickets();
  }, [tickets, searchQuery]);

  const loadTickets = async (reset = false) => {
    if (loading && !reset) return;

    try {
      const currentPage = reset ? 0 : page;
      const response = await fetchTickets(
        currentPage,
        20,
        selectedFilter === 'all' ? undefined : selectedFilter,
        searchQuery.trim() || undefined,
      );

      if (reset) {
        setPage(1);
      } else {
        setPage(currentPage + 1);
      }

      setHasMore(response.hasMore);
    } catch (error) {
      console.error('Error loading tickets:', error);
      // Toast notification is handled by useTickets hook
    }
  };

  const filterTickets = () => {
    let filtered = tickets;

    if (searchQuery.trim()) {
      filtered = tickets.filter(
        ticket =>
          ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ticket.description.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    setFilteredTickets(filtered);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    refreshTickets(); // Clear current tickets
    await loadTickets(true);
    setRefreshing(false);
  }, [selectedFilter]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadTickets();
    }
  }, [loading, hasMore, page]);

  const getStatusColor = (commentsCount: number) => {
    // Simple status logic based on comments
    if (commentsCount === 0) return colors.semantic.warning; // New/Open
    return colors.semantic.success; // Has responses
  };

  const getStatusText = (commentsCount: number) => {
    if (commentsCount === 0) return 'Open';
    return 'Active';
  };

  const getTypeIcon = (type: 'bug' | 'feature') => {
    return type === 'bug' ? 'alert-circle' : 'star';
  };

  const getTypeColor = (type: 'bug' | 'feature') => {
    return type === 'bug' ? colors.semantic.error : colors.semantic.info;
  };

  const renderTicketItem = ({ item }: { item: Ticket }) => {
    const statusColor = getStatusColor(item.comments.length);
    const typeColor = getTypeColor(item.type);

    return (
      <TouchableOpacity
        style={styles.ticketItem}
        onPress={() => navigateToTicketDetail(item._id)}
        activeOpacity={0.7}>
        {/* Ticket Header */}
        <View style={styles.ticketHeader}>
          <View style={styles.ticketType}>
            <Icon
              name={getTypeIcon(item.type)}
              size={16}
              color={typeColor}
              style={styles.typeIcon}
            />
            <Text style={[styles.typeText, { color: typeColor }]}>
              {item.type.toUpperCase()}
            </Text>
          </View>

          <View style={styles.ticketStatus}>
            <View
              style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={[styles.statusText, { color: colors.white }]}>
                {getStatusText(item.comments.length)}
              </Text>
            </View>
            {item.comments.length === 0 && <View style={styles.unreadBadge} />}
          </View>
        </View>

        {/* Ticket Content */}
        <View style={styles.ticketContent}>
          <Text style={styles.ticketTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.ticketDescription} numberOfLines={3}>
            {item.description}
          </Text>
        </View>

        {/* Ticket Footer */}
        <View style={styles.ticketFooter}>
          <View style={styles.ticketMeta}>
            <Icon name="calendar" size={14} color={colors.text.secondary} />
            <Text style={styles.metaText}>
              {format(parseISO(item.created_at), 'MMM d, yyyy')}
            </Text>
          </View>

          <View style={styles.ticketMeta}>
            <Icon
              name="message-circle"
              size={14}
              color={colors.text.secondary}
            />
            <Text style={styles.metaText}>
              {item.comments.length}{' '}
              {item.comments.length === 1 ? 'reply' : 'replies'}
            </Text>
          </View>

          {item.attachments.length > 0 && (
            <View style={styles.ticketMeta}>
              <Icon name="paperclip" size={14} color={colors.text.secondary} />
              <Text style={styles.metaText}>{item.attachments.length}</Text>
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
          title="No tickets found"
          description={`No tickets match "${searchQuery}"`}
          action={{
            label: 'Clear Search',
            onPress: () => setSearchQuery(''),
          }}
        />
      );
    }

    return (
      <EmptyState
        title="No support tickets"
        description="You haven't created any support tickets yet"
        action={{
          label: 'Create Ticket',
          onPress: navigateToCreateTicket,
        }}
      />
    );
  };

  const renderFooter = () => {
    if (!loading || refreshing) return null;
    return (
      <View style={styles.footerLoader}>
        <Text style={styles.loadingText}>Loading more tickets...</Text>
      </View>
    );
  };

  return (
    <PageContainer safeArea={false}>
      <Header
        title="Support Tickets"
        showBack={true}
        rightAction={{
          icon: 'plus',
          onPress: navigateToCreateTicket,
        }}
      />

      <View style={styles.container}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon="search"
            rightIcon={searchQuery ? 'x' : undefined}
            onRightIconPress={() => setSearchQuery('')}
          />
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {(['all', 'bug', 'feature'] as const).map(filter => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                selectedFilter === filter && styles.activeFilterTab,
              ]}
              onPress={() => setSelectedFilter(filter)}>
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === filter && styles.activeFilterText,
                ]}>
                {filter === 'all'
                  ? 'All'
                  : filter === 'bug'
                  ? 'Bugs'
                  : 'Features'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tickets List */}
        <FlatList
          data={filteredTickets}
          renderItem={renderTicketItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContainer}
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
          ListFooterComponent={renderFooter}
        />
      </View>

      {loading && !refreshing && (
        <LoadingOverlay message="Loading tickets..." />
      )}
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },

  // Search
  searchContainer: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
  },

  // Filter Tabs
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.light,
  },
  activeFilterTab: {
    backgroundColor: colors.primary,
  },
  filterText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: fontWeights.medium,
  },
  activeFilterText: {
    color: colors.white,
  },

  // List
  listContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.sm,
  },

  // Ticket Item
  ticketItem: {
    backgroundColor: colors.white,
    marginVertical: spacing.xs,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.dark,
    ...shadows.sm,
  },

  // Ticket Header
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  ticketType: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    marginRight: spacing.xs,
  },
  typeText: {
    ...typography.bodySmall,
    fontWeight: fontWeights.bold,
    letterSpacing: 0.5,
  },
  ticketStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginRight: spacing.xs,
  },
  statusText: {
    ...typography.bodySmall,
    fontWeight: fontWeights.medium,
  },
  unreadBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },

  // Ticket Content
  ticketContent: {
    marginBottom: spacing.md,
  },
  ticketTitle: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: fontWeights.semibold,
    marginBottom: spacing.xs,
  },
  ticketDescription: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    lineHeight: 20,
  },

  // Ticket Footer
  ticketFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  ticketMeta: {
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

  // Footer
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
});

export default TicketListScreen;
