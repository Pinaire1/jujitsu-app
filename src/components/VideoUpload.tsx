import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Button } from "./ui/button";

type VideoUploadProps = {
  user: any;
};

export default function VideoUpload({ user }: VideoUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [analysisPrompt, setAnalysisPrompt] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      setUploading(true);
      setUploadError("");
      setProgress(0);

      // Create a unique file path
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Math.random()
        .toString(36)
        .substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `training-videos/${fileName}`;

      // Set progress to 50% - we'll simulate upload progress
      setProgress(50);

      // Upload the file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from("videos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      // Set progress to 75%
      setProgress(75);

      if (uploadError) throw uploadError;

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("videos").getPublicUrl(filePath);

      // Save the video record to the database
      const { error: dbError } = await supabase.from("training_videos").insert([
        {
          user_id: user.id,
          title,
          description,
          analysis_prompt: analysisPrompt,
          video_url: publicUrl,
          created_at: new Date(),
        },
      ]);

      if (dbError) throw dbError;

      // Success!
      setProgress(100);
      setUploadSuccess(true);
      setFile(null);
      setTitle("");
      setDescription("");
      setAnalysisPrompt("");

      // Reset success message after 5 seconds
      setTimeout(() => {
        setUploadSuccess(false);
      }, 5000);
    } catch (error: any) {
      console.error("Error uploading video:", error);
      setUploadError(error.message || "Failed to upload video");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {uploadSuccess && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            Video successfully uploaded!
          </div>
        )}
        {uploadError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {uploadError}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Video Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            What would you like the AI to analyze in this video?
          </label>
          <textarea
            value={analysisPrompt}
            onChange={(e) => setAnalysisPrompt(e.target.value)}
            placeholder="Example: Please identify any guard passes, sweeps, and submission attempts in this video. Also point out any technical mistakes in my form."
            rows={3}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Be specific about what techniques, positions, or aspects you want
            the AI to analyze.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
            id="video-upload"
            required
          />
          <label htmlFor="video-upload" className="cursor-pointer">
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
              <p className="text-xs text-gray-500">
                MP4, MOV or WEBM up to 1GB
              </p>
            </div>
          </label>
          {file && (
            <div className="mt-4 text-sm text-gray-500">
              Selected file: {file.name}
            </div>
          )}
        </div>

        {uploading && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-center text-sm mt-1">{progress}% complete</p>
          </div>
        )}

        <Button type="submit" disabled={!file || uploading} className="w-full">
          {uploading ? "Uploading..." : "Upload Video"}
        </Button>
      </form>
    </div>
  );
}
