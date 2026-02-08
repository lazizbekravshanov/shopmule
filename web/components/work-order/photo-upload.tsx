'use client';

import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Camera, Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PhotoUploadProps {
  workOrderId: string;
  onUpload?: (urls: string[]) => void;
  existingPhotos?: string[];
}

export function PhotoUpload({
  workOrderId,
  onUpload,
  existingPhotos = [],
}: PhotoUploadProps) {
  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith('image/')) {
          continue;
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          setError('Some files were too large (max 10MB)');
          continue;
        }

        // Create FormData for upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('workOrderId', workOrderId);

        // Upload to API
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        const data = await response.json();
        uploadedUrls.push(data.url);
      }

      const newPhotos = [...photos, ...uploadedUrls];
      setPhotos(newPhotos);
      onUpload?.(newPhotos);
    } catch (err) {
      setError('Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    onUpload?.(newPhotos);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
        className="hidden"
      />

      {/* Upload Zone */}
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-[#ee7a14] bg-orange-50 dark:bg-orange-900/20'
            : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600',
          uploading && 'pointer-events-none opacity-50'
        )}
      >
        <div className="flex flex-col items-center gap-2">
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 text-neutral-400 animate-spin" />
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Uploading...</p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Camera className="h-8 w-8 text-neutral-400" />
                <Upload className="h-8 w-8 text-neutral-400" />
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {isDragActive
                  ? 'Drop photos here'
                  : 'Drag & drop photos, or click to select'}
              </p>
              <p className="text-xs text-neutral-400">
                PNG, JPG, GIF up to 10MB
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800"
            >
              <img
                src={photo}
                alt={`Work order photo ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removePhoto(index);
                }}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {photos.length === 0 && !uploading && (
        <div className="text-center py-4">
          <ImageIcon className="h-12 w-12 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
          <p className="text-sm text-neutral-400">No photos yet</p>
        </div>
      )}
    </div>
  );
}
