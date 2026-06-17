interface Props {
  title: string;
  value: string | number;
  color?: string;
}

export default function StatCard({
  title,
  value,
  color = "text-green-400",
}: Props) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">

      <p className="text-zinc-400 text-sm">
        {title}
      </p>

      <h2 className={`text-4xl font-bold mt-3 ${color}`}>
        {value}
      </h2>

    </div>
  );
}