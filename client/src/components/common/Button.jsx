export default function Button({
  children,
  onClick,
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`rounded-full bg-[#0f766e] px-4 py-2 text-white shadow-lg shadow-teal-900/20 transition hover:bg-[#115e59] disabled:cursor-not-allowed disabled:shadow-none disabled:hover:bg-inherit ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
