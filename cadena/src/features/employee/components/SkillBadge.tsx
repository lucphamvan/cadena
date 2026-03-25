import { memo } from "react";

interface SkillBadgeProps {
  readonly label: string;
}

const SkillBadge = memo(function SkillBadge({ label }: SkillBadgeProps) {
  return (
    <span className="px-4 py-2 bg-secondary-container text-on-secondary-container rounded-full text-sm font-semibold hover:bg-secondary-fixed transition-colors cursor-default">
      {label}
    </span>
  );
});

export default SkillBadge;
