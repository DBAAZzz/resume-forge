import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import * as XLSX from 'xlsx';

import { fileParserConfig, getFileCategory } from '../config/file-parser.config.js';

import type { FileBuffer, ParsedFileContent } from '../types/index.js';

/**
 * 通用文件解析服务
 * 支持多种文件格式，提供统一的解析接口
 */
export class FileParserService {
  /**
   * 主解析入口
   * @param fileBuffer 文件缓冲区对象
   * @returns 解析后的文件内容
   */
  async parseFile(fileBuffer: FileBuffer): Promise<ParsedFileContent> {
    const { buffer, fileName, mimeType } = fileBuffer;

    // 验证文件大小
    if (buffer.length > fileParserConfig.maxFileSize) {
      throw new Error(
        `File size exceeds limit. Max: ${fileParserConfig.maxFileSize / 1024 / 1024}MB`
      );
    }

    // 根据 MIME 类型选择解析器，如果无法识别则使用文件扩展名
    const category = getFileCategory(mimeType, fileName);

    switch (category) {
      case 'text':
        return this.parseTextFile(buffer, fileName, mimeType);
      case 'pdf':
        return this.parsePdfFile(buffer, fileName, mimeType);
      case 'word':
        return this.parseWordFile(buffer, fileName, mimeType);
      case 'excel':
        return this.parseExcelFile(buffer, fileName, mimeType);
      case 'image':
        return this.parseImageFile(buffer, fileName, mimeType);
      default:
        throw new Error(`Unsupported file type: ${mimeType}`);
    }
  }

  /**
   * 解析纯文本文件
   */
  private async parseTextFile(
    buffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<ParsedFileContent> {
    const content = buffer.toString(fileParserConfig.textEncoding);
    const wordCount = this.countWords(content);

    return {
      content,
      type: 'text',
      metadata: {
        fileName,
        mimeType,
        fileSize: buffer.length,
        wordCount,
      },
    };
  }

  /**
   * 解析 PDF 文件
   */
  private async parsePdfFile(
    buffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<ParsedFileContent> {
    const parser = new PDFParse({ data: buffer });

    try {
      const rawContent = (
        await parser.getText({
          // 禁用默认 "-- page_number of total_number --" 页分隔文案
          pageJoiner: '\n\n',
          lineEnforce: true,
        })
      ).text;
      const content = this.normalizePdfExtractedText(rawContent);
      const wordCount = this.countWords(content);

      return {
        content,
        type: 'text',
        metadata: {
          fileName,
          mimeType,
          fileSize: buffer.length,
          wordCount,
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to parse PDF: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      await parser.destroy();
    }
  }

  /**
   * PDF 提取文本归一化：
   * 1) 清理页分隔占位符
   * 2) 识别软换行并合并
   * 3) 保留有语义的换行（标题、列表、句末停顿）
   */
  private normalizePdfExtractedText(text: string): string {
    const normalized = text.replace(/\r\n/g, '\n');
    const removedPageMarker = normalized.replace(
      /(?:^|\n)\s*--\s*\d+\s*of\s*\d+\s*--\s*(?=\n|$)/gi,
      '\n'
    );

    const merged = this.mergePdfSoftLineBreaks(removedPageMarker);
    return merged.replace(/\n{3,}/g, '\n\n').trim();
  }

  /**
   * 将仅因版式导致的换行（soft wrap）合并，
   * 保留段落、标题、列表等结构换行
   */
  private mergePdfSoftLineBreaks(text: string): string {
    const lines = text.split('\n').map((line) => line.replace(/[ \t]+$/g, ''));
    const output: string[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();

      // 空行作为段落分隔保留
      if (!line) {
        if (output[output.length - 1] !== '') {
          output.push('');
        }
        continue;
      }

      if (output.length === 0 || output[output.length - 1] === '') {
        output.push(line);
        continue;
      }

      const previous = output[output.length - 1];
      if (this.shouldMergePdfLines(previous, line)) {
        output[output.length - 1] = this.joinPdfLines(previous, line);
      } else {
        output.push(line);
      }
    }

    return output.join('\n');
  }

  /**
   * 判断两行是否属于同一语义句子/段落
   */
  private shouldMergePdfLines(previous: string, next: string): boolean {
    const prev = previous.trim();
    const nextLine = next.trim();

    // 句末停顿符号后通常换段/换行
    if (/[。！？!?；;：:]$/.test(prev)) return false;

    // 标题或列表项应保留换行
    if (this.isLikelyHeading(prev) || this.isListLikeLine(nextLine)) return false;

    return true;
  }

  private isListLikeLine(line: string): boolean {
    return /^(?:[-*•●▪■▸▹]\s+|\d+[.)]\s+|[（(]?\d+[）)]\s+|[A-Za-z][.)]\s+)/.test(line);
  }

  private isLikelyHeading(line: string): boolean {
    const text = line.trim();

    if (!text || text.length > 24) return false;
    if (/[。！？!?；;，,]/.test(text)) return false;
    if (this.isListLikeLine(text)) return false;

    if (/^[A-Z][A-Z\s/&-]{1,24}$/.test(text)) return true;
    return /(经历|背景|技能|项目|教育|信息|总结|简介|奖项|证书|能力|实习|工作)$/.test(text);
  }

  private joinPdfLines(previous: string, next: string): string {
    // 英文断词连字符跨行：`develop-` + `ment` -> `development`
    if (/-$/.test(previous) && /^[A-Za-z]/.test(next)) {
      return `${previous.slice(0, -1)}${next}`;
    }

    // 英文/数字连续文本补空格，中文连续文本不补空格
    const needsSpace = /[A-Za-z0-9)]$/.test(previous) && /^[A-Za-z0-9(]/.test(next);
    return needsSpace ? `${previous} ${next}` : `${previous}${next}`;
  }

  /**
   * 解析 Word 文档 (.docx)
   */
  private async parseWordFile(
    buffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<ParsedFileContent> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const content = result.value;
      const wordCount = this.countWords(content);

      return {
        content,
        type: 'text',
        metadata: {
          fileName,
          mimeType,
          fileSize: buffer.length,
          wordCount,
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to parse Word document: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 解析 Excel 文件
   */
  private async parseExcelFile(
    buffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<ParsedFileContent> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheets: string[] = [];

      // 遍历所有 sheet
      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const sheetData = XLSX.utils.sheet_to_csv(worksheet);
        sheets.push(`=== Sheet: ${sheetName} ===\n${sheetData}`);
      });

      const content = sheets.join('\n\n');
      const wordCount = this.countWords(content);

      return {
        content,
        type: 'text',
        metadata: {
          fileName,
          mimeType,
          fileSize: buffer.length,
          wordCount,
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to parse Excel file: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * 解析图像文件（转换为 base64）
   */
  private async parseImageFile(
    buffer: Buffer,
    fileName: string,
    mimeType: string
  ): Promise<ParsedFileContent> {
    const base64 = buffer.toString('base64');

    return {
      content: base64,
      type: 'image',
      metadata: {
        fileName,
        mimeType,
        fileSize: buffer.length,
      },
    };
  }

  /**
   * 统计字数（简单实现）
   */
  private countWords(text: string): number {
    // 移除多余空白并分割
    return text.trim().split(/\s+/).filter(Boolean).length;
  }
}

// 导出单例
export const fileParserService = new FileParserService();
