import React, { useState, useRef } from 'react';
import { Loader2, ImagePlus } from 'lucide-react';
import { imgbbService } from '../services/imgbbService';

interface ImageUploaderProps {
    onImageUploaded: (url: string) => void;
    onError?: (error: string) => void;
    label?: string;
    description?: string;
    isUploading?: boolean;
    setIsUploading?: (loading: boolean) => void;
    className?: string;
}

export default function ImageUploader({
    onImageUploaded,
    onError,
    label = "Upload Image",
    description = "Click or drag and drop to upload directly.",
    isUploading: externalIsUploading,
    setIsUploading: externalSetIsUploading,
    className = ""
}: ImageUploaderProps) {

    // Fallback internal state if not strictly controlled from above
    const [internalIsUploading, setInternalIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isUploading = externalIsUploading !== undefined ? externalIsUploading : internalIsUploading;
    const setIsUploading = externalSetIsUploading || setInternalIsUploading;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            if (onError) onError("Please select a valid image file (JPG, PNG, WebP).");
            return;
        }

        // ImgBB limit is usually 32MB
        if (file.size > 32 * 1024 * 1024) {
            if (onError) onError("Image size exceeds the 32MB limit.");
            return;
        }

        try {
            setIsUploading(true);
            const url = await imgbbService.uploadImage(file);
            onImageUploaded(url);
        } catch (error: any) {
            console.error("Upload failed", error);
            if (onError) onError(error.message || "Failed to upload image.");
        } finally {
            setIsUploading(false);
            // Reset input so the same file can be uploaded again if needed
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className={`w-full ${className}`}>
            <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
            <div
                className={`relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl transition-colors
                    ${isUploading ? 'border-gaming-600 bg-gaming-900/50 cursor-not-allowed' : 'border-gaming-600 hover:border-gaming-accent bg-gaming-900 cursor-pointer'}
                `}
                onClick={() => !isUploading && fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    disabled={isUploading}
                />

                {isUploading ? (
                    <div className="flex flex-col items-center justify-center text-gaming-accent">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <span className="text-sm font-bold animate-pulse">Uploading...</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-gaming-muted group-hover:text-white transition-colors">
                        <ImagePlus className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                        <p className="text-sm px-4 text-center">{description}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
