import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { BELT_COLORS, type BeltLevel } from "../lib/colors";

type CurriculumItem = {
  id: string;
  belt_level: BeltLevel;
  technique_name: string;
  description: string;
  position: string;
  difficulty: number;
};

export default function CurriculumByBelt() {
  const [selectedBelt, setSelectedBelt] = useState<BeltLevel>("WHITE");
  const [selectedBelts, setSelectedBelts] = useState<BeltLevel[]>(["WHITE"]);
  const [showMultipleBelts, setShowMultipleBelts] = useState(false);
  const [curriculumItems, setCurriculumItems] = useState<CurriculumItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurriculum = async () => {
      try {
        setLoading(true);

        if (showMultipleBelts) {
          // Fetch curriculum for multiple belt levels
          // This is useful when you want to show curriculum for several belt levels at once
          const { data, error } = await supabase
            .from("curriculum")
            .select("*")
            .in("belt_level", selectedBelts)
            .order("position", { ascending: true });

          if (error) throw error;
          setCurriculumItems(data || []);
        } else {
          // Original query - fetch curriculum for a single belt level
          const { data, error } = await supabase
            .from("curriculum")
            .select("*")
            .eq("belt_level", selectedBelt)
            .order("position", { ascending: true });

          if (error) throw error;
          setCurriculumItems(data || []);
        }
      } catch (err) {
        console.error("Error fetching curriculum:", err);
        setError("Failed to load curriculum items");
      } finally {
        setLoading(false);
      }
    };

    fetchCurriculum();
  }, [selectedBelt, selectedBelts, showMultipleBelts]);

  // Function to toggle a belt in the multiple selection mode
  const toggleBelt = (belt: BeltLevel) => {
    if (selectedBelts.includes(belt)) {
      // Remove belt if it's already selected
      setSelectedBelts(selectedBelts.filter((b) => b !== belt));
    } else {
      // Add belt if it's not already selected
      setSelectedBelts([...selectedBelts, belt]);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Curriculum by Belt</h3>
        <button
          onClick={() => setShowMultipleBelts(!showMultipleBelts)}
          className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded"
        >
          {showMultipleBelts ? "Single Belt View" : "Multiple Belts View"}
        </button>
      </div>

      {showMultipleBelts ? (
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {Object.entries(BELT_COLORS).map(([belt, colors]) => (
            <button
              key={belt}
              onClick={() => toggleBelt(belt as BeltLevel)}
              className={`px-4 py-2 rounded-md ${
                selectedBelts.includes(belt as BeltLevel)
                  ? `${colors.bg} text-white font-medium shadow-sm`
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {colors.name}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {Object.entries(BELT_COLORS).map(([belt, colors]) => (
            <button
              key={belt}
              onClick={() => setSelectedBelt(belt as BeltLevel)}
              className={`px-4 py-2 rounded-md ${
                selectedBelt === belt
                  ? `${colors.bg} text-white font-medium shadow-sm`
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {colors.name}
            </button>
          ))}
        </div>
      )}

      {/* Render curriculum items */}
      {loading ? (
        <div className="text-center py-4">Loading curriculum...</div>
      ) : error ? (
        <div className="text-red-500 py-4">{error}</div>
      ) : curriculumItems.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <p>
            {showMultipleBelts
              ? "No curriculum items found for selected belt levels"
              : `No curriculum items found for ${BELT_COLORS[selectedBelt].name} belt`}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            The curriculum for this belt level hasn't been added yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {curriculumItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-lg border-l-4 ${
                BELT_COLORS[item.belt_level].border
              } bg-gray-50`}
            >
              <div className="flex justify-between">
                <h4 className="font-medium text-lg">{item.technique_name}</h4>
                {showMultipleBelts && (
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      BELT_COLORS[item.belt_level].bg
                    } text-white`}
                  >
                    {BELT_COLORS[item.belt_level].name}
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-2">
                Position: {item.position}
              </p>
              <p>{item.description}</p>
              <div className="mt-2 flex items-center">
                <span className="text-sm text-gray-500 mr-2">Difficulty:</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full mx-0.5 ${
                        i < item.difficulty
                          ? BELT_COLORS[item.belt_level].bg
                          : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
