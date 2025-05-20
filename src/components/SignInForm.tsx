import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export default function SignInForm() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSignIn = async () => {
    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // First, find the student
      const { data: student, error: studentError } = await supabase
        .from("students")
        .select("*")
        .eq("name", name)
        .single();

      if (studentError || !student) {
        setError("Student not found. Please check your name and try again.");
        return;
      }

      // Then, record the sign-in
      const { error: signInError } = await supabase
        .from("class_signins")
        .insert([
          {
            student_id: student.id,
            class_date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
            signed_in_at: new Date().toISOString(),
          },
        ]);

      if (signInError) {
        throw signInError;
      }

      setSuccess(true);
      setName("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error("Error signing in:", error);
      setError(error.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          Signed in successfully!
        </div>
      )}

      <Input
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={loading}
      />
      <Button onClick={handleSignIn} disabled={loading}>
        {loading ? "Signing in..." : "Sign In"}
      </Button>
    </div>
  );
}
