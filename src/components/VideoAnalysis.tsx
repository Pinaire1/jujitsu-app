import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

type VideoAnalysisProps = {
  user: any;
  videoId?: string; // Optional - if we want to show analysis for a specific video
};

type AnalysisInsight = {
  id: string;
  video_id: string;
  timestamp: string;
  tip: string;
  created_at: string;
};

export default function VideoAnalysis({ user, videoId }: VideoAnalysisProps) {
  const [insights, setInsights] = useState<AnalysisInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

      // If a specific video ID is provided, filter for that video
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

  if (loading) {
    return <div className="p-4 text-center">Loading analysis data...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">Error: {error}</div>;
  }

  if (insights.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Video Analysis</h2>
        <p className="text-gray-600">
          No analysis data available yet. Upload a video and request analysis to
          see feedback on your techniques.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Analysis for Your Roll</h2>
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
