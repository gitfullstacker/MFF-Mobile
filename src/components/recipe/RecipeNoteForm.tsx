import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { recipeNoteService } from '@/services/recipeNoteService';
import { colors, typography, spacing, borderRadius } from '@/theme';
import Icon from 'react-native-vector-icons/Feather';
import { RecipeNote } from '@/types/recipeNote';
import { Button } from '../forms/Button';

interface RecipeNoteFormProps {
  recipeId: string;
}

export const RecipeNoteForm: React.FC<RecipeNoteFormProps> = ({ recipeId }) => {
  const [note, setNote] = useState('');
  const [existingNote, setExistingNote] = useState<RecipeNote | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchExistingNote();
  }, [recipeId]);

  const fetchExistingNote = async () => {
    try {
      setFetching(true);
      const checkExist = await recipeNoteService.checkNoteExists(recipeId);

      if (checkExist) {
        const existingData = await recipeNoteService.getNoteByRecipeId(
          recipeId,
        );
        if (existingData) {
          setExistingNote(existingData);
          setNote(existingData.note);
          setIsExpanded(true);
        }
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error fetching note:', error);
      }
    } finally {
      setFetching(false);
    }
  };

  const handleSaveNote = async () => {
    if (!note.trim()) {
      Alert.alert('Error', 'Please enter a note');
      return;
    }

    if (note.length > 5000) {
      Alert.alert('Error', 'Note cannot exceed 5000 characters');
      return;
    }

    try {
      setLoading(true);
      const savedNote = await recipeNoteService.createOrUpdateNote(recipeId, {
        note: note.trim(),
      });
      setExistingNote(savedNote);
      Alert.alert('Success', 'Note saved successfully');
    } catch (error: any) {
      if (__DEV__) {
        console.error('Error saving note:', error);
      }
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to save note',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async () => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            await recipeNoteService.deleteNote(recipeId);
            setNote('');
            setExistingNote(null);
            setIsExpanded(false);
            Alert.alert('Success', 'Note deleted successfully');
          } catch (error: any) {
            if (__DEV__) {
              console.error('Error deleting note:', error);
            }
            Alert.alert('Error', 'Failed to delete note');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  if (fetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Personal Note</Text>
        {!isExpanded && !existingNote && (
          <TouchableOpacity
            onPress={() => setIsExpanded(true)}
            style={styles.addButton}
            activeOpacity={0.7}>
            <Icon name="plus" size={16} color={colors.white} />
            <Text style={styles.addButtonText}>Add Note</Text>
          </TouchableOpacity>
        )}
      </View>

      {(isExpanded || existingNote) && (
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Add your personal notes about this recipe..."
              placeholderTextColor={colors.text.light}
              value={note}
              onChangeText={setNote}
              multiline
              textAlignVertical="top"
              maxLength={5000}
              editable={!loading}
            />
          </View>

          <View style={styles.characterCount}>
            <Text style={styles.characterCountText}>{note.length} / 5000</Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title={existingNote ? 'Update Note' : 'Save Note'}
              onPress={handleSaveNote}
              variant="primary"
              size="small"
              loading={loading}
              disabled={loading}
              icon={<Icon name="save" size={16} color={colors.white} />}
              style={styles.saveButton}
            />

            {existingNote && (
              <Button
                title="Delete"
                onPress={handleDeleteNote}
                variant="outline"
                size="small"
                disabled={loading}
                icon={
                  <Icon
                    name="trash-2"
                    size={16}
                    color={colors.semantic.error}
                  />
                }
                style={styles.deleteButton}
                textStyle={styles.deleteButtonText}
              />
            )}

            {!existingNote && (
              <Button
                title="Cancel"
                onPress={() => {
                  setNote('');
                  setIsExpanded(false);
                }}
                variant="outline"
                size="small"
                disabled={loading}
                style={styles.cancelButton}
              />
            )}
          </View>
        </View>
      )}

      {existingNote && !isExpanded && (
        <TouchableOpacity
          style={styles.notePreview}
          onPress={() => setIsExpanded(true)}
          activeOpacity={0.7}>
          <Icon
            name="file-text"
            size={18}
            color={colors.text.secondary}
            style={styles.notePreviewIcon}
          />
          <View style={styles.notePreviewContent}>
            <Text style={styles.notePreviewText} numberOfLines={3}>
              {existingNote.note}
            </Text>
            <View style={styles.tapToEditContainer}>
              <Text style={styles.tapToEdit}>Tap to edit</Text>
              <Icon name="edit-2" size={12} color={colors.primary} />
            </View>
          </View>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  loadingContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h5,
    color: colors.text.primary,
  },
  addButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  addButtonText: {
    ...typography.buttonSmall,
    color: colors.white,
  },
  formContainer: {
    marginTop: spacing.sm,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[50],
    minHeight: 120,
  },
  textInput: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    padding: spacing.md,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    alignItems: 'flex-end',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  characterCountText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  saveButton: {
    flex: 1,
  },
  deleteButton: {
    flex: 1,
    borderColor: colors.semantic.error,
  },
  deleteButtonText: {
    color: colors.semantic.error,
  },
  cancelButton: {
    flex: 1,
  },
  notePreview: {
    flexDirection: 'row',
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginTop: spacing.sm,
  },
  notePreviewIcon: {
    marginRight: spacing.sm,
    marginTop: spacing.xs,
  },
  notePreviewContent: {
    flex: 1,
  },
  notePreviewText: {
    ...typography.bodyRegular,
    color: colors.text.primary,
    lineHeight:
      typography.bodyRegular.fontSize * typography.lineHeights.relaxed,
    marginBottom: spacing.sm,
  },
  tapToEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tapToEdit: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
});
