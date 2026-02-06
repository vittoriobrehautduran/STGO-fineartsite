"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

interface UploadedFile {
  name: string;
  url: string;
  publicUrl: string;
}

export default function ImageUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      // Filter only image files
      const imageFiles = selectedFiles.filter((file) =>
        file.type.startsWith("image/")
      );
      setFiles((prev) => [...prev, ...imageFiles]);
      setError(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      setError("Por favor selecciona al menos una imagen");
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);
    const uploaded: UploadedFile[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(filePath);

        uploaded.push({
          name: file.name,
          url: filePath,
          publicUrl: publicUrl,
        });

        // Update progress
        setUploadProgress((prev) => ({
          ...prev,
          [file.name]: 100,
        }));
      }

      setUploadedFiles((prev) => [...prev, ...uploaded]);
      setFiles([]);
      setSuccess(`¡${uploaded.length} imagen(es) subida(s) exitosamente!`);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      console.error("Error uploading files:", err);
      setError(err.message || "Error al subir las imágenes");
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setSuccess("URL copiada al portapapeles");
    setTimeout(() => setSuccess(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* File Input */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          disabled={uploading}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <svg
            className="w-12 h-12 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <span className="text-lg font-medium text-gray-700 mb-2">
            Haz clic para seleccionar imágenes
          </span>
          <span className="text-sm text-gray-500">
            o arrastra y suelta las imágenes aquí
          </span>
        </label>
      </div>

      {/* Selected Files Preview */}
      {files.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Imágenes seleccionadas ({files.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Eliminar"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <p className="mt-2 text-xs text-gray-600 truncate">
                  {file.name}
                </p>
                {uploadProgress[file.name] && (
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gray-900 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress[file.name]}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={uploadFiles}
            disabled={uploading || files.length === 0}
            className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {uploading ? "Subiendo..." : `Subir ${files.length} imagen(es)`}
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-4 mt-8">
          <h3 className="text-lg font-semibold text-gray-900">
            Imágenes subidas ({uploadedFiles.length})
          </h3>
          <div className="space-y-4">
            {uploadedFiles.map((file, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={file.publicUrl}
                      alt={file.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="text"
                        value={file.publicUrl}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 bg-gray-50"
                      />
                      <button
                        onClick={() => copyUrl(file.publicUrl)}
                        className="px-4 py-2 bg-gray-900 text-white rounded text-sm font-medium hover:bg-gray-800 transition-colors"
                      >
                        Copiar URL
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

