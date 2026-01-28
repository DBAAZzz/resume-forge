import { type Editor } from '@tiptap/react';
import { useEffect } from 'react';

interface TagRecommendation {
  id: string;
  originalText: string;
  type: 'good' | 'bad' | 'neutral';
  suggestion?: string;
}

export const useTagHighlighter = (
  editor: Editor | null,
  recommendations: TagRecommendation[] = []
) => {
  useEffect(() => {
    if (!editor || !recommendations.length) return;

    const { doc } = editor.state;
    const existingTagIds = new Set<string>();

    // 1. Build a map of plain text to document positions
    const textMap: Array<{ pos: number; char: string; nodePos: number }> = [];
    let plainText = '';

    doc.descendants((node, pos) => {
      // Collect existing tag IDs
      if (node.type.name === 'tag') {
        existingTagIds.add(node.attrs.id);
        return false; // Don't traverse children
      }

      // Build text map from all text nodes
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

    // 2. Find matches in the plain text
    const matches: { from: number; to: number; rec: TagRecommendation }[] = [];

    recommendations.forEach((rec) => {
      // Skip if already tagged
      if (existingTagIds.has(rec.id)) return;

      // Clean the text: remove markdown and leading numbers
      const cleanText = stripMarkdown(removeLeadingNumber(rec.originalText));
      if (!cleanText.trim()) return;

      const regex = new RegExp(escapeRegExp(cleanText), 'gi');
      let match;

      while ((match = regex.exec(plainText)) !== null) {
        const startIdx = match.index;
        const endIdx = startIdx + match[0].length;

        // Map plain text positions back to document positions
        if (textMap[startIdx] && textMap[endIdx - 1]) {
          matches.push({
            from: textMap[startIdx].pos,
            to: textMap[endIdx - 1].pos + 1,
            rec,
          });
        }
      }
    });

    // 3. Apply replacements (sort in reverse order to maintain positions)
    matches.sort((a, b) => b.from - a.from);

    if (matches.length === 0) return;

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
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Remove leading numbering patterns from text
 * Supports formats like: "1. ", "2、", "3) ", "4）", etc.
 */
function removeLeadingNumber(text: string): string {
  return text.replace(/^\d+[.、)）]\s*/, '');
}

/**
 * Strip common Markdown syntax from text to match rendered content
 * Removes: **bold**, *italic*, __bold__, _italic_, `code`, [links](url), etc.
 */
function stripMarkdown(text: string): string {
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
