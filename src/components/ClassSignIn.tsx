import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ClassSignIn() {
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null
  );
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch current user and their matching student record
  useEffect(() => {
    const fetchUserAndStudents = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      setUserId(userId ?? null);

      // Fetch students matching this user
      const { data, error } = await supabase
        .from("students")
        .select("id, name")
        .eq("auth_user_id", userId);

      if (error) {
        console.error("Error fetching students:", error.message);
      } else {
        setStudents(data ?? []);
        if (data.length === 1) setSelectedStudentId(data[0].id);
      }
    };

    fetchUserAndStudents();
  }, []);

  const handleSignIn = async () => {
    if (!selectedStudentId) return alert("Please select a student");

    const { error } = await supabase.from("class_signins").insert([
      {
        student_id: selectedStudentId,
        class_date: new Date().toISOString().slice(0, 10),
        signed_in_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Error signing in:", error.message);
      alert("Sign-in failed.");
    } else {
      alert("Signed in successfully!");
    }
  };

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <h2 className="text-lg font-bold">Sign In to Class</h2>

      <Select
        value={selectedStudentId ?? ""}
        onValueChange={setSelectedStudentId}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a student" />
        </SelectTrigger>
        <SelectContent>
          {students.map((student) => (
            <SelectItem key={student.id} value={student.id}>
              {student.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button onClick={handleSignIn} disabled={!selectedStudentId}>
        Sign In
      </Button>
    </div>
  );
}
