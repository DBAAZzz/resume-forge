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
        type?: 'strength' | 'weakness' | 'neutral';
      }) => ReturnType;
    };
  }
}

export const TagNode = Node.create({
  name: 'tag',

  group: 'inline',

  inline: true,

  atom: true,

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
        }: {
          label: string;
          id?: string;
          type?: 'strength' | 'weakness' | 'neutral';
        }) =>
        ({ commands }: CommandProps) => {
          return commands.insertContent({
            type: this.name,
            attrs: { label, id: id || label.toLowerCase(), type: type || 'neutral' },
          });
        },
    };
  },
});
