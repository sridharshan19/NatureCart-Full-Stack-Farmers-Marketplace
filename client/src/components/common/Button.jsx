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
      className={`rounded-full bg-[linear-gradient(135deg,#0f7b62_0%,#1b9a74_100%)] px-4 py-2.5 text-white shadow-lg shadow-teal-900/20 transition hover:-translate-y-0.5 hover:brightness-95 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:brightness-100 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
