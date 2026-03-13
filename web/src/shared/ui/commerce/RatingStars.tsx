"use client";

interface RatingStarsProps {
  value: number;
  size?: number;
  showValue?: boolean;
  reviewCount?: number;
}

export function RatingStars({
  value,
  size = 18,
  showValue = true,
  reviewCount,
}: RatingStarsProps) {
  return (
    <div
      className="inline-flex items-center gap-1"
      aria-label={`Rating ${value} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const diff = value - i;
        let char: string;
        if (diff >= 1) char = "★";
        else if (diff >= 0.5) char = "⯪";
        else char = "☆";
        return (
          <span
            key={i}
            style={{ fontSize: size, color: "#f59e0b", lineHeight: 1 }}
          >
            {char}
          </span>
        );
      })}
      {showValue && (
        <span className="font-semibold" style={{ fontSize: size * 0.72 }}>
          {value.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span
          className="text-[rgb(var(--color-text-secondary))]"
          style={{ fontSize: size * 0.67 }}
        >
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
