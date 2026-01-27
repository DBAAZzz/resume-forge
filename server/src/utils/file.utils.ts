import { fileParserService } from '../services/file-parser.service.js';

import type { ParsedFileContent } from '../types/index.js';
import type { MultipartFile } from '@fastify/multipart';

/**
 * 文件处理工具函数
 * 提供路由层使用的高层抽象，隔离具体的文件解析实现
 */

/**
 * 从 multipart 请求中读取并解析文件
 * @param file Fastify multipart 文件对象
 * @returns 解析后的文件内容
 */
export async function parseMultipartFile(file: MultipartFile): Promise<ParsedFileContent> {
  // 读取文件缓冲区
  const buffer = await file.toBuffer();

  // 调用底层解析服务
  return fileParserService.parseFile({
    buffer,
    fileName: file.filename,
    mimeType: file.mimetype,
  });
}

/**
 * 从 multipart fields 中提取 prompt
 * @param fields Fastify multipart fields
 * @param defaultPrompt 默认 prompt
 * @returns 提取的 prompt 字符串
 */
export function extractPromptFromFields(
  fields: MultipartFile['fields'],
  defaultPrompt = '请分析这个文件'
): string {
  const promptField = fields.prompt;

  if (promptField && typeof promptField === 'object' && 'value' in promptField) {
    return String(promptField.value);
  }

  return defaultPrompt;
}

/**
 * 验证文件类型是否支持文本处理
 * @param parsedFile 解析后的文件对象
 * @throws Error 如果是不支持的文件类型
 */
export function validateTextFileType(parsedFile: ParsedFileContent): void {
  if (parsedFile.type === 'image') {
    throw new Error(
      'Image files are not supported in this endpoint. Use streaming endpoint for vision support.'
    );
  }
}
