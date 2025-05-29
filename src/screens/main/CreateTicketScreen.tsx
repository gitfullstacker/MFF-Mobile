import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import DocumentPicker from '@react-native-documents/picker';
import Icon from 'react-native-vector-icons/Feather';
import { PageContainer } from '../../components/layout/PageContainer';
import { Header } from '../../components/navigation/Header';
import { Section } from '../../components/layout/Section';
import { Input } from '../../components/forms/Input';
import { Button } from '../../components/forms/Button';
import { LoadingOverlay } from '../../components/feedback/LoadingOverlay';
import { ticketService } from '../../services/ticket';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
} from '../../theme';
import { CreateTicketRequest } from '../../types/ticket';

// Form validation schema
const ticketSchema = yup.object({
  title: yup
    .string()
    .required('Title is required')
    .min(5, 'Title must be at least 5 characters'),
  description: yup
    .string()
    .required('Description is required')
    .min(20, 'Description must be at least 20 characters'),
  type: yup.string().oneOf(['bug', 'feature']).required('Type is required'),
});

type TicketFormData = {
  title: string;
  description: string;
  type: 'bug' | 'feature';
};

interface AttachedFile {
  uri: string;
  name: string;
  type: string;
  size: number;
}

const CreateTicketScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<TicketFormData>({
    resolver: yupResolver(ticketSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'bug',
    },
  });

  const selectedType = watch('type');

  const onSubmit = async (data: TicketFormData) => {
    try {
      setLoading(true);

      // Create the ticket
      const ticket = await ticketService.createTicket(data);

      // Upload attachments if any
      if (attachedFiles.length > 0) {
        for (const file of attachedFiles) {
          try {
            await ticketService.addAttachment(ticket._id, file);
          } catch (error) {
            console.error('Error uploading attachment:', error);
            // Continue with other files even if one fails
          }
        }
      }

      Alert.alert(
        'Ticket Created',
        "Your support ticket has been created successfully. We'll get back to you soon!",
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      console.error('Error creating ticket:', error);
      Alert.alert('Error', 'Failed to create ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAttachFile = async () => {
    try {
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: true,
      });

      const newFiles = results.map(result => ({
        uri: result.uri,
        name: result.name || 'Unknown',
        type: result.type || 'application/octet-stream',
        size: result.size || 0,
      }));

      setAttachedFiles(prev => [...prev, ...newFiles]);
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        Alert.alert('Error', 'Failed to attach file. Please try again.');
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderTypeSelector = () => (
    <View style={styles.typeSelectorContainer}>
      <Text style={styles.typeSelectorLabel}>
        What type of request is this?
      </Text>

      <TouchableOpacity
        style={[
          styles.typeOption,
          selectedType === 'bug' && styles.typeOptionSelected,
        ]}
        onPress={() => setValue('type', 'bug')}>
        <View style={styles.typeIconContainer}>
          <Icon
            name="alert-circle"
            size={24}
            color={
              selectedType === 'bug' ? colors.white : colors.semantic.error
            }
          />
        </View>
        <View style={styles.typeContent}>
          <Text
            style={[
              styles.typeTitle,
              selectedType === 'bug' && styles.typeTitleSelected,
            ]}>
            Bug Report
          </Text>
          <Text
            style={[
              styles.typeDescription,
              selectedType === 'bug' && styles.typeDescriptionSelected,
            ]}>
            Report a problem or issue with the app
          </Text>
        </View>
        {selectedType === 'bug' && (
          <Icon name="check" size={20} color={colors.white} />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.typeOption,
          selectedType === 'feature' && styles.typeOptionSelected,
        ]}
        onPress={() => setValue('type', 'feature')}>
        <View style={styles.typeIconContainer}>
          <Icon
            name="star"
            size={24}
            color={
              selectedType === 'feature' ? colors.white : colors.semantic.info
            }
          />
        </View>
        <View style={styles.typeContent}>
          <Text
            style={[
              styles.typeTitle,
              selectedType === 'feature' && styles.typeTitleSelected,
            ]}>
            Feature Request
          </Text>
          <Text
            style={[
              styles.typeDescription,
              selectedType === 'feature' && styles.typeDescriptionSelected,
            ]}>
            Suggest a new feature or improvement
          </Text>
        </View>
        {selectedType === 'feature' && (
          <Icon name="check" size={20} color={colors.white} />
        )}
      </TouchableOpacity>
    </View>
  );

  const renderAttachments = () => {
    if (attachedFiles.length === 0) return null;

    return (
      <View style={styles.attachmentsContainer}>
        <Text style={styles.attachmentsTitle}>Attached Files</Text>
        {attachedFiles.map((file, index) => (
          <View key={index} style={styles.attachmentItem}>
            <View style={styles.attachmentInfo}>
              <Icon name="paperclip" size={16} color={colors.text.secondary} />
              <View style={styles.attachmentDetails}>
                <Text style={styles.attachmentName} numberOfLines={1}>
                  {file.name}
                </Text>
                <Text style={styles.attachmentSize}>
                  {formatFileSize(file.size)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => handleRemoveFile(index)}
              style={styles.removeButton}>
              <Icon name="x" size={16} color={colors.semantic.error} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  return (
    <PageContainer safeArea={false}>
      <Header title="Create Support Ticket" showBack={true} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Type Selection */}
        <Section title="Request Type">
          {renderTypeSelector()}
          {errors.type && (
            <Text style={styles.errorText}>{errors.type.message}</Text>
          )}
        </Section>

        {/* Title */}
        <Section title="Title">
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder={
                  selectedType === 'bug'
                    ? 'Brief description of the bug...'
                    : 'Brief description of the feature...'
                }
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.title?.message}
                maxLength={100}
              />
            )}
          />
        </Section>

        {/* Description */}
        <Section title="Description">
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder={
                  selectedType === 'bug'
                    ? 'Please describe the bug in detail. Include steps to reproduce, expected behavior, and actual behavior...'
                    : "Please describe the feature you'd like to see. Include details about how it should work and why it would be useful..."
                }
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.description?.message}
                multiline
                numberOfLines={6}
                style={styles.descriptionInput}
              />
            )}
          />
        </Section>

        {/* Attachments */}
        <Section title="Attachments (Optional)">
          <TouchableOpacity
            style={styles.attachButton}
            onPress={handleAttachFile}>
            <Icon name="paperclip" size={20} color={colors.primary} />
            <Text style={styles.attachButtonText}>Attach Files</Text>
          </TouchableOpacity>
          <Text style={styles.attachHint}>
            You can attach screenshots, logs, or other relevant files
          </Text>
          {renderAttachments()}
        </Section>

        {/* Tips */}
        <Section title="Tips for Better Support">
          <View style={styles.tipsContainer}>
            {selectedType === 'bug' ? (
              <>
                <View style={styles.tipItem}>
                  <Icon
                    name="smartphone"
                    size={16}
                    color={colors.semantic.info}
                  />
                  <Text style={styles.tipText}>
                    Include your device model and app version
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Icon name="list" size={16} color={colors.semantic.info} />
                  <Text style={styles.tipText}>
                    Provide step-by-step reproduction instructions
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Icon name="image" size={16} color={colors.semantic.info} />
                  <Text style={styles.tipText}>
                    Attach screenshots or screen recordings if possible
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.tipItem}>
                  <Icon name="target" size={16} color={colors.semantic.info} />
                  <Text style={styles.tipText}>
                    Explain the problem this feature would solve
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Icon name="users" size={16} color={colors.semantic.info} />
                  <Text style={styles.tipText}>
                    Describe how other users might benefit
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Icon
                    name="lightbulb"
                    size={16}
                    color={colors.semantic.info}
                  />
                  <Text style={styles.tipText}>
                    Suggest how the feature might work
                  </Text>
                </View>
              </>
            )}
          </View>
        </Section>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <Button
            title="Submit Ticket"
            onPress={handleSubmit(onSubmit)}
            variant="primary"
            fullWidth
            loading={loading}
            disabled={loading}
            icon={<Icon name="send" size={18} color={colors.white} />}
          />
        </View>
      </ScrollView>

      <LoadingOverlay visible={loading} message="Creating ticket..." />
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Type Selector
  typeSelectorContainer: {
    marginBottom: spacing.md,
  },
  typeSelectorLabel: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: fontWeights.medium,
    marginBottom: spacing.md,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border.default,
  },
  typeOptionSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  typeContent: {
    flex: 1,
  },
  typeTitle: {
    ...typography.bodyLarge,
    color: colors.text.primary,
    fontWeight: fontWeights.semibold,
    marginBottom: spacing.xs,
  },
  typeTitleSelected: {
    color: colors.white,
  },
  typeDescription: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  typeDescriptionSelected: {
    color: colors.white,
    opacity: 0.9,
  },

  // Description Input
  descriptionInput: {
    minHeight: 120,
  },

  // Attachments
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary + '10',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    borderStyle: 'dashed',
    marginBottom: spacing.sm,
  },
  attachButtonText: {
    ...typography.bodyRegular,
    color: colors.primary,
    fontWeight: fontWeights.medium,
    marginLeft: spacing.sm,
  },
  attachHint: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  attachmentsContainer: {
    marginTop: spacing.md,
  },
  attachmentsTitle: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    fontWeight: fontWeights.medium,
    marginBottom: spacing.sm,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  attachmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  attachmentDetails: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  attachmentName: {
    ...typography.bodyRegular,
    color: colors.text.primary,
  },
  attachmentSize: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  removeButton: {
    padding: spacing.xs,
  },

  // Tips
  tipsContainer: {
    backgroundColor: colors.semantic.info + '10',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  tipText: {
    ...typography.bodySmall,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    flex: 1,
  },

  // Submit
  submitContainer: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },

  // Error
  errorText: {
    ...typography.bodySmall,
    color: colors.semantic.error,
    marginTop: spacing.xs,
  },
});

export default CreateTicketScreen;
