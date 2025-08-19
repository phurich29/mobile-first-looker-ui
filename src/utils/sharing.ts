import { getPlatformInfo } from './platform';

export interface ShareData {
  title: string;
  text?: string;
  url: string;
}

export interface ShareOptions {
  fallbackToClipboard?: boolean;
  showSuccessMessage?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export class SharingError extends Error {
  constructor(
    message: string,
    public readonly reason: 'unsupported' | 'user_canceled' | 'permission_denied' | 'unknown'
  ) {
    super(message);
    this.name = 'SharingError';
  }
}

export const shareContent = async (
  data: ShareData,
  options: ShareOptions = {}
): Promise<'web_share' | 'clipboard' | 'manual'> => {
  const platformInfo = getPlatformInfo();
  const { fallbackToClipboard = true, onSuccess, onError } = options;

  try {
    // Try Web Share API first (best for mobile)
    if (platformInfo.supportsWebShare) {
      try {
        await navigator.share({
          title: data.title,
          text: data.text,
          url: data.url
        });
        onSuccess?.();
        return 'web_share';
      } catch (webShareError: unknown) {
        // User canceled or share failed
        if (webShareError instanceof Error && webShareError.name === 'AbortError') {
          throw new SharingError('User canceled sharing', 'user_canceled');
        }
        // Fall through to clipboard if enabled
        if (!fallbackToClipboard) {
          throw new SharingError('Web Share failed', 'unknown');
        }
      }
    }

    // Fallback to clipboard
    if (platformInfo.supportsClipboard && fallbackToClipboard) {
      try {
        await navigator.clipboard.writeText(data.url);
        onSuccess?.();
        return 'clipboard';
      } catch (clipboardError) {
        // Clipboard failed, use manual method
        if (!fallbackToClipboard) {
          throw new SharingError('Clipboard access denied', 'permission_denied');
        }
      }
    }

    // Final fallback - manual copy (should always work)
    try {
      await fallbackCopyToClipboard(data.url);
      onSuccess?.();
      return 'manual';
    } catch (manualError) {
      throw new SharingError('All sharing methods failed', 'unknown');
    }

  } catch (error) {
    onError?.(error as Error);
    throw error;
  }
};

// Fallback copy method using execCommand (deprecated but widely supported)
const fallbackCopyToClipboard = async (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Create temporary textarea
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    
    document.body.appendChild(textarea);
    
    try {
      textarea.select();
      textarea.setSelectionRange(0, text.length);
      
      const successful = document.execCommand('copy');
      
      if (successful) {
        resolve();
      } else {
        reject(new Error('execCommand copy failed'));
      }
    } catch (error) {
      reject(error);
    } finally {
      document.body.removeChild(textarea);
    }
  });
};

export const getSharingCapabilities = () => {
  const platformInfo = getPlatformInfo();
  
  return {
    hasWebShare: platformInfo.supportsWebShare,
    hasClipboard: platformInfo.supportsClipboard,
    hasManualFallback: true,
    recommendedMethod: platformInfo.supportsWebShare ? 'web_share' : 
                     platformInfo.supportsClipboard ? 'clipboard' : 'manual',
    platform: platformInfo.platform
  };
};

export const getShareButtonText = (method: 'web_share' | 'clipboard' | 'manual'): string => {
  switch (method) {
    case 'web_share':
      return 'แชร์';
    case 'clipboard':
      return 'คัดลอกลิงก์';
    case 'manual':
      return 'คัดลอก';
    default:
      return 'แชร์';
  }
};