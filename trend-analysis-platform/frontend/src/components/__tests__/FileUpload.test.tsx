/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import FileUpload from '../FileUpload';
import * as api from '../../services/api';

// Mock the API service
jest.mock('../../services/api');
const mockApi = api as jest.Mocked<typeof api>;

// Create a theme for testing
const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('FileUpload Component', () => {
  const mockOnUploadSuccess = jest.fn();
  const mockOnUploadError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders file upload interface correctly', () => {
    renderWithTheme(
      <FileUpload
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    expect(screen.getByText('Upload Ahrefs Keyword File')).toBeInTheDocument();
    expect(screen.getByText('Drag and drop your TSV file here, or click to select')).toBeInTheDocument();
    expect(screen.getByText('Supported formats: TSV (Tab-Separated Values)')).toBeInTheDocument();
    expect(screen.getByText('Maximum file size: 10MB')).toBeInTheDocument();
  });

  it('handles file selection via click', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(
      <FileUpload
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    const file = new File(['keyword\tvolume\tdifficulty\tcpc\tintents\nbest tools\t1000\t50\t2.5\tInformational'], 'keywords.tsv', {
      type: 'text/tab-separated-values',
    });

    const fileInput = screen.getByLabelText('Upload file');
    await user.upload(fileInput, file);

    expect(fileInput.files).toHaveLength(1);
    expect(fileInput.files[0]).toBe(file);
  });

  it('handles drag and drop file upload', async () => {
    renderWithTheme(
      <FileUpload
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    const file = new File(['keyword\tvolume\tdifficulty\tcpc\tintents\nbest tools\t1000\t50\t2.5\tInformational'], 'keywords.tsv', {
      type: 'text/tab-separated-values',
    });

    const dropZone = screen.getByText('Drag and drop your TSV file here, or click to select');
    
    fireEvent.dragOver(dropZone);
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [file],
      },
    });

    expect(screen.getByText('keywords.tsv')).toBeInTheDocument();
  });

  it('validates file type correctly', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(
      <FileUpload
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    const invalidFile = new File(['content'], 'keywords.txt', {
      type: 'text/plain',
    });

    const fileInput = screen.getByLabelText('Upload file');
    await user.upload(fileInput, invalidFile);

    expect(screen.getByText('Invalid file type. Please upload a TSV file.')).toBeInTheDocument();
    expect(mockOnUploadError).toHaveBeenCalledWith('Invalid file type. Please upload a TSV file.');
  });

  it('validates file size correctly', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(
      <FileUpload
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    // Create a file larger than 10MB
    const largeContent = 'x'.repeat(11 * 1024 * 1024); // 11MB
    const largeFile = new File([largeContent], 'large.tsv', {
      type: 'text/tab-separated-values',
    });

    const fileInput = screen.getByLabelText('Upload file');
    await user.upload(fileInput, largeFile);

    expect(screen.getByText('File too large. Maximum size is 10MB.')).toBeInTheDocument();
    expect(mockOnUploadError).toHaveBeenCalledWith('File too large. Maximum size is 10MB.');
  });

  it('uploads file successfully', async () => {
    const user = userEvent.setup();
    
    mockApi.uploadFile.mockResolvedValue({
      file_id: 'test-file-id',
      filename: 'keywords.tsv',
      file_size: 1024,
      status: 'pending',
      message: 'File uploaded successfully'
    });

    renderWithTheme(
      <FileUpload
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    const file = new File(['keyword\tvolume\tdifficulty\tcpc\tintents\nbest tools\t1000\t50\t2.5\tInformational'], 'keywords.tsv', {
      type: 'text/tab-separated-values',
    });

    const fileInput = screen.getByLabelText('Upload file');
    await user.upload(fileInput, file);

    const uploadButton = screen.getByText('Upload File');
    await user.click(uploadButton);

    await waitFor(() => {
      expect(mockApi.uploadFile).toHaveBeenCalledWith(file, 'test-user-id');
      expect(mockOnUploadSuccess).toHaveBeenCalledWith({
        file_id: 'test-file-id',
        filename: 'keywords.tsv',
        file_size: 1024,
        status: 'pending',
        message: 'File uploaded successfully'
      });
    });
  });

  it('handles upload error', async () => {
    const user = userEvent.setup();
    
    mockApi.uploadFile.mockRejectedValue(new Error('Upload failed'));

    renderWithTheme(
      <FileUpload
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    const file = new File(['keyword\tvolume\tdifficulty\tcpc\tintents\nbest tools\t1000\t50\t2.5\tInformational'], 'keywords.tsv', {
      type: 'text/tab-separated-values',
    });

    const fileInput = screen.getByLabelText('Upload file');
    await user.upload(fileInput, file);

    const uploadButton = screen.getByText('Upload File');
    await user.click(uploadButton);

    await waitFor(() => {
      expect(mockOnUploadError).toHaveBeenCalledWith('Upload failed');
    });
  });

  it('shows upload progress', async () => {
    const user = userEvent.setup();
    
    mockApi.uploadFile.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        file_id: 'test-file-id',
        filename: 'keywords.tsv',
        file_size: 1024,
        status: 'pending',
        message: 'File uploaded successfully'
      }), 100))
    );

    renderWithTheme(
      <FileUpload
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    const file = new File(['keyword\tvolume\tdifficulty\tcpc\tintents\nbest tools\t1000\t50\t2.5\tInformational'], 'keywords.tsv', {
      type: 'text/tab-separated-values',
    });

    const fileInput = screen.getByLabelText('Upload file');
    await user.upload(fileInput, file);

    const uploadButton = screen.getByText('Upload File');
    await user.click(uploadButton);

    expect(screen.getByText('Uploading...')).toBeInTheDocument();
    expect(uploadButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.queryByText('Uploading...')).not.toBeInTheDocument();
    });
  });

  it('clears selected file', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(
      <FileUpload
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    const file = new File(['keyword\tvolume\tdifficulty\tcpc\tintents\nbest tools\t1000\t50\t2.5\tInformational'], 'keywords.tsv', {
      type: 'text/tab-separated-values',
    });

    const fileInput = screen.getByLabelText('Upload file');
    await user.upload(fileInput, file);

    expect(screen.getByText('keywords.tsv')).toBeInTheDocument();

    const clearButton = screen.getByText('Clear');
    await user.click(clearButton);

    expect(screen.queryByText('keywords.tsv')).not.toBeInTheDocument();
    expect(screen.getByText('Drag and drop your TSV file here, or click to select')).toBeInTheDocument();
  });

  it('displays file information after selection', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(
      <FileUpload
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    const file = new File(['keyword\tvolume\tdifficulty\tcpc\tintents\nbest tools\t1000\t50\t2.5\tInformational'], 'keywords.tsv', {
      type: 'text/tab-separated-values',
    });

    const fileInput = screen.getByLabelText('Upload file');
    await user.upload(fileInput, file);

    expect(screen.getByText('keywords.tsv')).toBeInTheDocument();
    expect(screen.getByText('1.02 KB')).toBeInTheDocument();
    expect(screen.getByText('text/tab-separated-values')).toBeInTheDocument();
  });

  it('prevents multiple file selection', async () => {
    const user = userEvent.setup();
    
    renderWithTheme(
      <FileUpload
        onUploadSuccess={mockOnUploadSuccess}
        onUploadError={mockOnUploadError}
      />
    );

    const file1 = new File(['content1'], 'keywords1.tsv', {
      type: 'text/tab-separated-values',
    });
    const file2 = new File(['content2'], 'keywords2.tsv', {
      type: 'text/tab-separated-values',
    });

    const fileInput = screen.getByLabelText('Upload file');
    await user.upload(fileInput, [file1, file2]);

    // Should only show the first file
    expect(screen.getByText('keywords1.tsv')).toBeInTheDocument();
    expect(screen.queryByText('keywords2.tsv')).not.toBeInTheDocument();
  });
});
