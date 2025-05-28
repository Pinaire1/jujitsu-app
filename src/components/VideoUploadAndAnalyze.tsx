import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

// Init Supabase client
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface VideoUploadAndAnalyzeProps {
  userId: string;
}

const VideoUploadAndAnalyze: React.FC<VideoUploadAndAnalyzeProps> = ({
  userId,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadAndAnalyze = async () => {
    if (!file || !userId) return;

    setUploading(true);
    setMessage("");

    const fileName = `${userId}/${uuidv4()}-${file.name}`;
    const bucket = "videos";

    // Step 1: Upload to Supabase
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (uploadError) {
      setMessage("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    // Step 2: Create signed URL
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(fileName, 3600);

    if (urlError || !signedUrlData?.signedUrl) {
      setMessage("Failed to generate signed URL");
      setUploading(false);
      return;
    }

    const videoUrl = signedUrlData.signedUrl;

    // Step 3: Call FastAPI backend
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_url: videoUrl,
          user_id: userId,
          video_id: fileName,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Video uploaded and analysis started successfully!");
      } else {
        setMessage("Error: " + data.detail);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setMessage("Server error: " + errorMessage);
    }

    setUploading(false);
  };

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <button
        onClick={handleUploadAndAnalyze}
        disabled={uploading || !file}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {uploading ? "Uploading..." : "Upload & Analyze"}
      </button>
      {message && <p className="text-sm text-gray-700">{message}</p>}
    </div>
  );
};

export default VideoUploadAndAnalyze;
