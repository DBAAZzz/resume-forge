import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';
import * as XLSX from 'xlsx';

import { fileParserConfig, getFileCategory } from '@/config/file-parser.config.js';
import type { FileBuffer, ParsedFileContent } from '@/types/index.js';

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
    try {
      const data = new PDFParse(buffer);
      const content = (await data.getText()).text;
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
    }
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
