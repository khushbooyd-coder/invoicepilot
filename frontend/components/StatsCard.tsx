interface Props {
  title: string;
  value: string | number;
  color: string;
}

export default function StatsCard({
  title,
  value,
  color,
}: Props) {
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">

      <p className="text-gray-400">
        {title}
      </p>

      <h2
        className={`text-3xl font-bold mt-3 ${color}`}
      >
        {value}
      </h2>

    </div>
  );
}