import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Alert } from 'react-native';
import { PageContainer } from '../../components/layout/PageContainer';
import { Header } from '../../components/navigation/Header';
import { LoadingOverlay } from '../../components/feedback/LoadingOverlay';
import { useNutrition } from '../../hooks/useNutrition';
import { spacing } from '../../theme';
import NutritionProfileForm from '../../components/nutrition/NutritionProfileForm';
import NutritionInformationDisplay from '../../components/nutrition/NutritionInformationDisplay';
import {
  CreateNutritionProfileRequest,
  UpdateNutritionProfileRequest,
} from '../../types/nutrition';
import BodyFatPhotoModal from '@/components/modals/BodyFatPhotoModal';

const NutritionScreen: React.FC = () => {
  const {
    nutritionProfile,
    loading,
    fetchProfile,
    createProfile,
    updateProfile,
    deleteProfile,
  } = useNutrition();

  const [showBodyFatModal, setShowBodyFatModal] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [estimatedBodyFat, setEstimatedBodyFat] = useState<number | undefined>(
    undefined,
  );

  // Fetch profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        await fetchProfile();
      } catch (error) {
        if (__DEV__) {
          console.error('Error loading nutrition profile:', error);
        }
      } finally {
        setInitialLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Handle profile submission (create or update)
  const handleProfileSubmit = async (data: CreateNutritionProfileRequest) => {
    try {
      if (nutritionProfile) {
        await updateProfile(data as UpdateNutritionProfileRequest);
      } else {
        await createProfile(data);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error saving nutrition profile:', error);
      }
    }
  };

  // Handle profile deletion
  const handleDeleteProfile = () => {
    Alert.alert(
      'Delete Nutrition Profile',
      'Are you sure you want to delete your nutrition profile? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProfile();
              Alert.alert('Success', 'Nutrition profile deleted successfully');
            } catch (error) {
              if (__DEV__) {
                console.error('Error deleting profile:', error);
              }
            }
          },
        },
      ],
    );
  };

  // Handle body fat estimation
  const handleBodyFatEstimated = (percentage: number) => {
    setEstimatedBodyFat(percentage);
    setShowBodyFatModal(false);
  };

  if (initialLoading) {
    return (
      <PageContainer>
        <Header title="Nutrition Profile" showBack={true} />
        <LoadingOverlay message="Loading nutrition profile..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header title="Nutrition Profile" showBack={true} />

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Form Section */}
        <NutritionProfileForm
          nutritionProfile={nutritionProfile}
          onSubmit={handleProfileSubmit}
          onShowBodyFatModal={() => setShowBodyFatModal(true)}
          onDeleteProfile={nutritionProfile ? handleDeleteProfile : undefined}
          estimatedBodyFat={estimatedBodyFat}
        />

        {/* Information Display Section */}
        {nutritionProfile && (
          <NutritionInformationDisplay
            nutritionProfile={nutritionProfile}
            onProfileUpdate={profile => {
              // Profile updated via updateTargetMacros
            }}
          />
        )}
      </ScrollView>

      {/* Body Fat Photo Modal */}
      <BodyFatPhotoModal
        visible={showBodyFatModal}
        onClose={() => setShowBodyFatModal(false)}
        onBodyFatEstimated={handleBodyFatEstimated}
      />

      {loading && <LoadingOverlay message="Processing..." />}
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
});

export default NutritionScreen;
