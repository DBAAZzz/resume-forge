import { Table } from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import Typography from '@tiptap/extension-typography';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';

import { TagNode, type TagNodeOptions } from '../extensions/TagNode';

export interface EditorExtensionOptions {
  getOptimizerContext?: TagNodeOptions['getOptimizerContext'];
  requestTagCandidates?: TagNodeOptions['requestTagCandidates'];
}

export const createEditorExtensions = (options: EditorExtensionOptions = {}) => [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
  }),
  Typography,
  Markdown,
  Table.configure({
    resizable: true,
  }),
  TableHeader,
  TableCell,
  TableRow,
  TagNode.configure({
    getOptimizerContext: options.getOptimizerContext ?? (() => undefined),
    requestTagCandidates: options.requestTagCandidates,
  }),
];

export const editorExtensions = createEditorExtensions();
