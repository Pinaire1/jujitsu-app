import { useAuth } from "../lib/AuthContext";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { Button } from "../components/ui/button";
import BeltDistribution from "../components/BeltDistribution";
import CurriculumByBelt from "../components/CurriculumByBelt";
import ActiveBeltCounter from "../components/ActiveBeltCounter";
import TechniqueCard from "../components/TechniqueCard";
import { BELT_COLORS } from "../lib/colors";

export default function Home() {
  const { user, signOut } = useAuth();
  const [classSessions, setClassSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUserSessions();
    }
  }, [user]);

  const fetchUserSessions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("class_signins")
        .select("*, students(*)")
        .eq("student_id", user?.id);

      if (error) throw error;
      setClassSessions(data || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
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
        <h1 className="text-4xl font-bold mb-6 text-center relative py-4">
          <span className="relative z-10">Jujitsu Training Tracker</span>
          <div
            className="absolute bottom-0 left-0 w-full h-1 rounded"
            style={{
              background:
                "linear-gradient(to right, #f3f4f6, #3b82f6, #8b5cf6, #92400e, #111827)",
            }}
          ></div>
        </h1>

        {user ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">
                    Welcome, {user.email}
                  </h2>
                  <Button onClick={() => signOut()}>Sign Out</Button>
                </div>

                <div className="my-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Your Training Sessions
                  </h3>
                  {loading ? (
                    <p>Loading sessions...</p>
                  ) : classSessions.length > 0 ? (
                    <ul className="space-y-2">
                      {classSessions.map((session) => (
                        <li
                          key={session.id}
                          className="p-3 bg-gray-50 rounded border border-gray-200"
                        >
                          <p className="font-medium">
                            Date:{" "}
                            {new Date(session.class_date).toLocaleDateString()}
                          </p>
                          <p className="text-gray-600">
                            Time:{" "}
                            {new Date(
                              session.signed_in_at
                            ).toLocaleTimeString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No training sessions yet.</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Technique Showcase
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Auto-rotating jiu-jitsu techniques to study and practice:
                </p>
                <TechniqueCard />
              </div>

              <CurriculumByBelt />
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Statistics</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="text-xs"
                >
                  Refresh Data
                </Button>
              </div>
              <BeltDistribution refreshTrigger={refreshTrigger} />

              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-semibold mb-3">Belt Progression</h3>
                <div className="space-y-2">
                  {Object.entries(BELT_COLORS).map(([belt, colors]) => (
                    <div
                      key={belt}
                      className={`p-3 rounded-md ${colors.bg} text-white flex justify-between items-center`}
                    >
                      <span>{colors.name} Belt</span>
                      <span className="text-xs px-2 py-1 bg-white bg-opacity-30 rounded">
                        {belt === "WHITE"
                          ? "Beginner"
                          : belt === "BLUE"
                          ? "Intermediate"
                          : belt === "PURPLE"
                          ? "Advanced"
                          : belt === "BROWN"
                          ? "Expert"
                          : "Master"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-semibold mb-3">Active Users</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Currently logged-in users by belt level:
                </p>
                <ActiveBeltCounter refreshTrigger={refreshTrigger} />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 text-center max-w-2xl mx-auto">
            <div
              className="bg-white rounded-lg shadow-md p-8 border-t-4"
              style={{
                borderImage:
                  "linear-gradient(to right, #f3f4f6, #3b82f6, #8b5cf6, #92400e, #111827) 1",
              }}
            >
              <p className="text-xl mb-6">
                Track your jujitsu training progress and manage your sessions.
              </p>
              <p className="mb-4 text-gray-600">
                Sign in to access your personal dashboard and view your training
                history.
              </p>

              <div className="grid grid-cols-5 gap-4 my-8">
                {Object.entries(BELT_COLORS).map(([belt, colors]) => (
                  <div key={belt} className="text-center">
                    <div
                      className={`w-16 h-16 rounded-full ${colors.bg} mx-auto mb-2`}
                    ></div>
                    <p className="text-sm font-medium">{colors.name}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="font-medium mb-3">Active Members Now</h3>
                <ActiveBeltCounter refreshTrigger={refreshTrigger} />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">
                Jiu-jitsu Techniques
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Explore these techniques and combinations. Sign up to track your
                progress!
              </p>
              <TechniqueCard />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
