import { useAuth } from "../lib/AuthContext";
import CurriculumGenerator from "../components/CurriculumGenerator";
import ActiveBeltCounter from "../components/ActiveBeltCounter";
import { useState } from "react";
import { Button } from "../components/ui/button";

export default function ClassPlanner() {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Class Planner</h1>
        <Button onClick={handleRefresh}>Refresh Data</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              Today's Smart Curriculum
            </h2>
            <p className="text-gray-600 mb-6">
              Automatically generated curriculum based on belt levels of today's
              active students. The system selects techniques appropriate for the
              mix of students present.
            </p>
            <CurriculumGenerator />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Active Students</h2>
            <p className="text-gray-600 mb-4">
              Current active students by belt level. The curriculum is optimized
              for these belt distributions.
            </p>
            <ActiveBeltCounter refreshTrigger={refreshTrigger} />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">How It Works</h2>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <h3 className="font-medium">Adaptive Difficulty</h3>
                <p className="text-sm text-gray-600">
                  The system limits technique difficulty based on the lowest
                  belt level present.
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <h3 className="font-medium">Belt Weighting</h3>
                <p className="text-sm text-gray-600">
                  Techniques are chosen to match the weighted average belt level
                  of all students.
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <h3 className="font-medium">Dynamic Updates</h3>
                <p className="text-sm text-gray-600">
                  The curriculum automatically updates when new students sign
                  in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
