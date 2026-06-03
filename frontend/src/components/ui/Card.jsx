import { cn } from "../../lib/cn";

export default function Card({
  children,
  className = "",
  as: Tag = "div",
  hover = false,
  padded = true,
  ...props
}) {
  return (
    <Tag
      className={cn(
        "rounded-2xl border bg-card text-fg shadow-card",
        padded && "p-6",
        hover && "transition duration-200 hover:-translate-y-0.5 hover:shadow-lift",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}
