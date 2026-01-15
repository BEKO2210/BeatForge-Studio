import { useState, useRef, useCallback } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import './AudioUpload.css';

const ACCEPTED_TYPES = '.mp3,.wav,audio/mpeg,audio/wav';

interface AudioUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

/**
 * AudioUpload - Drag-and-drop zone with file picker fallback for audio files
 */
export function AudioUpload({ onFileSelect, disabled = false }: AudioUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndSelectFile = useCallback((file: File) => {
    // Validate file type by MIME or extension
    const validMime = file.type === 'audio/mpeg' || file.type === 'audio/wav' || file.type === 'audio/wave' || file.type === 'audio/x-wav';
    const fileName = file.name.toLowerCase();
    const validExtension = fileName.endsWith('.mp3') || fileName.endsWith('.wav');

    if (validMime || validExtension) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file) {
        validateAndSelectFile(file);
      }
    }
  }, [disabled, validateAndSelectFile]);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file) {
        validateAndSelectFile(file);
      }
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [validateAndSelectFile]);

  return (
    <div
      className={`audio-upload ${isDragging ? 'audio-upload--dragging' : ''} ${disabled ? 'audio-upload--disabled' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
      aria-label="Upload audio file"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        onChange={handleFileChange}
        className="audio-upload__input"
        disabled={disabled}
        aria-hidden="true"
      />
      <div className="audio-upload__content">
        {disabled ? (
          <>
            <div className="audio-upload__icon audio-upload__icon--loading">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeDasharray="40" strokeDashoffset="10">
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 12 12"
                    to="360 12 12"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>
            </div>
            <p className="audio-upload__text">Loading audio...</p>
          </>
        ) : (
          <>
            <div className="audio-upload__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </div>
            <p className="audio-upload__text">
              {isDragging ? 'Drop your audio file here' : 'Drag & drop audio file or click to browse'}
            </p>
            <p className="audio-upload__hint">Supports MP3 and WAV</p>
          </>
        )}
      </div>
    </div>
  );
}
