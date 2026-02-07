import { Node, mergeAttributes, type CommandProps } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import TagComponent from './TagComponent';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tag: {
      /**
       * Insert a tag
       */
      insertTag: (attributes: {
        label: string;
        id?: string;
        suggestion?: string;
        type?: 'weakness' | 'neutral';
      }) => ReturnType;
    };
  }
}

export const TagNode = Node.create({
  name: 'tag',

  group: 'inline',

  inline: true,

  atom: false,

  content: 'text*',

  selectable: false,

  addAttributes() {
    return {
      id: {
        default: null,
      },
      label: {
        default: 'tag',
      },
      type: {
        default: 'neutral',
      },
      reason: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="tag"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-type': 'tag' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TagComponent);
  },

  addCommands() {
    return {
      insertTag:
        ({
          label,
          id,
          type,
          reason,
        }: {
          label: string;
          id?: string;
          type?: 'weakness' | 'neutral';
          reason?: string;
        }) =>
        ({ commands }: CommandProps) => {
          const normalizedLabel = label.trim() || 'tag';
          return commands.insertContent({
            type: this.name,
            attrs: {
              label: normalizedLabel,
              id: id || normalizedLabel.toLowerCase(),
              type: type || 'neutral',
              reason,
            },
            content: [{ type: 'text', text: normalizedLabel }],
          });
        },
    };
  },
});
