import { Star } from "lucide-react";

type Props = {
  variant?: "inline" | "card";
};

export function AmbassadorBadge({ variant = "inline" }: Props) {
  if (variant === "card") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700 border border-amber-200">
        <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
        Đại sứ
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-0.5 text-amber-600">
      <Star className="h-3 w-3 fill-amber-500" />
    </span>
  );
}
