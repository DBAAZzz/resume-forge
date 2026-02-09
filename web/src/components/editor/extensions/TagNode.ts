import { Node, mergeAttributes, type CommandProps } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';

import TagComponent from './TagComponent';

import type { DeepseekModel } from '@resume/types';

export interface TagOptimizerContext {
  model?: DeepseekModel;
  apiKey?: string;
}

export interface TagCandidateRequest {
  text: string;
  reason?: string;
  context?: string;
  candidateCount?: number;
  model?: DeepseekModel;
  apiKey?: string;
}

export interface TagNodeOptions {
  getOptimizerContext: () => TagOptimizerContext | undefined;
  requestTagCandidates?: (params: TagCandidateRequest) => Promise<string[]>;
}

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

export const TagNode = Node.create<TagNodeOptions>({
  name: 'tag',
  group: 'inline',
  inline: true,
  atom: false,
  content: 'text*',
  selectable: false,

  addOptions() {
    return {
      getOptimizerContext: () => undefined,
      requestTagCandidates: undefined,
    };
  },

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
