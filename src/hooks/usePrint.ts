import { useState, useCallback } from 'react';
import { printService } from '../services/printService';
import { PrintRecipeRequest, PrintQuotaInfo } from '../types/print';
import { useAtom } from 'jotai';
import { addToastAtom } from '@/store';
import { generatePDF } from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import { Platform } from 'react-native';

export const usePrint = () => {
  const [loading, setLoading] = useState(false);
  const [quotaInfo, setQuotaInfo] = useState<PrintQuotaInfo | null>(null);
  const [quotaLoading, setQuotaLoading] = useState(false);
  const [, addToast] = useAtom(addToastAtom);

  /**
   * Fetch user's print quota information
   */
  const fetchQuotaInfo = useCallback(async () => {
    try {
      setQuotaLoading(true);
      const info = await printService.getQuotaInfo();
      setQuotaInfo(info);
      return info;
    } catch (error: any) {
      if (__DEV__) {
        console.error('❌ Failed to fetch quota info:', error);
      }
      const errorMessage =
        error.response?.data?.message ||
        'Failed to fetch print quota information';
      addToast({
        message: errorMessage,
        type: 'error',
        duration: 4000,
      });
      throw error;
    } finally {
      setQuotaLoading(false);
    }
  }, [addToast]);

  /**
   * Check if user can print
   */
  const checkCanPrint = useCallback(async (): Promise<boolean> => {
    try {
      const response = await printService.canPrint();
      return response.can_print;
    } catch (error: any) {
      if (__DEV__) {
        console.error('❌ Failed to check print permission:', error);
      }
      return false;
    }
  }, []);

  /**
   * Preview recipe (doesn't count against quota)
   */
  const previewRecipe = useCallback(
    async (
      recipeId: number,
      imageWidth?: number,
      imageHeight?: number,
    ): Promise<string> => {
      try {
        setLoading(true);
        const request: PrintRecipeRequest = {
          recipe_id: recipeId,
          isPreview: true,
          imageWidth: imageWidth || 500,
          imageHeight: imageHeight || 900,
        };

        const html = await printService.printRecipe(request);
        return html;
      } catch (error: any) {
        if (__DEV__) {
          console.error('❌ Failed to preview recipe:', error);
        }
        const errorMessage =
          error.response?.data?.message || 'Failed to preview recipe';
        addToast({
          message: errorMessage,
          type: 'error',
          duration: 4000,
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [addToast],
  );

  /**
   * Print recipe (counts against quota)
   */
  const printRecipe = useCallback(
    async (
      recipeId: number,
      imageWidth?: number,
      imageHeight?: number,
    ): Promise<string> => {
      try {
        setLoading(true);

        // Check quota first
        const canPrint = await checkCanPrint();
        if (!canPrint) {
          addToast({
            message: 'Weekly print quota exceeded',
            type: 'error',
            duration: 4000,
          });
          throw new Error('Weekly print quota exceeded');
        }

        const request: PrintRecipeRequest = {
          recipe_id: recipeId,
          isPreview: false,
          imageWidth: imageWidth || 500,
          imageHeight: imageHeight || 900,
        };

        const html = await printService.printRecipe(request);

        // Refresh quota info after successful print
        await fetchQuotaInfo();

        addToast({
          message: 'Recipe printed successfully!',
          type: 'success',
          duration: 3000,
        });

        return html;
      } catch (error: any) {
        if (__DEV__) {
          console.error('❌ Failed to print recipe:', error);
        }
        const errorMessage =
          error.response?.data?.message || 'Failed to print recipe';
        addToast({
          message: errorMessage,
          type: 'error',
          duration: 4000,
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [addToast, checkCanPrint, fetchQuotaInfo],
  );

  /**
   * Open HTML in browser for printing
   */
  const openPrintInBrowser = useCallback(
    async (htmlContent: string) => {
      try {
        // Generate PDF from HTML using the correct API
        // Android and iOS require different directory handling
        const options = Platform.select({
          ios: {
            html: htmlContent,
            fileName: `recipe-${Date.now()}`,
            directory: 'Documents',
            width: 612, // Letter size width in points (8.5 inches)
            height: 792, // Letter size height in points (11 inches)
            padding: 24,
            bgColor: '#FFFFFF',
            base64: false,
          },
          android: {
            html: htmlContent,
            fileName: `recipe-${Date.now()}`,
            // Don't specify directory for Android - let it use default cache
            width: 612,
            height: 792,
            padding: 24,
            bgColor: '#FFFFFF',
            base64: false,
          },
        });

        const pdf = await generatePDF(options!);

        // Share the PDF (includes print option on iOS/Android)
        await Share.open({
          url:
            Platform.OS === 'android' ? `file://${pdf.filePath}` : pdf.filePath,
          type: 'application/pdf',
          title: 'Print Recipe',
          subject: 'Recipe',
        });

        setTimeout(() => {
          addToast({
            message: 'PDF generated successfully',
            type: 'success',
            duration: 3000,
          });
        }, 0);
      } catch (error: any) {
        if (__DEV__) {
          console.error('❌ Failed to generate PDF:', error);
          console.error('Error details:', JSON.stringify(error, null, 2));
        }

        // Check if user cancelled
        if (
          error.message &&
          (error.message.includes('cancel') ||
            error.message.includes('User did not share'))
        ) {
          // User cancelled - this is normal, don't show error
          return;
        }

        setTimeout(() => {
          addToast({
            message: 'Failed to generate PDF',
            type: 'error',
            duration: 4000,
          });
        }, 0);
      }
    },
    [addToast],
  );

  return {
    loading,
    quotaInfo,
    quotaLoading,
    fetchQuotaInfo,
    checkCanPrint,
    previewRecipe,
    printRecipe,
    openPrintInBrowser,
  };
};
