import Image from "next/image";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-sm font-semibold leading-none",
  {
    variants: {
      size: {
        sm: "text-[10px] tracking-wide",
      },
      shape: {
        auto: "px-[5px] py-[1px]",
        square: "w-4 h-4",
      },
    },
    defaultVariants: {
      size: "sm",
      shape: "auto",
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  color?: string;
  textColor?: string;
  image?: string;
  label?: string;
}

export function Badge({
  className,
  size,
  shape,
  color,
  textColor,
  image,
  label,
  style,
  children,
  ...props
}: BadgeProps) {
  if (image) {
    return (
      <span
        className={cn(
          "inline-flex items-center justify-center w-4 h-4 overflow-hidden rounded-sm",
          className
        )}
        style={style}
        {...props}
      >
        <Image
          src={image}
          alt={label ?? ""}
          width={16}
          height={16}
          className="w-full h-full object-contain"
        />
      </span>
    );
  }

  return (
    <span
      className={cn(badgeVariants({ size, shape }), className)}
      style={{
        backgroundColor: color,
        color: textColor ?? "rgba(255,255,255,0.85)",
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}
