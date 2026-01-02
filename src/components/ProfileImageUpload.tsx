import React, { useState, useRef, useEffect } from 'react';
import { ProfileImageService } from '../services/ProfileImageService';

interface ProfileImageUploadProps {
  currentImageUrl?: string;
  userName?: string;
  userEmail?: string;
  userId?: string;
  onImageUploaded: (url: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  currentImageUrl,
  userName,
  userEmail,
  userId,
  onImageUploaded,
  onError,
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Lucide icons
  useEffect(() => {
    const timer = setTimeout(() => {
      // @ts-ignore
      if (window.lucide) {
        // @ts-ignore
        window.lucide.createIcons();
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [uploading, preview]);

  const handleFileSelect = async (file: File) => {
    if (disabled) return;

    // Validate file
    const validation = ProfileImageService.validateFile(file);
    if (!validation.isValid) {
      onError(validation.error || 'Arquivo inválido');
      return;
    }

    setUploading(true);
    
    try {
      // Create preview
      const previewUrl = await ProfileImageService.createPreviewUrl(file);
      setPreview(previewUrl);

      // Upload to Supabase Storage if userId is available
      if (userId) {
        const uploadResult = await ProfileImageService.uploadImage(file, userId);
        
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Falha no upload');
        }
        
        // Use the uploaded URL
        onImageUploaded(uploadResult.url!);
      } else {
        // Fallback to preview URL if no userId (shouldn't happen in normal flow)
        onImageUploaded(previewUrl);
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      onError(error instanceof Error ? error.message : 'Erro no upload da imagem');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    if (disabled) return;

    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const displayImageUrl = preview || currentImageUrl;
  const userInitials = ProfileImageService.generateUserInitials(userName, userEmail);

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Image Display Area */}
      <div
        className={`relative w-24 h-24 rounded-full border-2 transition-all duration-200 ${
          dragOver 
            ? 'border-blue-400 border-dashed bg-blue-50' 
            : 'border-slate-200 hover:border-slate-300'
        } ${
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:shadow-md'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {displayImageUrl ? (
          <img
            src={displayImageUrl}
            alt="Profile"
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-semibold">
            {userInitials}
          </div>
        )}

        {/* Upload Overlay */}
        {!disabled && (
          <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
            <div className="opacity-0 hover:opacity-100 transition-opacity duration-200">
              <i data-lucide="camera" className="w-6 h-6 text-white"></i>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {uploading && (
          <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin" data-testid="loading-spinner">
              <i data-lucide="loader-2" className="w-6 h-6 text-white"></i>
            </div>
          </div>
        )}
      </div>

      {/* Upload Instructions */}
      <div className="text-center">
        <p className="text-sm font-medium text-slate-700">
          {displayImageUrl ? 'Alterar foto' : 'Adicionar foto'}
        </p>
        {!disabled && (
          <p className="text-xs text-slate-500 mt-1">
            Clique ou arraste uma imagem
          </p>
        )}
      </div>

      {/* File Format Info */}
      {!disabled && (
        <div className="text-center">
          <p className="text-xs text-slate-400">
            JPEG, PNG ou WebP • Máximo 5MB
          </p>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Drag and Drop Indicator */}
      {dragOver && !disabled && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full border-2 border-blue-400 border-dashed rounded-lg bg-blue-50 bg-opacity-50 flex items-center justify-center">
            <div className="text-blue-600 text-center">
              <i data-lucide="upload" className="w-8 h-8 mx-auto mb-2"></i>
              <p className="text-sm font-medium">Solte a imagem aqui</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileImageUpload;