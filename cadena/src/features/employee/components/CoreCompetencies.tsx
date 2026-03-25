import SkillBadge from "@/features/employee/components/SkillBadge";

interface CoreCompetenciesProps {
  readonly skills: readonly string[];
}

export default function CoreCompetencies({ skills }: CoreCompetenciesProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm border border-outline-variant/10">
      <div className="flex items-center gap-3 mb-8">
        <div className="rounded-lg flex items-center justify-center text-tertiary">
          <span className="material-symbols-outlined text-primary">star</span>
        </div>
        <h3 className="text-xl font-bold tracking-tight">
          Technical Skills
        </h3>
      </div>

      <div className="flex flex-wrap gap-3">
        {skills.map((skill) => (
          <SkillBadge key={skill} label={skill} />
        ))}
      </div>
    </div>
  );
}
