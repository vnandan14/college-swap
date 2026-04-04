import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image } from 'lucide-react';
import { uploadImage } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function ImageUpload({ images, setImages, maxFiles = 5 }) {
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (images.length + acceptedFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed`);
      return;
    }
    setUploading(true);
    try {
      const urls = await Promise.all(acceptedFiles.map(f => uploadImage(f)));
      setImages(prev => [...prev, ...urls]);
      toast.success(`${urls.length} image(s) uploaded`);
    } catch (err) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  }, [images, maxFiles, setImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxSize: 5 * 1024 * 1024,
    disabled: uploading || images.length >= maxFiles,
  });

  const removeImage = (idx) => setImages(prev => prev.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      {/* Dropzone */}
      {images.length < maxFiles && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'}
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <Upload size={28} className="mx-auto mb-2 text-gray-400" />
          {uploading
            ? <p className="text-sm text-gray-500">Uploading...</p>
            : <>
                <p className="text-sm font-medium text-gray-700">Drop photos here or click to upload</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · Max 5MB · {images.length}/{maxFiles} uploaded</p>
              </>
          }
        </div>
      )}

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {images.map((url, i) => (
            <div key={url} className="relative aspect-square rounded-lg overflow-hidden group border border-gray-200">
              <img src={url} alt="" className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs text-center py-0.5">Cover</span>
              )}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
