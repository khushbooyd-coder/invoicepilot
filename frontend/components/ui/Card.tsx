interface Props {
  children: React.ReactNode;
}

export default function Card({ children }: Props) {
  return (
    <div
      className="
        bg-zinc-900
        border
        border-zinc-800
        rounded-2xl
        shadow-xl
        p-6
      "
    >
      {children}
    </div>
  );
}