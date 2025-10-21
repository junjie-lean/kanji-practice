import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { NextUIProvider } from '@nextui-org/react';
import Script from 'next/script';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* 加载 ResponsiveVoice - 禁用自动朗读 */}
      <Script
        src="https://code.responsivevoice.org/responsivevoice.js?key=CIbtGtxF&disableClick=true"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('✅ ResponsiveVoice 已加载（自动朗读已禁用）');
        }}
      />
      <NextUIProvider>
        <Component {...pageProps} />
      </NextUIProvider>
    </>
  );
}
