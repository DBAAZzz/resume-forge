import type { Resume } from './types';

export const fetchResumes = async (): Promise<Resume[]> => {
  const response = await fetch('/api/resumes');
  if (!response.ok) {
    throw new Error('Failed to fetch resumes');
  }
  return response.json();
};
