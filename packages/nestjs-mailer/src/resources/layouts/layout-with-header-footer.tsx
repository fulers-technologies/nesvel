import React from 'react';
import { Provider } from '@resources/providers';
import { Html, Head, Body, Preview, Container } from '@resources/components/base';
import type { TailwindConfig } from '@react-email/components';

export interface LayoutWithHeaderFooterProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  preview?: string;
  locale?: string;
  tailwindConfig?: TailwindConfig;
  lang?: string;
  dir?: 'ltr' | 'rtl';
  containerClassName?: string;
  bodyClassName?: string;
  contentClassName?: string;
}

export const LayoutWithHeaderFooter: React.FC<LayoutWithHeaderFooterProps> = ({
  children,
  header,
  footer,
  preview,
  locale = 'en',
  tailwindConfig,
  lang,
  dir,
  containerClassName,
  bodyClassName,
  contentClassName,
}) => {
  return (
    <Provider locale={locale} tailwindConfig={tailwindConfig}>
      <Html lang={lang || locale} dir={dir}>
        <Head />
        {preview && <Preview>{preview}</Preview>}
        <Body className={bodyClassName}>
          <Container className={containerClassName}>
            {header}
            <div className={contentClassName}>{children}</div>
            {footer}
          </Container>
        </Body>
      </Html>
    </Provider>
  );
};
