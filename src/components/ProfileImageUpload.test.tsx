import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfileImageUpload from './ProfileImageUpload';
import { ProfileImageService } from '../services/ProfileImageService';

// Mock ProfileImageService
jest.mock('../services/ProfileImageService', () => ({
  ProfileImageService: {
    validateFile: jest.fn(),
    createPreviewUrl: jest.fn(),
    generateUserInitials: jest.fn()
  }
}));

const mockProfileImageService = ProfileImageService as jest.Mocked<typeof ProfileImageService>;

describe('ProfileImageUpload', () => {
  const defaultProps = {
    onImageUploaded: jest.fn(),
    onError: jest.fn(),
    userName: 'John Doe',
    userEmail: 'john@example.com'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockProfileImageService.generateUserInitials.mockReturnValue('JD');
  });

  describe('Default avatar display', () => {
    test('should display user initials when no image is provided', () => {
      render(<ProfileImageUpload {...defaultProps} />);
      
      expect(mockProfileImageService.generateUserInitials).toHaveBeenCalledWith('John Doe', 'john@example.com');
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    test('should display "U" when no name or email provided', () => {
      mockProfileImageService.generateUserInitials.mockReturnValue('U');
      
      render(<ProfileImageUpload {...defaultProps} userName={undefined} userEmail={undefined} />);
      
      expect(mockProfileImageService.generateUserInitials).toHaveBeenCalledWith(undefined, undefined);
      expect(screen.getByText('U')).toBeInTheDocument();
    });

    test('should show "Adicionar foto" text when no image', () => {
      render(<ProfileImageUpload {...defaultProps} />);
      
      expect(screen.getByText('Adicionar foto')).toBeInTheDocument();
    });
  });

  describe('Current image display', () => {
    test('should display current image when provided', () => {
      const imageUrl = 'https://example.com/avatar.jpg';
      render(<ProfileImageUpload {...defaultProps} currentImageUrl={imageUrl} />);
      
      const image = screen.getByAltText('Profile');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', imageUrl);
    });

    test('should show "Alterar foto" text when image exists', () => {
      render(<ProfileImageUpload {...defaultProps} currentImageUrl="https://example.com/avatar.jpg" />);
      
      expect(screen.getByText('Alterar foto')).toBeInTheDocument();
    });
  });

  describe('Upload progress states', () => {
    test('should show loading state during upload', async () => {
      mockProfileImageService.validateFile.mockReturnValue({ isValid: true });
      mockProfileImageService.createPreviewUrl.mockResolvedValue('data:image/jpeg;base64,test');

      render(<ProfileImageUpload {...defaultProps} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      // Simulate file selection
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });
      
      fireEvent.change(fileInput);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      }, { timeout: 100 });
    });

    test('should hide loading state after upload completes', async () => {
      mockProfileImageService.validateFile.mockReturnValue({ isValid: true });
      mockProfileImageService.createPreviewUrl.mockResolvedValue('data:image/jpeg;base64,test');

      render(<ProfileImageUpload {...defaultProps} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });
      
      fireEvent.change(fileInput);

      // Wait for upload to complete
      await waitFor(() => {
        expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('File validation', () => {
    test('should call onError when file validation fails', async () => {
      const errorMessage = 'Arquivo muito grande';
      mockProfileImageService.validateFile.mockReturnValue({ 
        isValid: false, 
        error: errorMessage 
      });

      render(<ProfileImageUpload {...defaultProps} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });
      
      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(defaultProps.onError).toHaveBeenCalledWith(errorMessage);
      });
    });

    test('should call onImageUploaded when upload succeeds', async () => {
      const previewUrl = 'data:image/jpeg;base64,test';
      mockProfileImageService.validateFile.mockReturnValue({ isValid: true });
      mockProfileImageService.createPreviewUrl.mockResolvedValue(previewUrl);

      render(<ProfileImageUpload {...defaultProps} />);
      
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });
      
      fireEvent.change(fileInput);

      await waitFor(() => {
        expect(defaultProps.onImageUploaded).toHaveBeenCalledWith(previewUrl);
      }, { timeout: 2000 });
    });
  });

  describe('Disabled state', () => {
    test('should not allow file selection when disabled', () => {
      render(<ProfileImageUpload {...defaultProps} disabled={true} />);
      
      // File input should be disabled
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(fileInput).toBeDisabled();
    });

    test('should not show upload instructions when disabled', () => {
      render(<ProfileImageUpload {...defaultProps} disabled={true} />);
      
      expect(screen.queryByText('Clique ou arraste uma imagem')).not.toBeInTheDocument();
      expect(screen.queryByText('JPEG, PNG ou WebP • Máximo 5MB')).not.toBeInTheDocument();
    });

    test('should have disabled styling when disabled', () => {
      render(<ProfileImageUpload {...defaultProps} disabled={true} />);
      
      const uploadArea = document.querySelector('.relative.w-24.h-24');
      expect(uploadArea).toHaveClass('cursor-not-allowed', 'opacity-50');
    });
  });

  describe('Drag and drop functionality', () => {
    test('should handle drag over event', () => {
      render(<ProfileImageUpload {...defaultProps} />);
      
      const uploadArea = document.querySelector('.relative.w-24.h-24') as HTMLElement;
      
      fireEvent.dragOver(uploadArea, { dataTransfer: { files: [] } });
      
      expect(uploadArea).toHaveClass('border-blue-400', 'border-dashed', 'bg-blue-50');
    });

    test('should handle drag leave event', () => {
      render(<ProfileImageUpload {...defaultProps} />);
      
      const uploadArea = document.querySelector('.relative.w-24.h-24') as HTMLElement;
      
      fireEvent.dragOver(uploadArea, { dataTransfer: { files: [] } });
      fireEvent.dragLeave(uploadArea, { dataTransfer: { files: [] } });
      
      expect(uploadArea).not.toHaveClass('border-blue-400', 'border-dashed', 'bg-blue-50');
    });

    test('should handle file drop', async () => {
      mockProfileImageService.validateFile.mockReturnValue({ isValid: true });
      mockProfileImageService.createPreviewUrl.mockResolvedValue('data:image/jpeg;base64,test');

      render(<ProfileImageUpload {...defaultProps} />);
      
      const uploadArea = document.querySelector('.relative.w-24.h-24') as HTMLElement;
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      fireEvent.drop(uploadArea, { 
        dataTransfer: { files: [file] } 
      });

      await waitFor(() => {
        expect(mockProfileImageService.validateFile).toHaveBeenCalledWith(file);
      });
    });
  });

  describe('Accessibility', () => {
    test('should have proper alt text for profile image', () => {
      render(<ProfileImageUpload {...defaultProps} currentImageUrl="https://example.com/avatar.jpg" />);
      
      const image = screen.getByAltText('Profile');
      expect(image).toBeInTheDocument();
    });

    test('should have hidden file input for screen readers', () => {
      render(<ProfileImageUpload {...defaultProps} />);
      
      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toHaveClass('hidden');
      expect(fileInput).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp');
    });
  });
});

// Validates: Requirements 1.4, 1.5, 6.6