import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useAuth } from "../lib/AuthContext";
import { supabase } from "../lib/supabaseClient";
import { BELT_COLORS, type BeltLevel } from "../lib/colors";

export default function Profile() {
  const [name, setName] = useState("");
  const [beltLevel, setBeltLevel] = useState<BeltLevel>("WHITE");
  const [loading, setLoading] = useState(true);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Fetch user profile data
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("students")
          .select("name, belt_level, email")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (data) {
          setName(data.name || "");
          setBeltLevel((data.belt_level || "WHITE") as BeltLevel);
          setEmail(data.email || user.email || "");
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error);
        setError(error.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const checkEmailExists = async (email: string) => {
    const { data, error } = await supabase
      .from("students")
      .select("id")
      .eq("email", email)
      .neq("id", user?.id)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    return !!data;
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Please enter a valid email address");
      }

      // Check if email is already in use by another user
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        throw new Error("This email address is already in use by another user");
      }

      // First, check if the student record exists
      const { data: existingStudent, error: checkError } = await supabase
        .from("students")
        .select("id")
        .eq("id", user?.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (!existingStudent) {
        // If student doesn't exist, create a new record
        const { error: insertError } = await supabase.from("students").insert([
          {
            id: user?.id,
            name,
            belt_level: beltLevel,
            email: email,
          },
        ]);

        if (insertError) throw insertError;
      } else {
        // If student exists, update the record
        const { error: updateError } = await supabase
          .from("students")
          .update({ name, belt_level: beltLevel, email })
          .eq("id", user?.id);

        if (updateError) throw updateError;
      }

      // Update todays_signed_in_belts
      const today = new Date().toISOString().split("T")[0];
      const { error: beltError } = await supabase
        .from("todays_signed_in_belts")
        .upsert(
          {
            belt_level: beltLevel,
            count: 1,
            date: today,
          },
          {
            onConflict: "belt_level,date",
          }
        );

      if (beltError) {
        console.error("Error updating todays_signed_in_belts:", beltError);
      }

      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setError(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {updateSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Profile updated successfully!
        </div>
      )}

      <form onSubmit={updateProfile} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={loading}
          />
          <p className="text-sm text-gray-500 mt-1">
            This email will be used for your account
          </p>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Full Name
          </label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">
            Your Belt Level
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(BELT_COLORS).map(([belt, colors]) => (
              <div
                key={belt}
                onClick={() => !loading && setBeltLevel(belt as BeltLevel)}
                className={`
                  p-3 rounded-md cursor-pointer border-2 transition-all
                  ${
                    beltLevel === belt
                      ? `${colors.border} shadow-md`
                      : "border-transparent hover:border-gray-200"
                  }
                `}
              >
                <div className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full ${colors.bg} mr-2`}
                  ></div>
                  <span className="font-medium">{colors.name}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Select your current belt level in jujitsu
          </p>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Profile"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      </form>
    </div>
  );
}
