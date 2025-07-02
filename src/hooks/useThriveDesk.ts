import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { Platform } from 'react-native';

interface ThriveDeskModalState {
  visible: boolean;
  title: string;
  department?: string;
  subject?: string;
  prefilledMessage?: string;
}

interface ThriveDeskConfig {
  baseUrl: string;
  widgetId?: string;
  defaultDepartment?: string;
}

export const useThriveDesk = (
  config: ThriveDeskConfig = {
    baseUrl: 'https://your-company.thrivedesk.com',
  },
) => {
  const { user } = useAuth();
  const [modalState, setModalState] = useState<ThriveDeskModalState>({
    visible: false,
    title: 'Support Chat',
  });

  // Show modal with custom configuration
  const showModal = useCallback(
    (
      options: {
        title?: string;
        department?: string;
        subject?: string;
        prefilledMessage?: string;
      } = {},
    ) => {
      setModalState({
        visible: true,
        title: options.title || 'Support Chat',
        department: options.department || config.defaultDepartment,
        subject: options.subject,
        prefilledMessage: options.prefilledMessage,
      });
    },
    [config.defaultDepartment],
  );

  // Hide modal
  const hideModal = useCallback(() => {
    setModalState(prev => ({ ...prev, visible: false }));
  }, []);

  // Quick action methods
  const openGeneralSupport = useCallback(() => {
    showModal({
      title: 'General Support',
      department: 'support',
      subject: 'General Inquiry',
    });
  }, [showModal]);

  const openBugReport = useCallback(
    (bugDescription?: string) => {
      showModal({
        title: 'Report Bug',
        department: 'technical',
        subject: 'Bug Report',
        prefilledMessage: bugDescription
          ? `I found a bug in the app:\n\n${bugDescription}\n\nDevice: ${Platform.OS}\nApp Version: 1.0.0`
          : `I found a bug in the app.\n\nDevice: ${Platform.OS}\nApp Version: 1.0.0`,
      });
    },
    [showModal],
  );

  const openFeatureRequest = useCallback(
    (featureDescription?: string) => {
      showModal({
        title: 'Feature Request',
        department: 'product',
        subject: 'Feature Request',
        prefilledMessage: featureDescription
          ? `I'd like to request a new feature:\n\n${featureDescription}`
          : "I'd like to request a new feature:",
      });
    },
    [showModal],
  );

  const openAccountSupport = useCallback(() => {
    showModal({
      title: 'Account Support',
      department: 'account',
      subject: 'Account Issue',
      prefilledMessage: `I need help with my account.\n\nUser ID: ${
        user?._id || 'Not available'
      }\nEmail: ${user?.email || 'Not available'}`,
    });
  }, [showModal, user]);

  const openRecipeHelp = useCallback(
    (recipeId?: string, recipeName?: string) => {
      showModal({
        title: 'Recipe Help',
        department: 'support',
        subject: 'Recipe Question',
        prefilledMessage:
          recipeId && recipeName
            ? `I have a question about the recipe: "${recipeName}" (ID: ${recipeId})`
            : 'I have a question about a recipe',
      });
    },
    [showModal],
  );

  const openMealPlanHelp = useCallback(
    (planId?: string, planName?: string) => {
      showModal({
        title: 'Meal Plan Help',
        department: 'support',
        subject: 'Meal Planning Question',
        prefilledMessage:
          planId && planName
            ? `I need help with my meal plan: "${planName}" (ID: ${planId})`
            : 'I need help with meal planning',
      });
    },
    [showModal],
  );

  // Generate the widget URL with user context
  const generateWidgetUrl = useCallback(() => {
    let url = `${config.baseUrl}/widget`;

    if (config.widgetId) {
      url += `?widget_id=${config.widgetId}`;
    }

    return url;
  }, [config]);

  return {
    // Modal state
    modalState,

    // Core actions
    showModal,
    hideModal,

    // Quick actions
    openGeneralSupport,
    openBugReport,
    openFeatureRequest,
    openAccountSupport,
    openRecipeHelp,
    openMealPlanHelp,

    // Utilities
    generateWidgetUrl,
    isVisible: modalState.visible,

    // Configuration
    config,
  };
};
