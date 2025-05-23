import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { Button } from "./ui/button";

type VideoAnalysisProps = {
  user: any;
  videoId?: string;
  onAnalysisComplete?: (feedback: string) => void;
};

type AnalysisInsight = {
  id: string;
  video_id: string;
  timestamp: string;
  tip: string;
  created_at: string;
};

export default function VideoAnalysis({
  user,
  videoId,
  onAnalysisComplete,
}: VideoAnalysisProps) {
  const [insights, setInsights] = useState<AnalysisInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchAnalysisData();
  }, [user, videoId]);

  const fetchAnalysisData = async () => {
    try {
      setLoading(true);
      setError("");

      let query = supabase
        .from("video_analysis")
        .select("*")
        .eq("user_id", user.id);

      if (videoId) {
        query = query.eq("video_id", videoId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setInsights(data || []);
    } catch (err: any) {
      console.error("Error fetching video analysis:", err);
      setError(err.message || "Failed to load analysis data");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeVideo = async () => {
    if (!videoId) return;

    try {
      setAnalyzing(true);
      setError("");

      // 1. Get video path from DB
      const { data: videoData } = await supabase
        .from("training_videos")
        .select("video_url")
        .eq("id", videoId)
        .single();

      const videoPath = videoData?.video_url.split("/videos/")[1]; // just the path

      // 2. Generate signed URL
      const { data: signedData } = await supabase.storage
        .from("videos")
        .createSignedUrl(videoPath, 3600);

      const signedUrl = signedData?.signedUrl;

      // 3. Send to backend
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_url: signedUrl,
          user_id: user.id,
          video_id: videoId,
        }),
      });

      const result = await res.json();

      // 4. Save insights to Supabase
      for (const insight of result.insights) {
        await supabase.from("video_analysis").insert({
          user_id: user.id,
          video_id: videoId,
          timestamp: insight.timestamp,
          tip: insight.tip,
        });
      }

      // 5. Update UI
      const feedback = result.insights
        .map((i: any) => `${i.timestamp}: ${i.tip}`)
        .join("\n\n");

      if (onAnalysisComplete) onAnalysisComplete(feedback);
      await fetchAnalysisData();
    } catch (err: any) {
      console.error("Error analyzing video:", err);
      setError(err.message || "Failed to analyze video");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading analysis data...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">Error: {error}</div>;
  }

  if (insights.length === 0) {
    return (
      <div className="text-center">
        <p className="text-gray-600 mb-4">
          No analysis data available yet. Click the button below to analyze your
          video.
        </p>
        <Button
          onClick={handleAnalyzeVideo}
          disabled={analyzing}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {analyzing ? "Analyzing..." : "Analyze Video"}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Analysis Results</h3>
        <Button
          onClick={handleAnalyzeVideo}
          disabled={analyzing}
          variant="outline"
          size="sm"
        >
          {analyzing ? "Analyzing..." : "Re-analyze"}
        </Button>
      </div>
      <div className="space-y-4">
        {insights.map((insight, i) => (
          <div
            key={i}
            className="p-3 bg-gray-50 border border-gray-200 rounded-md"
          >
            <p>
              <strong className="text-blue-600">{insight.timestamp}</strong>:{" "}
              {insight.tip}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
