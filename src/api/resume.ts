import { http } from '@/shared/utils/fetch';

import type { Resume } from './types';

export const fetchResumes = async (): Promise<Resume[]> => {
  return http.get<Resume[]>('/api/resumes');
};
