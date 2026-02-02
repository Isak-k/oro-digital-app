import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface CloudinaryUploadWidgetProps {
  onUpload: (url: string) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

declare global {
  interface Window {
    cloudinary: any;
  }
}

const CloudinaryUploadWidget: React.FC<CloudinaryUploadWidgetProps> = ({
  onUpload,
  disabled = false,
  children
}) => {
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    // Load Cloudinary widget script
    if (!window.cloudinary) {
      const script = document.createElement('script');
      script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
      script.async = true;
      script.onload = () => {
        initializeWidget();
      };
      document.body.appendChild(script);
    } else {
      initializeWidget();
    }

    return () => {
      if (widgetRef.current) {
        widgetRef.current.destroy();
      }
    };
  }, []);

  const initializeWidget = () => {
    if (window.cloudinary) {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dc09vfass';
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'oro-digital-image';
      
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: cloudName,
          uploadPreset: uploadPreset,
          sources: ['local', 'url', 'camera'],
          multiple: false,
          maxFiles: 1,
          maxFileSize: 10000000, // 10MB
          clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
          theme: 'minimal',
          styles: {
            palette: {
              window: '#FFFFFF',
              windowBorder: '#90A0B3',
              tabIcon: '#0078FF',
              menuIcons: '#5A616A',
              textDark: '#000000',
              textLight: '#FFFFFF',
              link: '#0078FF',
              action: '#FF620C',
              inactiveTabIcon: '#0E2F5A',
              error: '#F44235',
              inProgress: '#0078FF',
              complete: '#20B832',
              sourceBg: '#E4EBF1'
            }
          }
        },
        (error: any, result: any) => {
          if (!error && result && result.event === 'success') {
            onUpload(result.info.secure_url);
          }
          if (error) {
            console.error('Cloudinary widget error:', error);
          }
        }
      );
    }
  };

  const openWidget = () => {
    if (widgetRef.current && !disabled) {
      widgetRef.current.open();
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={openWidget}
      disabled={disabled}
      className="w-full gap-2"
    >
      <Upload className="w-4 h-4" />
      {children || 'Upload with Cloudinary Widget'}
    </Button>
  );
};

export default CloudinaryUploadWidget;