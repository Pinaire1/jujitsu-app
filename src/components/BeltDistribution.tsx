import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { BELT_COLORS, type BeltLevel } from "../lib/colors";

type BeltDistributionProps = {
  refreshTrigger?: number;
};

type BeltCount = {
  belt_level: BeltLevel;
  count: number;
};

export default function BeltDistribution({
  refreshTrigger = 0,
}: BeltDistributionProps) {
  const [beltCounts, setBeltCounts] = useState<BeltCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBeltDistribution = async () => {
      try {
        setLoading(true);

        // Fetch count of students by belt level using raw SQL query
        const { data, error } = await supabase
          .from("students")
          .select("belt_level, count(*)")
          .not("belt_level", "is", null)
          .order("belt_level");

        if (error) throw error;

        // Initialize counts for all belt levels
        const allBeltCounts: BeltCount[] = Object.keys(BELT_COLORS).map(
          (belt) => ({
            belt_level: belt as BeltLevel,
            count: 0,
          })
        );

        // Update counts from data
        if (data) {
          data.forEach((item: any) => {
            const index = allBeltCounts.findIndex(
              (b) => b.belt_level === item.belt_level
            );
            if (index !== -1) {
              allBeltCounts[index].count = parseInt(item.count, 10);
            }
          });
        }

        setBeltCounts(allBeltCounts);
      } catch (err) {
        console.error("Error fetching belt distribution:", err);
        setError("Failed to load belt distribution");
      } finally {
        setLoading(false);
      }
    };

    fetchBeltDistribution();
  }, [refreshTrigger]);

  if (loading) return <div className="p-4">Loading belt distribution...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold mb-4">Belt Level Distribution</h3>

      <div className="space-y-4">
        {beltCounts.map((beltCount) => {
          const beltColor = BELT_COLORS[beltCount.belt_level];
          const percentage =
            beltCounts.reduce((sum, b) => sum + b.count, 0) > 0
              ? (
                  (beltCount.count /
                    beltCounts.reduce((sum, b) => sum + b.count, 0)) *
                  100
                ).toFixed(1)
              : 0;

          return (
            <div key={beltCount.belt_level} className="space-y-1">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div
                    className={`w-4 h-4 rounded-full ${beltColor.bg} mr-2`}
                  ></div>
                  <span>{beltColor.name} Belt</span>
                </div>
                <span className="font-medium">
                  {beltCount.count} ({percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${beltColor.bg}`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
