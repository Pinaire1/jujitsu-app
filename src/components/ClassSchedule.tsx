import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

type ClassEntry = {
  id: string;
  weekday: string;
  start_time: string;
  end_time: string;
  program: string;
};

export default function ClassSchedule() {
  const [schedule, setSchedule] = useState<ClassEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());

  useEffect(() => {
    const fetchSchedule = async () => {
      const { data, error } = await supabase
        .from("class_schedule")
        .select("*")
        .order("weekday")
        .order("start_time");

      if (error) console.error("Error fetching schedule:", error);
      else setSchedule(data || []);

      setLoading(false);
    };

    fetchSchedule();
  }, []);

  const getWeekDays = () => {
    const days = [];
    const start = new Date(currentWeekStart);
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const handlePreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const handleCheckIn = async (scheduleId: string) => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      alert("Please sign in to check in for class.");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const { error } = await supabase.from("class_signins").insert([
      {
        student_id: user.id,
        class_date: today,
        schedule_id: scheduleId,
        signed_in_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Error checking in:", error.message);
      alert("Could not check in for class.");
    } else {
      alert("Successfully checked in for class!");
    }
  };

  const formatTime = (timeStr: string): string => {
    const [hour, minute] = timeStr.split(":");
    const h = parseInt(hour);
    const suffix = h >= 12 ? "PM" : "AM";
    const formattedHour = ((h + 11) % 12) + 1;
    return `${formattedHour}:${minute} ${suffix}`;
  };

  if (loading) return <p>Loading...</p>;

  const weekDays = getWeekDays();

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Class Schedule</h2>
        <div className="flex space-x-2">
          <Button onClick={handlePreviousWeek} variant="outline" size="sm">
            Previous Week
          </Button>
          <Button onClick={handleNextWeek} variant="outline" size="sm">
            Next Week
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {weekDays.map((day) => {
          const dayName = getDayName(day);
          const dayClasses = schedule.filter(
            (entry) => entry.weekday.toLowerCase() === dayName.toLowerCase()
          );

          return (
            <div key={day.toISOString()} className="border-b pb-4">
              <h3 className="text-lg font-semibold mb-2">
                {dayName} ({day.toLocaleDateString()})
              </h3>
              {dayClasses.length > 0 ? (
                <div className="space-y-2">
                  {dayClasses.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-200"
                    >
                      <div>
                        <p className="font-medium">{entry.program}</p>
                        <p className="text-sm text-gray-600">
                          {formatTime(entry.start_time)} -{" "}
                          {formatTime(entry.end_time)}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleCheckIn(entry.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        Check In
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No classes scheduled</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
