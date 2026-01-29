import { type Editor } from '@tiptap/react';
import { useEffect } from 'react';

interface TagRecommendation {
  id: string;
  originalText: string;
  type: 'strength' | 'weakness' | 'neutral';
  suggestion?: string;
}

export const useTagHighlighter = (
  editor: Editor | null,
  recommendations: TagRecommendation[] = []
) => {
  useEffect(() => {
    if (!editor) {
      return;
    }
    if (!recommendations.length) {
      return;
    }

    if (!editor.view) {
      return;
    }

    const { doc } = editor.state;
    const existingTagIds = new Set<string>();

    // 1. 构建纯文本与文档位置的映射表
    const textMap: Array<{ pos: number; char: string; nodePos: number }> = [];
    let plainText = '';

    doc.descendants((node, pos) => {
      // 收集已有的标签 ID
      if (node.type.name === 'tag') {
        existingTagIds.add(node.attrs.id);
        return false; // 不遍历子节点
      }

      // 从所有文本节点构建文本映射
      if (node.isText && node.text) {
        for (let i = 0; i < node.text.length; i++) {
          textMap.push({
            pos: pos + i,
            char: node.text[i],
            nodePos: pos,
          });
          plainText += node.text[i];
        }
      }
    });

    // 2. 在纯文本中寻找匹配项
    const matches: { from: number; to: number; rec: TagRecommendation }[] = [];

    recommendations.forEach((rec) => {
      // 如果已经打过标签则跳过
      if (existingTagIds.has(rec.id)) return;

      // 清理文本：移除 Markdown 语法和开头的数字编号
      const cleanText = stripMarkdown(removeLeadingNumber(rec.originalText));
      if (!cleanText.trim()) return;

      const regex = new RegExp(escapeRegExp(cleanText), 'gi');
      let match;

      while ((match = regex.exec(plainText)) !== null) {
        const startIdx = match.index;
        const endIdx = startIdx + match[0].length;

        // 将纯文本位置映射回文档位置
        if (textMap[startIdx] && textMap[endIdx - 1]) {
          matches.push({
            from: textMap[startIdx].pos,
            to: textMap[endIdx - 1].pos + 1,
            rec,
          });
        }
      }
    });

    // 3. 执行替换（按位置逆序处理以保持偏移量正确）
    matches.sort((a, b) => b.from - a.from);

    if (matches.length === 0) {
      return;
    }

    const transaction = editor.state.tr;
    let modified = false;

    matches.forEach((match) => {
      transaction.replaceWith(
        match.from,
        match.to,
        editor.schema.nodes.tag.create({
          label: stripMarkdown(match.rec.originalText),
          id: match.rec.id,
          type: match.rec.type,
        })
      );
      modified = true;
    });

    if (modified) {
      editor.view.dispatch(transaction);
    }
  }, [editor, recommendations]);
};

function escapeRegExp(string: string) {
  if (typeof string !== 'string') return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 从文本中移除开头的编号模式
 * 支持格式如: "1. ", "2、", "3) ", "4）" 等
 */
function removeLeadingNumber(text: string): string {
  if (typeof text !== 'string') return '';
  return text.replace(/^\d+[.、)）]\s*/, '');
}

/**
 * 从文本中剥离常见的 Markdown 语法以匹配渲染后的内容
 * 移除：**加粗**, *斜体*, __加粗__, _斜体_, `代码`, [链接](url) 等
 */
function stripMarkdown(text: string): string {
  if (typeof text !== 'string') return '';
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1') // **bold**
    .replace(/\*(.+?)\*/g, '$1') // *italic*
    .replace(/__(.+?)__/g, '$1') // __bold__
    .replace(/_(.+?)_/g, '$1') // _italic_
    .replace(/`(.+?)`/g, '$1') // `code`
    .replace(/~~(.+?)~~/g, '$1') // ~~strikethrough~~
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // [text](url)
    .replace(/!\[.*?\]\(.+?\)/g, '') // ![alt](image)
    .replace(/#{1,6}\s+/g, '') // # headers
    .replace(/>\s+/g, '') // > blockquote
    .replace(/[-*+]\s+/g, '') // - list items
    .replace(/\d+\.\s+/g, ''); // 1. ordered list
}
