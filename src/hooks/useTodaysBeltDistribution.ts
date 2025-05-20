import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type BeltDistribution = {
  belt_level: string;
  count: number;
};

export function useTodaysBeltDistribution() {
  const [belts, setBelts] = useState<BeltDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBelts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("todays_signed_in_belts")
        .select("*");

      if (error) {
        console.error("Error fetching belt distribution:", error.message);
      } else {
        setBelts(data || []);
      }
      setLoading(false);
    };

    fetchBelts();
  }, []);

  return { belts, loading };
}
