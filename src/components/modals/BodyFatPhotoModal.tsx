import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {
  launchImageLibrary,
  launchCamera,
  ImagePickerResponse,
} from 'react-native-image-picker';
import { Button } from '../forms/Button';
import { useNutrition } from '../../hooks/useNutrition';
import {
  colors,
  typography,
  spacing,
  borderRadius,
  fontWeights,
  shadows,
} from '../../theme';
import { AnalyzeBodyFatRequest } from '../../types/nutrition';

interface BodyFatPhotoModalProps {
  visible: boolean;
  onClose: () => void;
  onBodyFatEstimated: (percentage: number) => void;
}

const BodyFatPhotoModal: React.FC<BodyFatPhotoModalProps> = ({
  visible,
  onClose,
  onBodyFatEstimated,
}) => {
  const { analyzeBodyFat, analyzing } = useNutrition();

  const [selectedImage, setSelectedImage] = useState<{
    uri: string;
    base64?: string;
    type?: string;
  } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{
    estimatedBodyFat: number;
    category: string;
    confidence: number;
    recommendations: string;
  } | null>(null);

  // Reset state when modal opens
  const handleModalOpen = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
  };

  // Handle image selection
  const handleSelectImage = () => {
    Alert.alert('Select Photo', 'Choose a photo source', [
      {
        text: 'Camera',
        onPress: () => openCamera(),
      },
      {
        text: 'Photo Library',
        onPress: () => openLibrary(),
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  // Open camera
  const openCamera = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
        includeBase64: true,
        saveToPhotos: false,
      });

      handleImageResponse(result);
    } catch (error) {
      if (__DEV__) {
        console.error('Camera error:', error);
      }
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  // Open photo library
  const openLibrary = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1024,
        maxHeight: 1024,
        includeBase64: true,
      });

      handleImageResponse(result);
    } catch (error) {
      if (__DEV__) {
        console.error('Image picker error:', error);
      }
      Alert.alert('Error', 'Failed to open photo library');
    }
  };

  // Handle image picker response
  const handleImageResponse = (response: ImagePickerResponse) => {
    if (response.didCancel) {
      return;
    }

    if (response.errorCode) {
      Alert.alert('Error', response.errorMessage || 'Failed to select image');
      return;
    }

    const asset = response.assets?.[0];
    if (!asset) {
      return;
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (asset.fileSize && asset.fileSize > maxSize) {
      Alert.alert(
        'File Too Large',
        `Image must be smaller than 5MB. Your file is ${(
          asset.fileSize /
          1024 /
          1024
        ).toFixed(2)}MB.`,
      );
      return;
    }

    setSelectedImage({
      uri: asset.uri || '',
      base64: asset.base64,
      type: asset.type,
    });
    setAnalysisResult(null);
  };

  // Analyze photo
  const handleAnalyzePhoto = async () => {
    if (!selectedImage?.base64) {
      Alert.alert('Error', 'No image selected or image data is missing');
      return;
    }

    try {
      const data: AnalyzeBodyFatRequest = {
        imageData: selectedImage.base64,
        mimeType: selectedImage.type || 'image/jpeg',
      };

      const result = await analyzeBodyFat(data);
      if (result) {
        setAnalysisResult(result);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error analyzing body fat:', error);
      }
    }
  };

  // Use the estimate
  const handleUseEstimate = () => {
    if (analysisResult) {
      onBodyFatEstimated(analysisResult.estimatedBodyFat);
      handleClose();
    }
  };

  // Close modal
  const handleClose = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
      onShow={handleModalOpen}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Icon name="cpu" size={24} color={colors.primary} />
              <Text style={styles.title}>AI Body Fat Analysis</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Icon name="x" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}>
            {/* Info Alert */}
            <View style={styles.infoBox}>
              <Icon name="info" size={16} color={colors.semantic.info} />
              <Text style={styles.infoText}>
                Upload a clear, front-facing photo for AI-powered body fat
                estimation. This is an approximation and should not replace
                professional measurements.
              </Text>
            </View>

            {/* File Upload Section */}
            {!selectedImage ? (
              <TouchableOpacity
                style={styles.uploadBox}
                onPress={handleSelectImage}
                activeOpacity={0.7}>
                <Icon name="upload-cloud" size={48} color={colors.gray[400]} />
                <Text style={styles.uploadTitle}>Upload a Photo</Text>
                <Text style={styles.uploadSubtitle}>
                  Tap to select from camera or gallery
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: selectedImage.uri }}
                  style={styles.imagePreview}
                  resizeMode="contain"
                />
                <TouchableOpacity
                  style={styles.changeImageButton}
                  onPress={handleSelectImage}>
                  <Icon name="refresh-cw" size={16} color={colors.primary} />
                  <Text style={styles.changeImageText}>Change Photo</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Analysis Results */}
            {analysisResult && (
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>Analysis Results</Text>

                <View style={styles.resultsGrid}>
                  <View style={styles.resultCard}>
                    <Text style={styles.resultLabel}>Estimated Body Fat</Text>
                    <Text style={styles.resultValue}>
                      {analysisResult.estimatedBodyFat.toFixed(1)}%
                    </Text>
                  </View>

                  <View style={styles.resultCard}>
                    <Text style={styles.resultLabel}>Category</Text>
                    <Text style={styles.resultValue}>
                      {analysisResult.category}
                    </Text>
                  </View>
                </View>

                <View style={styles.confidenceContainer}>
                  <Text style={styles.confidenceLabel}>
                    AI Confidence Level
                  </Text>
                  <View style={styles.confidenceBar}>
                    <View
                      style={[
                        styles.confidenceFill,
                        { width: `${analysisResult.confidence}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.confidenceValue}>
                    {analysisResult.confidence.toFixed(0)}%
                  </Text>
                </View>

                {analysisResult.recommendations && (
                  <View style={styles.recommendationsBox}>
                    <Icon
                      name="lightbulb"
                      size={16}
                      color={colors.semantic.info}
                    />
                    <View style={styles.recommendationsContent}>
                      <Text style={styles.recommendationsTitle}>
                        Recommendations
                      </Text>
                      <Text style={styles.recommendationsText}>
                        {analysisResult.recommendations}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Guidelines */}
            <View style={styles.guidelinesBox}>
              <Text style={styles.guidelinesTitle}>Photo Guidelines:</Text>
              <View style={styles.guidelineItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.guidelineText}>
                  Take photo in good lighting
                </Text>
              </View>
              <View style={styles.guidelineItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.guidelineText}>
                  Stand straight, facing camera
                </Text>
              </View>
              <View style={styles.guidelineItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.guidelineText}>
                  Wear minimal, form-fitting clothing
                </Text>
              </View>
              <View style={styles.guidelineItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.guidelineText}>
                  Keep arms at your sides
                </Text>
              </View>
              <Text style={styles.disclaimer}>
                Disclaimer: This AI estimation is for informational purposes
                only and may not be medically accurate. Consult healthcare
                professionals for precise measurements.
              </Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footer}>
            {!analysisResult ? (
              <Button
                title={analyzing ? 'Analyzing...' : 'Analyze Photo'}
                onPress={handleAnalyzePhoto}
                variant="primary"
                fullWidth
                loading={analyzing}
                disabled={!selectedImage || analyzing}
                icon={<Icon name="cpu" size={16} color={colors.white} />}
              />
            ) : (
              <Button
                title="Use This Estimate"
                onPress={handleUseEstimate}
                variant="primary"
                fullWidth
                icon={<Icon name="check" size={16} color={colors.white} />}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.h6,
    fontWeight: fontWeights.bold,
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    padding: spacing.lg,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.semantic.info + '10',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: colors.gray[300],
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.gray[50],
    marginBottom: spacing.lg,
  },
  uploadTitle: {
    ...typography.bodyLarge,
    fontWeight: fontWeights.semibold,
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  uploadSubtitle: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  imagePreviewContainer: {
    marginBottom: spacing.lg,
  },
  imagePreview: {
    width: '100%',
    height: 300,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray[100],
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  changeImageText: {
    ...typography.bodyRegular,
    color: colors.primary,
    fontWeight: fontWeights.medium,
  },
  resultsContainer: {
    backgroundColor: colors.gray[50],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  resultsTitle: {
    ...typography.h6,
    fontWeight: fontWeights.bold,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  resultsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  resultCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  resultLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  resultValue: {
    ...typography.h4,
    fontWeight: fontWeights.bold,
    color: colors.primary,
  },
  confidenceContainer: {
    marginBottom: spacing.md,
  },
  confidenceLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  confidenceValue: {
    ...typography.bodySmall,
    fontWeight: fontWeights.semibold,
    color: colors.text.primary,
    textAlign: 'right',
  },
  recommendationsBox: {
    flexDirection: 'row',
    backgroundColor: colors.semantic.info + '10',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  recommendationsContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  recommendationsTitle: {
    ...typography.bodyRegular,
    fontWeight: fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  recommendationsText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  guidelinesBox: {
    backgroundColor: colors.semantic.warning + '10',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  guidelinesTitle: {
    ...typography.bodyRegular,
    fontWeight: fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  bullet: {
    ...typography.bodySmall,
    color: colors.text.primary,
    marginRight: spacing.xs,
  },
  guidelineText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    flex: 1,
  },
  disclaimer: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
});

export default BodyFatPhotoModal;
