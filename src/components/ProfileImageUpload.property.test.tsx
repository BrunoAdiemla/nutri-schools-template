import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import fc from 'fast-check';
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

describe('ProfileImageUpload Property Tests', () => {
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

  afterEach(() => {
    cleanup();
  });

  describe('Property 7: Image upload round trip', () => {
    test('should handle valid image files consistently', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            fileName: fc.string({ minLength: 1, maxLength: 50 }).map(s => s.trim() + '.jpg'),
            fileSize: fc.integer({ min: 1, max: 5 * 1024 * 1024 }), // Up to 5MB
            fileType: fc.constantFrom('image/jpeg', 'image/png', 'image/webp'),
            fileContent: fc.string({ minLength: 10, maxLength: 100 })
          }),
          async ({ fileName, fileSize, fileType, fileContent }) => {
            // Clean up any previous renders
            cleanup();
            
            // Setup mocks for valid file
            mockProfileImageService.validateFile.mockReturnValue({ isValid: true });
            const expectedPreviewUrl = `data:${fileType};base64,${btoa(fileContent)}`;
            mockProfileImageService.createPreviewUrl.mockResolvedValue(expectedPreviewUrl);

            const onImageUploaded = jest.fn();
            const onError = jest.fn();

            const { container } = render(
              <ProfileImageUpload 
                {...defaultProps} 
                onImageUploaded={onImageUploaded}
                onError={onError}
              />
            );

            // Create file with specified properties
            const file = new File([fileContent], fileName, { type: fileType });
            Object.defineProperty(file, 'size', { value: fileSize });

            const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
            
            // Simulate file selection using fireEvent.change with a mock event
            fireEvent.change(fileInput, { target: { files: [file] } });

            // Wait for upload to complete
            await waitFor(() => {
              expect(onImageUploaded).toHaveBeenCalledWith(expectedPreviewUrl);
            }, { timeout: 1500 });

            // Verify no errors occurred
            expect(onError).not.toHaveBeenCalled();
            
            // Verify validation was called with correct file
            expect(mockProfileImageService.validateFile).toHaveBeenCalledWith(file);
            expect(mockProfileImageService.createPreviewUrl).toHaveBeenCalledWith(file);
          }
        ),
        { numRuns: 10 }
      );
    }, 10000);

    test('should handle invalid image files consistently', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            fileName: fc.string({ minLength: 1, maxLength: 50 }).map(s => s.trim() + '.txt'),
            fileSize: fc.integer({ min: 5 * 1024 * 1024 + 1, max: 10 * 1024 * 1024 }), // Over 5MB
            fileType: fc.constantFrom('text/plain', 'application/pdf', 'image/gif'),
            fileContent: fc.string({ minLength: 10, maxLength: 100 }),
            errorMessage: fc.constantFrom(
              'Arquivo muito grande. Máximo 5MB permitido.',
              'Apenas arquivos JPEG, PNG e WebP são permitidos.',
              'Extensão de arquivo não permitida.'
            )
          }),
          async ({ fileName, fileSize, fileType, fileContent, errorMessage }) => {
            // Clean up any previous renders
            cleanup();
            
            // Setup mocks for invalid file
            mockProfileImageService.validateFile.mockReturnValue({ 
              isValid: false, 
              error: errorMessage 
            });

            const onImageUploaded = jest.fn();
            const onError = jest.fn();

            const { container } = render(
              <ProfileImageUpload 
                {...defaultProps} 
                onImageUploaded={onImageUploaded}
                onError={onError}
              />
            );

            // Create invalid file
            const file = new File([fileContent], fileName, { type: fileType });
            Object.defineProperty(file, 'size', { value: fileSize });

            const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
            
            // Simulate file selection
            fireEvent.change(fileInput, { target: { files: [file] } });

            // Wait for error handling
            await waitFor(() => {
              expect(onError).toHaveBeenCalledWith(errorMessage);
            }, { timeout: 500 });

            // Verify upload callback was not called
            expect(onImageUploaded).not.toHaveBeenCalled();
            
            // Verify validation was called
            expect(mockProfileImageService.validateFile).toHaveBeenCalledWith(file);
            
            // Verify preview creation was not called for invalid files
            expect(mockProfileImageService.createPreviewUrl).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 10 }
      );
    }, 10000);

    test('should handle upload errors consistently', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            fileName: fc.string({ minLength: 1, maxLength: 50 }).map(s => s.trim() + '.jpg'),
            fileSize: fc.integer({ min: 1, max: 5 * 1024 * 1024 }),
            fileContent: fc.string({ minLength: 10, maxLength: 100 }),
            errorMessage: fc.constantFrom(
              'Erro no upload da imagem',
              'Network error',
              'Storage full'
            )
          }),
          async ({ fileName, fileSize, fileContent, errorMessage }) => {
            // Clean up any previous renders
            cleanup();
            
            // Setup mocks for valid file but upload error
            mockProfileImageService.validateFile.mockReturnValue({ isValid: true });
            mockProfileImageService.createPreviewUrl.mockRejectedValue(new Error(errorMessage));

            const onImageUploaded = jest.fn();
            const onError = jest.fn();

            const { container } = render(
              <ProfileImageUpload 
                {...defaultProps} 
                onImageUploaded={onImageUploaded}
                onError={onError}
              />
            );

            // Create valid file
            const file = new File([fileContent], fileName, { type: 'image/jpeg' });
            Object.defineProperty(file, 'size', { value: fileSize });

            const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
            
            // Simulate file selection
            fireEvent.change(fileInput, { target: { files: [file] } });

            // Wait for error handling
            await waitFor(() => {
              expect(onError).toHaveBeenCalledWith('Erro no upload da imagem');
            }, { timeout: 1500 });

            // Verify upload callback was not called
            expect(onImageUploaded).not.toHaveBeenCalled();
            
            // Verify validation and preview creation were called
            expect(mockProfileImageService.validateFile).toHaveBeenCalledWith(file);
            expect(mockProfileImageService.createPreviewUrl).toHaveBeenCalledWith(file);
          }
        ),
        { numRuns: 10 }
      );
    }, 10000);

    test('should maintain component state consistency during upload process', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            fileName: fc.string({ minLength: 1, maxLength: 50 }).map(s => s.trim() + '.png'),
            fileContent: fc.string({ minLength: 10, maxLength: 100 }),
            uploadDelay: fc.integer({ min: 50, max: 200 })
          }),
          async ({ fileName, fileContent, uploadDelay }) => {
            // Clean up any previous renders
            cleanup();
            
            // Setup mocks with delay
            mockProfileImageService.validateFile.mockReturnValue({ isValid: true });
            const expectedPreviewUrl = `data:image/png;base64,${btoa(fileContent)}`;
            mockProfileImageService.createPreviewUrl.mockImplementation(
              () => new Promise(resolve => setTimeout(() => resolve(expectedPreviewUrl), uploadDelay))
            );

            const onImageUploaded = jest.fn();
            const onError = jest.fn();

            const { container } = render(
              <ProfileImageUpload 
                {...defaultProps} 
                onImageUploaded={onImageUploaded}
                onError={onError}
              />
            );

            // Create file
            const file = new File([fileContent], fileName, { type: 'image/png' });

            const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
            
            // Simulate file selection
            fireEvent.change(fileInput, { target: { files: [file] } });

            // Verify loading state appears
            await waitFor(() => {
              expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
            }, { timeout: 100 });

            // Wait for upload to complete
            await waitFor(() => {
              expect(onImageUploaded).toHaveBeenCalledWith(expectedPreviewUrl);
            }, { timeout: uploadDelay + 500 });

            // Verify loading state disappears
            expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
            
            // Verify no errors
            expect(onError).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 10 }
      );
    }, 10000);
  });
});

// Validates: Requirements 3.4, 3.5, 3.7