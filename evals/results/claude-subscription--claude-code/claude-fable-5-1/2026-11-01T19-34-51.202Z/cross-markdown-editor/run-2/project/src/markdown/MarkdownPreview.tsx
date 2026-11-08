import { Fragment, useMemo } from 'react';
import { Checkbox, Link, Text } from '@gravity-ui/uikit';

import { parseMarkdown } from './parse';
import type { BlockNode, InlineNode } from './parse';

import './MarkdownPreview.css';

export interface MarkdownPreviewProps {
  /** Исходный текст с markdown-разметкой */
  source: string;
  className?: string;
}

const HEADING_VARIANT = {
  1: 'header-2',
  2: 'header-1',
  3: 'subheader-3',
  4: 'subheader-2',
  5: 'subheader-1',
  6: 'subheader-1',
} as const;

/** Рендерит markdown в React-элементы (без innerHTML — вставка HTML невозможна). */
export function MarkdownPreview({ source, className }: MarkdownPreviewProps) {
  const blocks = useMemo(() => parseMarkdown(source), [source]);

  return (
    <div className={['md-preview', className].filter(Boolean).join(' ')}>
      {renderBlocks(blocks, false)}
    </div>
  );
}

function renderBlocks(blocks: BlockNode[], tight: boolean) {
  return blocks.map((block, index) => (
    <Fragment key={index}>{renderBlock(block, tight)}</Fragment>
  ));
}

function renderBlock(block: BlockNode, tight: boolean) {
  switch (block.type) {
    case 'heading': {
      const Tag = `h${block.level}` as const;
      return (
        <Text as={Tag} variant={HEADING_VARIANT[block.level]} className="md-preview__heading">
          {renderInline(block.children)}
        </Text>
      );
    }
    case 'paragraph':
      return (
        <Text as="p" variant="body-1" className={tight ? 'md-preview__p md-preview__p_tight' : 'md-preview__p'}>
          {renderInline(block.children)}
        </Text>
      );
    case 'code':
      return (
        <pre className="md-preview__pre" data-lang={block.lang ?? undefined}>
          <Text as="code" variant="code-1">
            {block.value}
          </Text>
        </pre>
      );
    case 'blockquote':
      return <blockquote className="md-preview__quote">{renderBlocks(block.children, false)}</blockquote>;
    case 'hr':
      return <hr className="md-preview__hr" />;
    case 'list': {
      const ListTag = block.ordered ? 'ol' : 'ul';
      return (
        <ListTag className="md-preview__list" start={block.ordered && block.start !== 1 ? block.start : undefined}>
          {block.items.map((item, index) => (
            <li
              key={index}
              className={item.checked === null ? 'md-preview__item' : 'md-preview__item md-preview__item_task'}
            >
              {item.checked !== null && (
                <Checkbox size="m" checked={item.checked} disabled className="md-preview__checkbox" />
              )}
              {renderBlocks(item.children, block.tight)}
            </li>
          ))}
        </ListTag>
      );
    }
    case 'table':
      return (
        <div className="md-preview__table-wrap">
          <table className="md-preview__table">
            <thead>
              <tr>
                {block.header.map((cell, col) => (
                  <th key={col} style={{ textAlign: block.align[col] ?? undefined }}>
                    <Text variant="subheader-1">{renderInline(cell)}</Text>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, col) => (
                    <td key={col} style={{ textAlign: block.align[col] ?? undefined }}>
                      <Text variant="body-1">{renderInline(cell)}</Text>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

function renderInline(nodes: InlineNode[]) {
  return nodes.map((node, index) => <Fragment key={index}>{renderInlineNode(node)}</Fragment>);
}

function renderInlineNode(node: InlineNode) {
  switch (node.type) {
    case 'text':
      return node.value;
    case 'break':
      return <br />;
    case 'code':
      return (
        <Text as="code" variant="code-inline-1" className="md-preview__code">
          {node.value}
        </Text>
      );
    case 'strong':
      return <strong>{renderInline(node.children)}</strong>;
    case 'em':
      return <em>{renderInline(node.children)}</em>;
    case 'del':
      return <del>{renderInline(node.children)}</del>;
    case 'link':
      return (
        <Link href={node.href} target="_blank" rel="noopener noreferrer">
          {renderInline(node.children)}
        </Link>
      );
    case 'image':
      return <img className="md-preview__img" src={node.src} alt={node.alt} loading="lazy" />;
  }
}
