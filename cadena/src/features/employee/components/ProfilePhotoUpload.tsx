import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import avatar from "@/assets/avatar.jpg";
import { ENV } from "@/config/env";

interface ProfilePhotoUploadProps {
  readonly currentPhotoUrl: string;
  readonly previewUrl: string | null;
  readonly onFileSelect: (file: File) => void;
}

export default function ProfilePhotoUpload({
  currentPhotoUrl,
  previewUrl,
  onFileSelect,
}: ProfilePhotoUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/gif": [] },
    maxSize: 2 * 1024 * 1024, // 2MB
    multiple: false,
  });

  const displayUrl = previewUrl
    ? previewUrl
    : currentPhotoUrl
      ? `${ENV.API_BASE_URL}${currentPhotoUrl}`
      : avatar;

  return (
    <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10 flex flex-col items-center text-center">
      <div
        {...getRootProps()}
        className="relative group cursor-pointer mb-6"
      >
        <input {...getInputProps()} />
        <div
          className={`w-32 h-32 rounded-full overflow-hidden border-4 transition-transform duration-300 group-hover:scale-105 ${
            isDragActive
              ? "border-primary ring-4 ring-primary/20"
              : "border-surface-container-low"
          }`}
        >
          <img
            alt="Current Profile Photo"
            className="w-full h-full object-cover"
            src={displayUrl}
          />
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="material-symbols-outlined text-white text-3xl">
            photo_camera
          </span>
        </div>
      </div>
      <button
        type="button"
        className="text-primary font-semibold text-sm hover:underline decoration-2 underline-offset-4 cursor-pointer"
        onClick={() => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/jpeg,image/png,image/gif";
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) onFileSelect(file);
          };
          input.click();
        }}
      >
        Change Photo
      </button>
      <p className="text-xs text-on-surface-variant mt-4 leading-relaxed">
        JPG, GIF or PNG.
        <br />
        Max size of 2MB.
      </p>
    </section>
  );
}
