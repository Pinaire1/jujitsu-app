import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { BELT_COLORS, type BeltLevel } from "../lib/colors";

type ActiveBeltCounterProps = {
  refreshTrigger?: number;
};

type BeltActiveCount = {
  belt_level: BeltLevel;
  active_count: number;
};

export default function ActiveBeltCounter({
  refreshTrigger = 0,
}: ActiveBeltCounterProps) {
  const [activeCounts, setActiveCounts] = useState<BeltActiveCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        setLoading(true);

        // Get active sessions from the last 24 hours
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        // This would be a more complex query in a real app to check actual login sessions
        // For this demo, we're just going to get all users and simulate recent activity
        const { data, error } = await supabase
          .from("students")
          .select("belt_level")
          .not("belt_level", "is", null);

        if (error) throw error;

        // Initialize counts for all belt levels
        const allBeltCounts: BeltActiveCount[] = Object.keys(BELT_COLORS).map(
          (belt) => ({
            belt_level: belt as BeltLevel,
            active_count: 0,
          })
        );

        // Simulate active users by counting some percentage of each belt
        if (data) {
          const beltCounts = data.reduce(
            (counts: Record<string, number>, item) => {
              counts[item.belt_level] = (counts[item.belt_level] || 0) + 1;
              return counts;
            },
            {}
          );

          allBeltCounts.forEach((beltCount) => {
            const totalForBelt = beltCounts[beltCount.belt_level] || 0;
            // Simulate that some percentage are "active" (would be actual login data in real app)
            const activePercentage = Math.random() * 0.8; // Random percentage up to 80%
            beltCount.active_count = Math.round(
              totalForBelt * activePercentage
            );
          });
        }

        setActiveCounts(allBeltCounts);
      } catch (err) {
        console.error("Error fetching active users:", err);
        setError("Failed to load active user counts");
      } finally {
        setLoading(false);
      }
    };

    fetchActiveUsers();
  }, [refreshTrigger]);

  if (loading)
    return (
      <div className="text-center py-2 text-sm">Loading active users...</div>
    );
  if (error)
    return <div className="text-center py-2 text-sm text-red-500">{error}</div>;

  return (
    <div className="grid grid-cols-5 gap-2 mb-4">
      {activeCounts.map((beltCount) => {
        const beltColor = BELT_COLORS[beltCount.belt_level];
        return (
          <div key={beltCount.belt_level} className="text-center">
            <div
              className={`${beltColor.bg} text-white text-sm font-bold py-1 px-2 rounded-full`}
            >
              {beltCount.active_count}
            </div>
            <p className="text-xs mt-1">Active</p>
          </div>
        );
      })}
    </div>
  );
}
