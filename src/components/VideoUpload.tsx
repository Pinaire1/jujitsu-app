import { useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import { Button } from "./ui/button";

type VideoUploadProps = {
  user: any;
  onAnalysisComplete?: (feedback: string) => void;
};

export default function VideoUpload({
  user,
  onAnalysisComplete,
}: VideoUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [analysisPrompt, setAnalysisPrompt] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("video/")) {
      setFile(droppedFile);
    } else {
      setUploadError("Please drop a valid video file");
    }
  }, []);

  const analyzeVideo = async (videoId: string, videoUrl: string) => {
    try {
      setAnalyzing(true);
      setAnalysisStatus("Starting analysis...");

      // Get video path from URL
      const videoPath = videoUrl.split("/videos/")[1];

      // Generate signed URL
      const { data: signedData } = await supabase.storage
        .from("videos")
        .createSignedUrl(videoPath, 3600);

      const signedUrl = signedData?.signedUrl;

      // Send to backend for analysis
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_url: signedUrl,
          user_id: user.id,
          video_id: videoId,
          analysis_prompt: analysisPrompt,
        }),
      });

      const result = await res.json();

      // Save insights to Supabase
      for (const insight of result.insights) {
        await supabase.from("video_analysis").insert({
          user_id: user.id,
          video_id: videoId,
          timestamp: insight.timestamp,
          tip: insight.tip,
        });
      }

      // Update UI with feedback
      const feedback = result.insights
        .map((i: any) => `${i.timestamp}: ${i.tip}`)
        .join("\n\n");

      if (onAnalysisComplete) {
        onAnalysisComplete(feedback);
      }

      setAnalysisStatus("Analysis complete!");
    } catch (error: any) {
      console.error("Error analyzing video:", error);
      setAnalysisStatus(
        "Analysis failed: " + (error.message || "Unknown error")
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    try {
      setUploading(true);
      setUploadError("");
      setProgress(0);
      setAnalysisStatus("");

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
      const { data: videoData, error: dbError } = await supabase
        .from("training_videos")
        .insert([
          {
            user_id: user.id,
            title,
            description,
            analysis_prompt: analysisPrompt,
            video_url: publicUrl,
            created_at: new Date(),
          },
        ])
        .select()
        .single();

      if (dbError) throw dbError;

      // Success!
      setProgress(100);
      setUploadSuccess(true);

      // Start analysis
      if (videoData) {
        await analyzeVideo(videoData.id, publicUrl);
      }

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

        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
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

        {(uploading || analyzing) && (
          <div className="mt-2 space-y-2">
            {uploading && (
              <div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-center text-sm mt-1">{progress}% uploaded</p>
              </div>
            )}
            {analyzing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-blue-700">{analysisStatus}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <Button
          type="submit"
          disabled={!file || uploading || analyzing}
          className="w-full"
        >
          {uploading
            ? "Uploading..."
            : analyzing
            ? "Analyzing..."
            : "Upload & Analyze"}
        </Button>
      </form>
    </div>
  );
}
