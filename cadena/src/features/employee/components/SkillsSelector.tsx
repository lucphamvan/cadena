import { memo } from "react";

interface SkillsSelectorProps {
  readonly selectedSkills: string[];
  readonly availableSkills: string[];
  readonly onToggle: (skill: string) => void;
  readonly isLoading?: boolean;
}

const SkillChip = memo(function SkillChip({
  skill,
  isSelected,
  onToggle,
}: {
  readonly skill: string;
  readonly isSelected: boolean;
  readonly onToggle: (skill: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(skill)}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
        isSelected
          ? "bg-primary text-on-primary"
          : "bg-secondary-container text-on-secondary-container hover:bg-surface-container-high"
      }`}
    >
      {skill}
      <span className="material-symbols-outlined text-xs">
        {isSelected ? "close" : "add"}
      </span>
    </button>
  );
});

export default function SkillsSelector({
  selectedSkills,
  availableSkills,
  onToggle,
  isLoading,
}: SkillsSelectorProps) {
  // Combine all unique skills: selected first, then available unselected
  const allSkills = [
    ...selectedSkills,
    ...availableSkills.filter((s) => !selectedSkills.includes(s)),
  ];

  return (
    <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">star</span>
          <h2 className="text-xl font-bold tracking-tight">
            Technical Skills
          </h2>
        </div>
        {selectedSkills.length > 0 && (
          <span className="text-xs font-bold text-tertiary px-3 py-1 bg-tertiary/5 rounded-full">
            {selectedSkills.length} Selected
          </span>
        )}
      </div>
      <p className="text-sm text-on-surface-variant mb-6">
        Select your primary technical proficiencies to help team lead
        allocations.
      </p>

      {isLoading ? (
        <div className="flex items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-sm animate-spin">
            progress_activity
          </span>
          <span className="text-sm">Loading skills...</span>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {allSkills.map((skill) => (
            <SkillChip
              key={skill}
              skill={skill}
              isSelected={selectedSkills.includes(skill)}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
