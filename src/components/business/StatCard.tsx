export default function StatCard({
  title,
  value,
  color
}: {
  title: string;
  value: any;
  color: "green" | "blue" | "yellow" | "red";
}) {
  const colorMap = {
    green: "from-emerald-400/20 to-emerald-400/5 border-emerald-400/30",
    blue: "from-cyan-400/20 to-cyan-400/5 border-cyan-400/30",
    yellow: "from-yellow-400/20 to-yellow-400/5 border-yellow-400/30",
    red: "from-red-400/20 to-red-400/5 border-red-400/30"
  };

  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br p-6 backdrop-blur ${colorMap[color]}`}
    >
      <div className="text-sm text-white/60">{title}</div>
      <div className="mt-2 text-3xl font-bold text-white">{value}</div>
    </div>
  );
}