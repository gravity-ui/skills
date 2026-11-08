import type {ReactNode} from 'react';
import {Flex, Text, sp} from '@gravity-ui/uikit';

export function Page({title, children}: {title: string; children: ReactNode}) {
  return (
    <div
      className={sp({p: 8})}
      style={{maxWidth: 920, margin: '0 auto', width: '100%', boxSizing: 'border-box'}}
    >
      <Flex direction="column" gap={6}>
        <Text variant="header-1" as="h1">
          {title}
        </Text>
        {children}
      </Flex>
    </div>
  );
}
