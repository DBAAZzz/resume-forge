// File parser configuration

export const fileParserConfig = {
  // 支持的 MIME 类型
  supportedMimeTypes: {
    // 纯文本
    text: [
      'text/plain',
      'text/markdown',
      'text/csv',
      'application/json',
      'text/html',
      'text/css',
      'text/javascript',
      'application/javascript',
    ],
    // PDF
    pdf: ['application/pdf'],
    // Word 文档
    word: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/msword', // .doc
    ],
    // Excel
    excel: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ],
    // 图像
    image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  },

  // 支持的文件扩展名（备用检测方案）
  supportedExtensions: {
    text: ['.txt', '.md', '.csv', '.json', '.html', '.css', '.js', '.ts', '.jsx', '.tsx'],
    pdf: ['.pdf'],
    word: ['.docx', '.doc'],
    excel: ['.xlsx', '.xls'],
    image: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  },

  // 文件大小限制 (50MB)
  maxFileSize: 50 * 1024 * 1024,

  // 文本文件编码
  textEncoding: 'utf-8' as BufferEncoding,

  // Excel 解析选项
  excelOptions: {
    // 是否包含所有 sheet
    allSheets: true,
    // 最大行数限制（防止超大文件）
    maxRows: 10000,
  },
} as const;

// 根据 MIME 类型判断文件类别，如果无法识别则尝试使用文件扩展名
export function getFileCategory(
  mimeType: string,
  fileName?: string
): 'text' | 'pdf' | 'word' | 'excel' | 'image' | 'unsupported' {
  const { supportedMimeTypes, supportedExtensions } = fileParserConfig;
  const textTypes: readonly string[] = supportedMimeTypes.text;
  const pdfTypes: readonly string[] = supportedMimeTypes.pdf;
  const wordTypes: readonly string[] = supportedMimeTypes.word;
  const excelTypes: readonly string[] = supportedMimeTypes.excel;
  const imageTypes: readonly string[] = supportedMimeTypes.image;

  // 优先使用 MIME 类型判断
  if (textTypes.includes(mimeType)) return 'text';
  if (pdfTypes.includes(mimeType)) return 'pdf';
  if (wordTypes.includes(mimeType)) return 'word';
  if (excelTypes.includes(mimeType)) return 'excel';
  if (imageTypes.includes(mimeType)) return 'image';

  // 如果 MIME 类型无法识别，尝试使用文件扩展名
  if (fileName) {
    const ext = getFileExtension(fileName);

    if ((supportedExtensions.text as readonly string[]).includes(ext)) return 'text';
    if ((supportedExtensions.pdf as readonly string[]).includes(ext)) return 'pdf';
    if ((supportedExtensions.word as readonly string[]).includes(ext)) return 'word';
    if ((supportedExtensions.excel as readonly string[]).includes(ext)) return 'excel';
    if ((supportedExtensions.image as readonly string[]).includes(ext)) return 'image';
  }

  return 'unsupported';
}

// 提取文件扩展名（含点号，小写）
function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) return '';
  return fileName.slice(lastDot).toLowerCase();
}

// 获取所有支持的 MIME 类型列表
export function getAllSupportedMimeTypes(): string[] {
  const { supportedMimeTypes } = fileParserConfig;
  return [
    ...supportedMimeTypes.text,
    ...supportedMimeTypes.pdf,
    ...supportedMimeTypes.word,
    ...supportedMimeTypes.excel,
    ...supportedMimeTypes.image,
  ];
}
