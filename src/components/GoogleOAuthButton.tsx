import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface GoogleOAuthButtonProps {
  onSuccess: (credentialResponse: any) => void;
  onError?: () => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  width?: string;
}

const GoogleOAuthButton: React.FC<GoogleOAuthButtonProps> = ({
  onSuccess,
  onError,
  text = 'signin_with',
  theme = 'outline',
  size = 'large',
  width = '100%'
}) => {
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeGoogleAuth = () => {
      if (window.google && googleButtonRef.current) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
          callback: (response: any) => {
            console.log('Google OAuth response:', response);
            onSuccess(response);
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          type: 'standard',
          theme: theme,
          size: size,
          text: text,
          width: width,
          logo_alignment: 'left',
        });
      }
    };

    // Check if Google API is already loaded
    if (window.google) {
      initializeGoogleAuth();
    } else {
      // Wait for Google API to load
      const checkGoogleLoaded = setInterval(() => {
        if (window.google) {
          initializeGoogleAuth();
          clearInterval(checkGoogleLoaded);
        }
      }, 100);

      // Clean up interval after 10 seconds to avoid infinite checking
      setTimeout(() => {
        clearInterval(checkGoogleLoaded);
        if (onError) {
          console.error('Google API failed to load');
          onError();
        }
      }, 10000);
    }
  }, [onSuccess, onError, text, theme, size, width]);

  return (
    <div className="flex justify-center">
      <div ref={googleButtonRef} className="w-full" />
    </div>
  );
};

export default GoogleOAuthButton;