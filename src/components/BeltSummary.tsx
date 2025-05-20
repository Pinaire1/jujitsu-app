import { useTodaysBeltDistribution } from "../hooks/useTodaysBeltDistribution";

export default function BeltSummary() {
  const { belts, loading } = useTodaysBeltDistribution();

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2 className="text-lg font-bold">Today's Belt Distribution</h2>
      <ul>
        {belts.map((b) => (
          <li key={b.belt_level}>
            {b.belt_level}: {b.count}
          </li>
        ))}
      </ul>
    </div>
  );
}
