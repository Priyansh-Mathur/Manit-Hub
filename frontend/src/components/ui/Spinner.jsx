import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

export default function Spinner({ className, size = 18 }) {
  return <Loader2 className={cn("animate-spin text-primary-600", className)} size={size} />;
}
