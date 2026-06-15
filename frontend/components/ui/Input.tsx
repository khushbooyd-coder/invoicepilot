interface Props {
  placeholder?: string;
  value: string;
  type?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Input({
  placeholder,
  value,
  onChange,
  type = "text",
}: Props) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="
        w-full
        bg-zinc-900
        border
        border-zinc-700
        rounded-xl
        px-4
        py-3
        text-white
        outline-none
        focus:border-blue-500
        h-12
        text-base
      "
    />
  );
}