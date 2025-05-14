import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

// Define belt hierarchy
const BELTS = ["WHITE", "BLUE", "PURPLE", "BROWN", "BLACK"] as const;

type BeltCount = { belt_level: string; count: number };
type Technique = {
  belt_level: string;
  technique_name: string;
  description: string;
  position: string;
  difficulty: number;
};

export default function CurriculumGenerator() {
  const [beltCounts, setBeltCounts] = useState<BeltCount[]>([]);
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [customCurriculum, setCustomCurriculum] = useState<Technique[]>([]);

  // Fetch today's belt distribution and full curriculum
  useEffect(() => {
    async function fetchData() {
      const { data: belts } = await supabase
        .from("todays_signed_in_belts")
        .select("*");
      const { data: curriculum } = await supabase
        .from("curriculum")
        .select("*");
      if (belts) setBeltCounts(belts);
      if (curriculum) setTechniques(curriculum as Technique[]);
    }
    fetchData();
  }, []);

  // Generate custom curriculum whenever data changes
  useEffect(() => {
    if (!beltCounts.length || !techniques.length) return;

    // Extract present belts
    const presentBelts = beltCounts.map((b) => b.belt_level);

    // Determine lowest belt by hierarchy index
    const lowestIndex = Math.min(
      ...presentBelts.map((b) => BELTS.indexOf(b as any))
    );

    // Set a difficulty cutoff: beginners capped lower
    // If white present (index 0) -> max difficulty 2, else difficulty <= lowestIndex + 2
    const difficultyCutoff = lowestIndex === 0 ? 2 : lowestIndex + 2;

    // Compute weighted average belt index
    const totalMembers = beltCounts.reduce((sum, b) => sum + b.count, 0);
    const avgIndex =
      beltCounts.reduce(
        (sum, b) => sum + BELTS.indexOf(b.belt_level as any) * b.count,
        0
      ) / totalMembers;

    // Filter and sort techniques
    const filtered = techniques
      .filter(
        (t) =>
          presentBelts.includes(t.belt_level) &&
          t.difficulty <= difficultyCutoff
      )
      .sort((a, b) => {
        const da = Math.abs(BELTS.indexOf(a.belt_level as any) - avgIndex);
        const db = Math.abs(BELTS.indexOf(b.belt_level as any) - avgIndex);
        if (da !== db) return da - db;
        return a.difficulty - b.difficulty;
      });

    setCustomCurriculum(filtered);
  }, [beltCounts, techniques]);

  return (
    <div className="space-y-4">
      {customCurriculum.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-500">
            No curriculum generated yet. Check if there are active students.
          </p>
        </div>
      ) : (
        customCurriculum.map((t, idx) => (
          <div
            key={idx}
            className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500"
          >
            <h3 className="text-lg font-semibold flex justify-between">
              {t.technique_name}
              <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                {t.belt_level} Belt
              </span>
            </h3>
            <div className="mt-2">
              <p>{t.description}</p>
              <div className="mt-3 flex justify-between text-sm text-gray-600">
                <span>Position: {t.position}</span>
                <span>Difficulty: {t.difficulty}</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
