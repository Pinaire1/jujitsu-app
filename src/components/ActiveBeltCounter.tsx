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

        // Use the todays_signed_in_belts table for real data
        const { data, error } = await supabase
          .from("todays_signed_in_belts")
          .select("*");

        if (error) throw error;

        // Initialize counts for all belt levels
        const allBeltCounts: BeltActiveCount[] = Object.keys(BELT_COLORS).map(
          (belt) => ({
            belt_level: belt as BeltLevel,
            active_count: 0,
          })
        );

        // Process the actual data from todays_signed_in_belts
        if (data && data.length > 0) {
          data.forEach((item) => {
            const beltIndex = allBeltCounts.findIndex(
              (b) => b.belt_level === item.belt_level
            );
            if (beltIndex !== -1) {
              allBeltCounts[beltIndex].active_count = item.count || 1;
            }
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
