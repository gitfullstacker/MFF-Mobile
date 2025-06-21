import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Feather';
import { format, parseISO } from 'date-fns';
import { PageContainer } from '../../components/layout/PageContainer';
import { Header } from '../../components/navigation/Header';
import { Input } from '../../components/forms/Input';
import { EmptyState } from '../../components/feedback/EmptyState';
import { LoadingOverlay } from '../../components/feedback/LoadingOverlay';
import { ticketService } from '../../services/ticket';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
  shadows,
} from '../../theme';
import { Ticket } from '../../types/ticket';
import { RootStackParamList } from '../../navigation/types';

type TicketsNavigationProp = CompositeNavigationProp<
  StackNavigationProp<RootStackParamList>,
  StackNavigationProp<any>
>;

const TicketListScreen: React.FC = () => {
  const navigation = useNavigation<TicketsNavigationProp>();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
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
      setLoading(true);
      const currentPage = reset ? 0 : page;
      const response = await ticketService.getTickets(
        currentPage,
        20,
        selectedFilter === 'all' ? undefined : selectedFilter,
      );

      if (reset) {
        setTickets(response.data);
        setPage(1);
      } else {
        setTickets(prev => [...prev, ...response.data]);
        setPage(currentPage + 1);
      }

      setHasMore(response.hasMore);
    } catch (error) {
      console.error('Error loading tickets:', error);
      Alert.alert('Error', 'Failed to load tickets. Please try again.');
    } finally {
      setLoading(false);
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
    await loadTickets(true);
    setRefreshing(false);
  }, [selectedFilter]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore) {
      loadTickets();
    }
  }, [loading, hasMore, page]);

  const handleTicketPress = (ticket: Ticket) => {
    navigation.navigate('TicketDetail' as any, {
      ticketId: ticket._id,
      ticket,
    });
  };

  const handleCreateTicket = () => {
    navigation.navigate('CreateTicket' as any);
  };

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

  const renderFilterTabs = () => (
    <View style={styles.filterTabs}>
      {[
        { key: 'all', label: 'All' },
        { key: 'bug', label: 'Bug Reports' },
        { key: 'feature', label: 'Feature Requests' },
      ].map(filter => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.filterTab,
            selectedFilter === filter.key && styles.filterTabActive,
          ]}
          onPress={() => setSelectedFilter(filter.key as any)}>
          <Text
            style={[
              styles.filterTabText,
              selectedFilter === filter.key && styles.filterTabTextActive,
            ]}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTicketCard = ({ item }: { item: Ticket }) => {
    const hasUnread = item.comments.length > 0; // Simplified - you'd track this properly
    const statusColor = getStatusColor(item.comments.length);
    const statusText = getStatusText(item.comments.length);

    return (
      <TouchableOpacity
        style={styles.ticketCard}
        onPress={() => handleTicketPress(item)}
        activeOpacity={0.7}>
        {/* Header */}
        <View style={styles.ticketHeader}>
          <View style={styles.ticketType}>
            <Icon
              name={getTypeIcon(item.type)}
              size={16}
              color={getTypeColor(item.type)}
            />
            <Text style={[styles.typeText, { color: getTypeColor(item.type) }]}>
              {item.type === 'bug' ? 'Bug' : 'Feature'}
            </Text>
          </View>

          <View style={styles.ticketStatus}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColor + '20' },
              ]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {statusText}
              </Text>
            </View>
            {hasUnread && <View style={styles.unreadBadge} />}
          </View>
        </View>

        {/* Content */}
        <View style={styles.ticketContent}>
          <Text style={styles.ticketTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.ticketDescription} numberOfLines={3}>
            {item.description}
          </Text>
        </View>

        {/* Footer */}
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
          onPress: handleCreateTicket,
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
          onPress: handleCreateTicket,
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
            containerStyle={styles.searchInput}
          />
        </View>

        {/* Filter Tabs */}
        {renderFilterTabs()}

        {/* Tickets List */}
        <FlatList
          data={filteredTickets}
          renderItem={renderTicketCard}
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
          onEndReachedThreshold={0.3}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={renderFooter}
        />
      </View>

      <LoadingOverlay
        visible={loading && !refreshing}
        message="Loading tickets..."
      />
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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

  // Filter Tabs
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.sm,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.xs,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: fontWeights.medium,
  },
  filterTabTextActive: {
    color: colors.white,
    fontWeight: fontWeights.semibold,
  },

  // List
  listContent: {
    padding: spacing.sm,
    flexGrow: 1,
  },

  // Ticket Cards
  ticketCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
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
  typeText: {
    ...typography.bodySmall,
    fontWeight: fontWeights.medium,
    marginLeft: spacing.xs,
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
