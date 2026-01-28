import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';

const TagComponent = (props: NodeViewProps) => {
  const { node, selected } = props;
  const type = node.attrs.type || 'neutral';

  const getTypeStyles = () => {
    switch (type) {
      case 'good':
        return selected ? 'text-white shadow-sm ring-2 ring-green-300' : ' text-green-500';
      case 'bad':
        return selected
          ? ' text-white shadow-sm ring-2 ring-red-300'
          : ' text-red-500 underline decoration-wavy underline-red-300';
      default:
        return selected
          ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300'
          : 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    }
  };

  return (
    <NodeViewWrapper className="tag-node-view inline-block align-middle" as="span">
      <span
        className={`
          inline-flex items-center font-medium
          transition-colors duration-200 select-none cursor-pointer
          ${getTypeStyles()}
        `}
        data-id={node.attrs.id as string}
      >
        {node.attrs.label as string}
      </span>
    </NodeViewWrapper>
  );
};

export default TagComponent;
