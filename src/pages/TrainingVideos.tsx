import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import VideoUpload from "../components/VideoUpload";
import VideoAnalysis from "../components/VideoAnalysis";
import { useAuth } from "../lib/AuthContext";

type TrainingVideo = {
  id: string;
  title: string;
  technique: string;
  video_url: string;
  created_at: string;
  description?: string;
};

export default function TrainingVideos() {
  const { user } = useAuth();
  const [videos, setVideos] = useState<TrainingVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserVideos();
    }
  }, [user]);

  const fetchUserVideos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("training_videos")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVideos(data || []);

      // Select the first video if one exists and none is selected
      if (data && data.length > 0 && !selectedVideo) {
        setSelectedVideo(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div
        className="w-full h-2"
        style={{
          background:
            "linear-gradient(to right, #f3f4f6, #3b82f6, #8b5cf6, #92400e, #111827)",
        }}
      ></div>
      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center relative py-4">
          <span className="relative z-10">Your Training Videos</span>
          <div
            className="absolute bottom-0 left-0 w-full h-1 rounded"
            style={{
              background:
                "linear-gradient(to right, #f3f4f6, #3b82f6, #8b5cf6, #92400e, #111827)",
            }}
          ></div>
        </h1>

        {user ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Upload Section */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Upload New Video</h2>
                <VideoUpload user={user} />
              </div>
            </div>

            {/* Video List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Your Videos</h2>
                {loading ? (
                  <p>Loading videos...</p>
                ) : videos.length > 0 ? (
                  <div className="space-y-3">
                    {videos.map((video) => (
                      <div
                        key={video.id}
                        className={`p-3 rounded cursor-pointer transition-colors ${
                          selectedVideo === video.id
                            ? "bg-blue-50 border border-blue-200"
                            : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                        }`}
                        onClick={() => setSelectedVideo(video.id)}
                      >
                        <h3 className="font-medium">{video.title}</h3>
                        <p className="text-sm text-gray-500">
                          {video.technique}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(video.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No videos uploaded yet.</p>
                )}
              </div>
            </div>

            {/* Video Player and Analysis */}
            <div className="lg:col-span-2">
              {selectedVideo && videos.length > 0 ? (
                <>
                  <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">
                      Video Playback
                    </h2>
                    {videos.find((v) => v.id === selectedVideo) && (
                      <>
                        <div className="aspect-w-16 aspect-h-9 mb-4">
                          <video
                            src={
                              videos.find((v) => v.id === selectedVideo)
                                ?.video_url
                            }
                            controls
                            className="rounded-md w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="font-medium text-lg">
                          {videos.find((v) => v.id === selectedVideo)?.title}
                        </h3>
                        <p className="text-gray-700 mt-2">
                          {
                            videos.find((v) => v.id === selectedVideo)
                              ?.description
                          }
                        </p>
                      </>
                    )}
                  </div>

                  {/* Video Analysis Section */}
                  <VideoAnalysis user={user} videoId={selectedVideo} />
                </>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-64">
                  <p className="text-gray-500">
                    {videos.length > 0
                      ? "Select a video to view"
                      : "Upload a video to get started"}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p>Loading user...</p>
          </div>
        )}
      </div>
    </div>
  );
}
