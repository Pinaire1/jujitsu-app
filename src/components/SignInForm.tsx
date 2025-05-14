import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export default function SignInForm() {
  const [name, setName] = useState("");

  const handleSignIn = async () => {
    const { data: student } = await supabase
      .from("students")
      .select("*")
      .eq("name", name)
      .single();

    if (!student) {
      alert("Student not found");
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    await supabase.from("class_signins").insert([
      {
        student_id: student.id,
        class_date: today,
        signed_in_at: new Date().toISOString(),
      },
    ]);

    alert("Signed in!");
  };

  return (
    <div className="p-4 space-y-2">
      <Input
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Button onClick={handleSignIn}>Sign In</Button>
    </div>
  );
}
