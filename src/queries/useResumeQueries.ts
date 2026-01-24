import { useQuery } from '@tanstack/react-query';
import { fetchResumes } from '@/api/resume';

export const RESUME_KEYS = {
  all: ['resumes'] as const,
};

export function useResumes() {
  return useQuery({
    queryKey: RESUME_KEYS.all,
    queryFn: fetchResumes,
  });
}
