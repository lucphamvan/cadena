import { useQuery } from "@tanstack/react-query";
import { skillsService } from "@/services/skills.service";

const SKILLS_QUERY_KEY = "skills" as const;

export const useSkills = () => {
  return useQuery({
    queryKey: [SKILLS_QUERY_KEY],
    queryFn: async () => await skillsService.getAll(),
    staleTime: 1000 * 60 * 10, // 10 minutes — skills rarely change
  });
};
