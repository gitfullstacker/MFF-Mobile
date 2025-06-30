import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { format, parseISO } from 'date-fns';
import { PageContainer } from '../../components/layout/PageContainer';
import { Header } from '../../components/navigation/Header';
import { Section } from '../../components/layout/Section';
import { Input } from '../../components/forms/Input';
import { Button } from '../../components/forms/Button';
import { LoadingOverlay } from '../../components/feedback/LoadingOverlay';
import { EmptyState } from '../../components/feedback/EmptyState';
import { useTickets } from '../../hooks/useTickets';
import { useCurrentRoute, useSafeNavigation } from '@/hooks/useNavigation';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
  shadows,
} from '../../theme';
import { TicketComment, Attachment } from '../../types/ticket';
import { AccountRouteProp } from '@/types';

const TicketDetailScreen: React.FC = () => {
  const { params } = useCurrentRoute();
  const { safeGoBack } = useSafeNavigation();
  const { selectedTicket, loading, fetchTicket, addComment, addAttachment } =
    useTickets();

  const routeParams = params as AccountRouteProp<'TicketDetail'>['params'];
  const ticketId = routeParams?.ticketId;

  const [refreshing, setRefreshing] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [addingComment, setAddingComment] = useState(false);

  useEffect(() => {
    if (ticketId) {
      loadTicket();
    }
  }, [ticketId]);

  const loadTicket = async () => {
    try {
      await fetchTicket(ticketId);
    } catch (error) {
      console.error('Error loading ticket:', error);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTicket();
    setRefreshing(false);
  }, [ticketId]);

  const handleAddComment = async () => {
    if (!commentText.trim() || !selectedTicket) return;

    try {
      setAddingComment(true);
      await addComment(selectedTicket._id, commentText.trim());
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setAddingComment(false);
    }
  };

  const handleDownloadAttachment = (attachment: Attachment) => {
    Linking.openURL(attachment.url).catch(() => {
      Alert.alert('Error', 'Unable to open attachment');
    });
  };

  const getStatusColor = (commentsCount: number) => {
    if (commentsCount === 0) return colors.semantic.warning;
    return colors.semantic.success;
  };

  const getStatusText = (commentsCount: number) => {
    if (commentsCount === 0) return 'Open';
    return 'Active';
  };

  const getTypeIcon = (type: string) => {
    return type === 'bug' ? 'alert-circle' : 'star';
  };

  const getTypeColor = (type: string) => {
    return type === 'bug' ? colors.semantic.error : colors.semantic.info;
  };

  const renderTicketHeader = () => {
    if (!selectedTicket) return null;

    const statusColor = getStatusColor(selectedTicket.comments.length);
    const typeColor = getTypeColor(selectedTicket.type);

    return (
      <Section style={styles.headerSection}>
        <View style={styles.ticketHeader}>
          <View style={styles.ticketMeta}>
            <View style={styles.ticketType}>
              <Icon
                name={getTypeIcon(selectedTicket.type)}
                size={18}
                color={typeColor}
                style={styles.typeIcon}
              />
              <Text style={[styles.typeText, { color: typeColor }]}>
                {selectedTicket.type.toUpperCase()}
              </Text>
            </View>

            <View style={styles.ticketStatus}>
              <View
                style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <Text style={[styles.statusText, { color: colors.white }]}>
                  {getStatusText(selectedTicket.comments.length)}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.ticketTitle}>{selectedTicket.title}</Text>

          <View style={styles.ticketInfo}>
            <View style={styles.infoItem}>
              <Icon name="calendar" size={16} color={colors.text.secondary} />
              <Text style={styles.infoText}>
                Created{' '}
                {format(parseISO(selectedTicket.created_at), 'MMM d, yyyy')}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Icon name="clock" size={16} color={colors.text.secondary} />
              <Text style={styles.infoText}>
                Updated{' '}
                {format(parseISO(selectedTicket.updated_at), 'MMM d, yyyy')}
              </Text>
            </View>
          </View>
        </View>
      </Section>
    );
  };

  const renderDescription = () => {
    if (!selectedTicket) return null;

    return (
      <Section title="Description" style={styles.section}>
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionText}>
            {selectedTicket.description}
          </Text>
        </View>
      </Section>
    );
  };

  const renderAttachments = () => {
    if (!selectedTicket?.attachments.length) return null;

    return (
      <Section title="Attachments" style={styles.section}>
        <View style={styles.attachmentsContainer}>
          {selectedTicket.attachments.map((attachment, index) => (
            <TouchableOpacity
              key={index} // Using index since backend doesn't have id
              style={styles.attachmentItem}
              onPress={() => handleDownloadAttachment(attachment)}
              activeOpacity={0.7}>
              <View style={styles.attachmentInfo}>
                <Icon name="file" size={20} color={colors.primary} />
                <View style={styles.attachmentDetails}>
                  <Text style={styles.attachmentName} numberOfLines={1}>
                    {attachment.name || 'Attachment'}
                  </Text>
                  <Text style={styles.attachmentDate}>
                    {attachment.created_at
                      ? format(parseISO(attachment.created_at), 'MMM d, yyyy')
                      : 'No date'}
                  </Text>
                </View>
              </View>
              <Icon name="download" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          ))}
        </View>
      </Section>
    );
  };

  const renderCommentItem = (comment: TicketComment, index: number) => {
    return (
      <View
        key={index} // Using index since backend doesn't have id
        style={[
          styles.commentItem,
          comment.is_support && styles.supportComment,
        ]}>
        <View style={styles.commentHeader}>
          <View style={styles.commentAuthor}>
            <View
              style={[
                styles.authorAvatar,
                {
                  backgroundColor: comment.is_support
                    ? colors.primary
                    : colors.gray[300],
                },
              ]}>
              <Icon
                name={comment.is_support ? 'headphones' : 'user'}
                size={16}
                color={colors.white}
              />
            </View>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>
                {comment.is_support ? 'Support Team' : 'You'}
              </Text>
              <Text style={styles.commentDate}>
                {comment.created_at
                  ? format(parseISO(comment.created_at), 'MMM d, yyyy • h:mm a')
                  : 'No date'}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.commentContent}>{comment.text}</Text>
      </View>
    );
  };

  const renderComments = () => {
    if (!selectedTicket) return null;

    return (
      <Section
        title={`Comments (${selectedTicket.comments.length})`}
        style={styles.section}>
        {selectedTicket.comments.length === 0 ? (
          <View style={styles.noCommentsContainer}>
            <Icon name="message-circle" size={48} color={colors.gray[300]} />
            <Text style={styles.noCommentsText}>No comments yet</Text>
            <Text style={styles.noCommentsSubtext}>
              Add a comment to start the conversation
            </Text>
          </View>
        ) : (
          <View style={styles.commentsContainer}>
            {selectedTicket.comments.map((comment, index) =>
              renderCommentItem(comment, index),
            )}
          </View>
        )}
      </Section>
    );
  };

  const renderAddComment = () => {
    return (
      <Section title="Add Comment" style={styles.addCommentSection}>
        <View style={styles.addCommentContainer}>
          <Input
            placeholder="Type your comment here..."
            value={commentText}
            onChangeText={setCommentText}
            multiline
            numberOfLines={4}
            style={styles.commentInput}
          />
          <Button
            title="Add Comment"
            onPress={handleAddComment}
            disabled={!commentText.trim() || addingComment}
            loading={addingComment}
            style={styles.addCommentButton}
          />
        </View>
      </Section>
    );
  };

  if (loading && !selectedTicket) {
    return (
      <PageContainer safeArea={false}>
        <Header title="Ticket Details" showBack={true} />
        <LoadingOverlay message="Loading ticket details..." />
      </PageContainer>
    );
  }

  if (!selectedTicket) {
    return (
      <PageContainer safeArea={false}>
        <Header title="Ticket Details" showBack={true} />
        <View style={styles.container}>
          <EmptyState
            title="Ticket Not Found"
            description="The ticket you're looking for doesn't exist or has been removed."
            action={{
              label: 'Go Back',
              onPress: safeGoBack,
            }}
          />
        </View>
      </PageContainer>
    );
  }

  return (
    <PageContainer safeArea={false}>
      <Header title="Ticket Details" showBack={true} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }>
        {renderTicketHeader()}
        {renderDescription()}
        {renderAttachments()}
        {renderComments()}
        {renderAddComment()}
      </ScrollView>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },

  // Header
  headerSection: {
    marginBottom: 0,
  },
  ticketHeader: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  ticketMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
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
  },
  statusText: {
    ...typography.bodySmall,
    fontWeight: fontWeights.medium,
  },
  ticketTitle: {
    ...typography.h3,
    color: colors.text.primary,
    fontWeight: fontWeights.bold,
    marginBottom: spacing.md,
    lineHeight: 28,
  },
  ticketInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },

  // Section
  section: {
    marginBottom: spacing.lg,
  },

  // Description
  descriptionContainer: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  descriptionText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    lineHeight: 24,
  },

  // Attachments
  attachmentsContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  attachmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  attachmentDetails: {
    marginLeft: spacing.md,
    flex: 1,
  },
  attachmentName: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: fontWeights.medium,
  },
  attachmentDate: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },

  // Comments
  commentsContainer: {
    gap: spacing.md,
  },
  commentItem: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  supportComment: {
    backgroundColor: colors.primary + '05',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  commentHeader: {
    marginBottom: spacing.md,
  },
  commentAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorInfo: {
    marginLeft: spacing.sm,
  },
  authorName: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: fontWeights.semibold,
  },
  commentDate: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  commentContent: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    lineHeight: 22,
  },

  // No Comments
  noCommentsContainer: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  noCommentsText: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: fontWeights.medium,
    marginTop: spacing.md,
  },
  noCommentsSubtext: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  // Add Comment
  addCommentSection: {
    marginBottom: 0,
  },
  addCommentContainer: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  commentInput: {
    marginBottom: spacing.md,
  },
  addCommentButton: {
    marginTop: spacing.sm,
  },
});

export default TicketDetailScreen;
