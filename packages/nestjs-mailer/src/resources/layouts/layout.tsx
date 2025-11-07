import React from 'react';
import { Provider } from '@resources/providers';
import { Html, Head, Body, Preview, Container } from '@resources/components/base';
import type { TailwindConfig } from '@react-email/components';

export interface LayoutProps {
  children: React.ReactNode;
  preview?: string;
  locale?: string;
  tailwindConfig?: TailwindConfig;
  lang?: string;
  dir?: 'ltr' | 'rtl';
  containerClassName?: string;
  bodyClassName?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  preview,
  locale = 'en',
  tailwindConfig,
  lang,
  dir,
  containerClassName,
  bodyClassName,
}) => {
  return (
    <Provider locale={locale} tailwindConfig={tailwindConfig}>
      <Html lang={lang || locale} dir={dir}>
        <Head />
        {preview && <Preview>{preview}</Preview>}
        <Body className={bodyClassName}>
          <Container className={containerClassName}>{children}</Container>
        </Body>
      </Html>
    </Provider>
  );
};
