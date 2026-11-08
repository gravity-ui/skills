import { Fragment } from 'react';
import type { ReactNode } from 'react';
import { Link, Text } from '@gravity-ui/uikit';
import type { TextProps } from '@gravity-ui/uikit';

import type { BlockNode, HeadingLevel, InlineNode } from './parse';
import { parseMarkdown } from './parse';

import './MarkdownPreview.css';

const HEADING_VARIANTS: Record<HeadingLevel, TextProps['variant']> = {
  1: 'header-2',
  2: 'header-1',
  3: 'subheader-3',
  4: 'subheader-2',
  5: 'subheader-1',
  6: 'body-2',
};

function renderInline(nodes: InlineNode[]): ReactNode {
  return nodes.map((node, index) => {
    switch (node.type) {
      case 'text':
        return <Fragment key={index}>{node.value}</Fragment>;
      case 'br':
        return <br key={index} />;
      case 'strong':
        return <strong key={index}>{renderInline(node.children)}</strong>;
      case 'em':
        return <em key={index}>{renderInline(node.children)}</em>;
      case 'del':
        return <del key={index}>{renderInline(node.children)}</del>;
      case 'code':
        return (
          <Text key={index} as="code" variant="code-inline-2" className="md-preview__code-inline">
            {node.value}
          </Text>
        );
      case 'link':
        if (!node.href) {
          // Небезопасный URL — показываем просто текст
          return <Fragment key={index}>{renderInline(node.children)}</Fragment>;
        }
        return (
          <Link key={index} href={node.href} title={node.title} target="_blank" rel="noopener noreferrer">
            {renderInline(node.children)}
          </Link>
        );
      case 'image':
        if (!node.src) {
          return <Fragment key={index}>{node.alt}</Fragment>;
        }
        return <img key={index} className="md-preview__image" src={node.src} alt={node.alt} title={node.title} />;
      default:
        return null;
    }
  });
}

function renderBlocks(blocks: BlockNode[]): ReactNode {
  return blocks.map((block, index) => {
    switch (block.type) {
      case 'heading': {
        const Tag = `h${block.level}` as const;
        return (
          <Text key={index} as={Tag} variant={HEADING_VARIANTS[block.level]} className="md-preview__heading">
            {renderInline(block.children)}
          </Text>
        );
      }
      case 'paragraph':
        if (block.tight) {
          return <Fragment key={index}>{renderInline(block.children)}</Fragment>;
        }
        return (
          <Text key={index} as="p" variant="body-2" className="md-preview__paragraph">
            {renderInline(block.children)}
          </Text>
        );
      case 'code':
        return (
          <pre key={index} className="md-preview__code-block" data-lang={block.lang}>
            <Text as="code" variant="code-2">
              {block.value}
            </Text>
          </pre>
        );
      case 'blockquote':
        return (
          <blockquote key={index} className="md-preview__blockquote">
            {renderBlocks(block.children)}
          </blockquote>
        );
      case 'list': {
        const ListTag = block.ordered ? 'ol' : 'ul';
        return (
          <ListTag
            key={index}
            className="md-preview__list"
            start={block.ordered && block.start !== 1 ? block.start : undefined}
          >
            {block.items.map((item, itemIndex) => (
              <Text key={itemIndex} as="li" variant="body-2" className="md-preview__list-item">
                {renderBlocks(item)}
              </Text>
            ))}
          </ListTag>
        );
      }
      case 'hr':
        return <hr key={index} className="md-preview__hr" />;
      default:
        return null;
    }
  });
}

export interface MarkdownPreviewProps {
  /** Исходный markdown-текст */
  source: string;
  /** Что показать, когда текст пустой */
  emptyText?: ReactNode;
  className?: string;
}

/** Рендерит markdown-текст в React-элементы без использования innerHTML. */
export function MarkdownPreview({ source, emptyText, className }: MarkdownPreviewProps) {
  const blocks = parseMarkdown(source);

  if (blocks.length === 0) {
    return (
      <div className={['md-preview', 'md-preview_empty', className].filter(Boolean).join(' ')}>
        <Text variant="body-2" color="hint">
          {emptyText ?? 'Здесь появится отформатированный текст'}
        </Text>
      </div>
    );
  }

  return <div className={['md-preview', className].filter(Boolean).join(' ')}>{renderBlocks(blocks)}</div>;
}
