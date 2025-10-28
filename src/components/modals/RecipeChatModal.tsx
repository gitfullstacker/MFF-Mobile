import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { BottomSheet } from './BottomSheet';
import { useRecipeChat } from '../../hooks/useRecipeChat';
import { ChatMessage } from '../../types/recipeChat';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  fontWeights,
} from '@/theme';

interface RecipeChatModalProps {
  isVisible: boolean;
  recipeId: string;
  recipeName: string;
  onClose: () => void;
}

export const RecipeChatModal: React.FC<RecipeChatModalProps> = ({
  isVisible,
  recipeId,
  recipeName,
  onClose,
}) => {
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const {
    messages,
    isLoading,
    error,
    suggestedQuestions,
    askQuestion,
    loadChatHistory,
  } = useRecipeChat(recipeId);

  // Load chat history when modal opens
  useEffect(() => {
    if (isVisible && recipeId) {
      loadChatHistory();
    }
  }, [isVisible, recipeId, loadChatHistory]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const question = inputText.trim();
    setInputText('');

    try {
      await askQuestion(question);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputText(question);
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === 'user';
    const timestamp = new Date(message.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.assistantMessage,
        ]}>
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.assistantBubble,
          ]}>
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userText : styles.assistantText,
            ]}>
            {message.content}
          </Text>
          <Text
            style={[
              styles.timestamp,
              isUser ? styles.userTimestamp : styles.assistantTimestamp,
            ]}>
            {timestamp}
          </Text>
        </View>
      </View>
    );
  };

  const renderSuggestedQuestions = () => {
    if (suggestedQuestions.length === 0) return null;

    return (
      <View style={styles.suggestedContainer}>
        <Text style={styles.suggestedTitle}>Suggested questions:</Text>
        <View style={styles.suggestedGrid}>
          {suggestedQuestions.map((question, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestedButton}
              onPress={() => handleSuggestedQuestion(question)}>
              <Text style={styles.suggestedText}>{question}</Text>
              <Icon
                name="corner-down-left"
                size={14}
                color={colors.gray[500]}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon name="message-circle" size={32} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>Ask about this recipe</Text>
      <Text style={styles.emptyDescription}>
        Get cooking tips, substitutions, nutritional info, and more about{' '}
        <Text style={styles.emptyRecipeName}>{recipeName}</Text>
      </Text>
    </View>
  );

  return (
    <BottomSheet visible={isVisible} onClose={onClose} height="90%">
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerIconContainer}>
              <Icon name="message-circle" size={20} color={colors.primary} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Recipe Assistant</Text>
              <Text style={styles.headerSubtitle}>{recipeName}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={onClose} style={styles.actionButton}>
              <Icon name="x" size={20} color={colors.gray[600]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}>
          {messages.length === 0 ? renderEmptyState() : null}
          {messages.map(renderMessage)}
          {renderSuggestedQuestions()}

          {isLoading && (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingBubble}>
                <View style={styles.typingIndicator}>
                  <View style={[styles.typingDot, styles.typingDot1]} />
                  <View style={[styles.typingDot, styles.typingDot2]} />
                  <View style={[styles.typingDot, styles.typingDot3]} />
                </View>
                <Text style={styles.loadingText}>Assistant is thinking...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask a question about this recipe..."
              placeholderTextColor={colors.gray[400]}
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Icon name="send" size={18} color={colors.white} />
              )}
            </TouchableOpacity>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Icon
                name="alert-circle"
                size={14}
                color={colors.semantic.error}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    ...typography.h6,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  messageContainer: {
    marginBottom: spacing.md,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  assistantMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: borderRadius.sm,
  },
  assistantBubble: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderBottomLeftRadius: borderRadius.sm,
  },
  messageText: {
    ...typography.bodyRegular,
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.md,
  },
  userText: {
    color: colors.white,
  },
  assistantText: {
    color: colors.text.primary,
  },
  timestamp: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  userTimestamp: {
    color: colors.white,
    opacity: 0.8,
    textAlign: 'right',
  },
  assistantTimestamp: {
    color: colors.text.light,
  },
  suggestedContainer: {
    marginTop: spacing.lg,
  },
  suggestedTitle: {
    ...typography.bodySmall,
    fontWeight: fontWeights.semibold,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  suggestedGrid: {
    gap: spacing.xs,
  },
  suggestedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  suggestedText: {
    ...typography.bodySmall,
    color: colors.text.primary,
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
    paddingHorizontal: spacing.lg,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h4,
    fontWeight: fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyDescription: {
    ...typography.bodyRegular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.lineHeights.relaxed * typography.fontSizes.md,
  },
  emptyRecipeName: {
    fontWeight: fontWeights.medium,
    color: colors.primary,
  },
  loadingContainer: {
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  loadingBubble: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    borderBottomLeftRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.sm,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gray[400],
    marginHorizontal: 1,
  },
  typingDot1: {
    // Add animation here if needed
  },
  typingDot2: {
    // Add animation here if needed
  },
  typingDot3: {
    // Add animation here if needed
  },
  loadingText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  inputContainer: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.white,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.bodyRegular,
    color: colors.text.primary,
    maxHeight: 100,
    backgroundColor: colors.white,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    ...shadows.sm,
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray[300],
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.semantic.error + '10',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginTop: spacing.xs,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.semantic.error,
    marginLeft: spacing.xs,
    flex: 1,
  },
});
