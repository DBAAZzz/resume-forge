import { api, uploadFile } from '@/utils/fetch';

import type { ParsedFileContent } from '@resume/types';

/**
 * POST /file/parse
 */
export const requestParsedFile = async (file: File): Promise<ParsedFileContent> => {
  return uploadFile<ParsedFileContent>('file/parse', file);
};

/**
 * GET /file/template/resume
 */
export const requestResumeTemplateBlob = async (): Promise<Blob> => {
  const response = await api.get('file/template/resume');
  return response.blob();
};
