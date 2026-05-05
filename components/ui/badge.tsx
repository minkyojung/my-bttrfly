import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm font-semibold leading-[1.4]",
  {
    variants: {
      size: {
        sm: "px-[5px] py-[1px] text-[10px] tracking-wide",
      },
    },
    defaultVariants: {
      size: "sm",
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  color?: string;
}

export function Badge({ className, size, color, style, ...props }: BadgeProps) {
  return (
    <span
      className={cn(badgeVariants({ size }), "text-white/85", className)}
      style={{ backgroundColor: color, ...style }}
      {...props}
    />
  );
}
