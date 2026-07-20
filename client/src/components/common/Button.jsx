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
      className={`rounded-full bg-[linear-gradient(135deg,#0d9488_0%,#ea580c_100%)] px-5 py-2.5 font-semibold text-white shadow-lg shadow-teal-950/15 transition hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:brightness-100 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
