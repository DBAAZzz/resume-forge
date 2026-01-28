import Typography from '@tiptap/extension-typography';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';

import { TagNode } from '../extensions/TagNode';

export const editorExtensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
  }),
  Typography,
  Markdown,
  TagNode,
];
