import React, { useState } from "react";
import axios from "axios";
import { Button } from "./ui/button";

interface DirectVideoUploadProps {
  userId?: string;
  onUploadComplete?: (response: any) => void;
}

const DirectVideoUpload: React.FC<DirectVideoUploadProps> = ({
  userId,
  onUploadComplete,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null); // Clear any previous errors
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);
      if (userId) {
        formData.append("user_id", userId);
      }

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await axios.post(`${apiUrl}/upload-video/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFeedback(res.data);
      if (onUploadComplete) {
        onUploadComplete(res.data);
      }
    } catch (error: any) {
      console.error("Upload failed:", error);
      setError(
        error.response?.data?.detail || error.message || "Upload failed"
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
          id="direct-video-upload"
        />
        <label htmlFor="direct-video-upload" className="cursor-pointer">
          <div className="flex flex-col items-center justify-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H8m36-12h-4"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mt-2 flex text-sm text-gray-600">
              <span className="relative rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                Upload a video
              </span>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">MP4, MOV or WEBM up to 1GB</p>
          </div>
        </label>
        {file && (
          <div className="mt-4 text-sm text-gray-500">
            Selected file: {file.name}
          </div>
        )}
      </div>

      <Button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full"
      >
        {uploading ? "Uploading..." : "Upload & Analyze"}
      </Button>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {feedback && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          <p className="font-medium">Upload Successful!</p>
          <p className="text-sm">{feedback.message}</p>
        </div>
      )}
    </div>
  );
};

export default DirectVideoUpload;
