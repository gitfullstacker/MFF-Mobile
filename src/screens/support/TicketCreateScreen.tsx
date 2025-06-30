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
import { useTickets } from '../../hooks/useTickets';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
} from '../../theme';
import { CreateTicketRequest } from '../../types/ticket';
import { useNavigationHelpers } from '@/hooks/useNavigation';
import { useSafeNavigation } from '@/hooks/useNavigation';

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

const TicketCreateScreen: React.FC = () => {
  const { safeGoBack } = useSafeNavigation();
  const { navigateToTicketDetail } = useNavigationHelpers();
  const { createTicket, addAttachment, loading } = useTickets();

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
      // Create the ticket using useTickets hook
      const ticket = await createTicket(data);

      // Upload attachments if any
      if (attachedFiles.length > 0) {
        for (const file of attachedFiles) {
          try {
            await addAttachment(ticket._id, file);
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
            text: 'View Ticket',
            onPress: () => navigateToTicketDetail(ticket._id),
          },
          {
            text: 'Back to List',
            onPress: () => safeGoBack(),
            style: 'cancel',
          },
        ],
      );
    } catch (error) {
      console.error('Error creating ticket:', error);
      // Toast notification is handled by useTickets hook
    }
  };

  const handleAttachment = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        allowMultiSelection: false,
      });

      const file = result[0];
      if (file && file.name && file.type && file.size) {
        // Check file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (file.size > maxSize) {
          Alert.alert(
            'File Too Large',
            'Please select a file smaller than 10MB.',
          );
          return;
        }

        // Create AttachedFile object with proper typing
        const attachedFile: AttachedFile = {
          uri: file.uri,
          name: file.name,
          type: file.type,
          size: file.size,
        };

        setAttachedFiles(prev => [...prev, attachedFile]);
      }
    } catch (error: any) {
      // Check if user cancelled the picker
      if (error?.code !== 'DOCUMENT_PICKER_CANCELED') {
        Alert.alert('Error', 'Failed to select file. Please try again.');
      }
    }
  };

  const removeAttachment = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderTypeOption = (type: 'bug' | 'feature') => {
    const isSelected = selectedType === type;
    const iconName = type === 'bug' ? 'alert-circle' : 'star';
    const title = type === 'bug' ? 'Bug Report' : 'Feature Request';
    const description =
      type === 'bug'
        ? 'Report a problem or issue with the app'
        : 'Suggest a new feature or improvement';

    return (
      <TouchableOpacity
        key={type}
        style={[styles.typeOption, isSelected && styles.typeOptionSelected]}
        onPress={() => setValue('type', type)}
        activeOpacity={0.7}>
        <View
          style={[
            styles.typeIconContainer,
            isSelected && { backgroundColor: 'rgba(255,255,255,0.2)' },
          ]}>
          <Icon
            name={iconName}
            size={24}
            color={isSelected ? colors.white : colors.primary}
          />
        </View>
        <View style={styles.typeContent}>
          <Text
            style={[styles.typeTitle, isSelected && styles.typeTitleSelected]}>
            {title}
          </Text>
          <Text
            style={[
              styles.typeDescription,
              isSelected && styles.typeDescriptionSelected,
            ]}>
            {description}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <PageContainer safeArea={false}>
      <Header title="Create Support Ticket" showBack={true} />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Ticket Type Selection */}
        <Section title="Ticket Type" style={styles.section}>
          <View style={styles.typeContainer}>
            {renderTypeOption('bug')}
            {renderTypeOption('feature')}
          </View>
        </Section>

        {/* Title Input */}
        <Section title="Title" style={styles.section}>
          <Controller
            control={control}
            name="title"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Brief description of your issue or request"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.title?.message}
                maxLength={100}
              />
            )}
          />
        </Section>

        {/* Description Input */}
        <Section title="Description" style={styles.section}>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Please provide detailed information about your issue or feature request..."
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.description?.message}
                multiline
                numberOfLines={6}
                style={styles.descriptionInput}
                maxLength={1000}
              />
            )}
          />
        </Section>

        {/* Attachments */}
        <Section title="Attachments (Optional)" style={styles.section}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={handleAttachment}
            activeOpacity={0.7}>
            <Icon name="paperclip" size={20} color={colors.primary} />
            <Text style={styles.attachButtonText}>Add File</Text>
          </TouchableOpacity>
          <Text style={styles.attachHint}>
            Supported formats: Images, Documents, PDFs (Max 10MB)
          </Text>

          {/* Attached Files List */}
          {attachedFiles.length > 0 && (
            <View style={styles.attachmentsContainer}>
              <Text style={styles.attachmentsTitle}>Attached Files:</Text>
              {attachedFiles.map((file, index) => (
                <View key={index} style={styles.attachmentItem}>
                  <View style={styles.attachmentInfo}>
                    <Icon name="file" size={20} color={colors.text.secondary} />
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
                    style={styles.removeButton}
                    onPress={() => removeAttachment(index)}
                    activeOpacity={0.7}>
                    <Icon name="x" size={20} color={colors.semantic.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </Section>

        {/* Tips */}
        <Section title="Tips for Better Support" style={styles.section}>
          <View style={styles.tipsContainer}>
            <View style={styles.tipItem}>
              <Icon
                name="check-circle"
                size={16}
                color={colors.semantic.success}
              />
              <Text style={styles.tipText}>
                Be specific about the steps that led to the issue
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Icon
                name="check-circle"
                size={16}
                color={colors.semantic.success}
              />
              <Text style={styles.tipText}>
                Include screenshots or files if they help explain the problem
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Icon
                name="check-circle"
                size={16}
                color={colors.semantic.success}
              />
              <Text style={styles.tipText}>
                Mention your device type and app version if relevant
              </Text>
            </View>
          </View>
        </Section>
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <Button
          title="Create Ticket"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          disabled={loading}
        />
      </View>

      {loading && <LoadingOverlay message="Creating your support ticket..." />}
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.light,
  },
  section: {
    marginBottom: spacing.md,
  },

  // Type Selection
  typeContainer: {
    gap: spacing.sm,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
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

export default TicketCreateScreen;
