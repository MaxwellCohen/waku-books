import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Suspense } from 'react';
import { MobileBookSidebar, MobileBookSidebarTrigger } from '@/components/mobile-book-sidebar';
import { OfflineIndicator } from '@/components/offline-indicator';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Toaster } from '@/components/toaster';
import ErrorBoundary from '@/components/ui/error-boundary';
import { GitHubIcon } from '@/components/ui/github-icon';
import { ApiDelay, ApiDelayFallback } from '@/features/book/components/api-delay';
import { BookFilters, BookFiltersFallback } from '@/features/book/components/book-filters';
import { BookSearch } from '@/features/book/components/book-search';
import { CatalogSize } from '@/features/book/components/catalog-size';
import { HomeLink, HomeLinkFallback } from '@/features/book/components/home-link';
import type { ReactNode } from 'react';
import '../styles.css';

const description =
  'Browse two million Goodreads books with Waku, React Server Components, streaming search, and URL-driven filters.';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <title>Waku Books</title>
      <meta name="description" content={description} />
      <meta name="theme-color" content="#fafafa" media="(prefers-color-scheme: light)" />
      <meta name="theme-color" content="#121212" media="(prefers-color-scheme: dark)" />
      <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=block"
        precedence="font"
        rel="stylesheet"
      />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content="Waku Books" />
      <meta property="og:title" content="Waku Books" />
      <meta property="og:type" content="website" />
      <ThemeProvider>
        <MobileBookSidebar sidebar={<BookSidebarContent idPrefix="mobile" mobile />}>
          <div className="group flex min-h-dvh">
            <aside
              className="border-divider bg-surface dark:border-divider-dark dark:bg-surface-dark sticky top-0 hidden h-dvh w-72 shrink-0 flex-col border-r px-5 py-5 md:flex"
              style={{ viewTransitionName: 'sidebar' }}
            >
              <BookSidebarContent idPrefix="desktop" />
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
              <header
                className="border-divider bg-surface/80 dark:border-divider-dark dark:bg-surface-dark/80 sticky top-0 z-20 flex items-center gap-2 border-b px-4 py-3 backdrop-blur-md backdrop-saturate-150 sm:gap-3 sm:px-6"
                style={{ viewTransitionName: 'site-header' }}
              >
                <MobileBookSidebarTrigger />
                <BookSearch />
              </header>

              <main className="flex min-w-0 flex-1 flex-col">{children}</main>
            </div>
          </div>
        </MobileBookSidebar>
        <OfflineIndicator />
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </ThemeProvider>
    </>
  );
}

function BookSidebarContent({ idPrefix, mobile = false }: { idPrefix: string; mobile?: boolean }) {
  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <Suspense fallback={<HomeLinkFallback />}>
          <HomeLink />
        </Suspense>
      </div>
      <div className="border-divider dark:border-divider-dark mt-6 border-b pb-5">
        <CatalogSize />
      </div>
      <div className="mt-5 mb-4">
        <Suspense fallback={<ApiDelayFallback idPrefix={idPrefix} />}>
          <ApiDelay idPrefix={idPrefix} />
        </Suspense>
      </div>
      <p className="text-muted mb-4 text-xs font-semibold tracking-wide uppercase">Filters</p>
      <ErrorBoundary compact title="Filters unavailable">
        <Suspense fallback={<BookFiltersFallback idPrefix={idPrefix} />}>
          <BookFilters idPrefix={idPrefix} />
        </Suspense>
      </ErrorBoundary>
      {mobile ? null : (
        <div className="border-divider dark:border-divider-dark mt-4 flex items-center justify-between gap-2 border-t pt-4">
          <ThemeToggle variant="inline" />
          <a
            aria-label="View source on GitHub"
            className="text-muted rounded-full p-1.5 transition-colors hover:text-black dark:hover:text-white"
            href="https://github.com/MaxwellCohen/waku-books"
            rel="noopener noreferrer"
            target="_blank"
          >
            <GitHubIcon className="size-4" />
          </a>
        </div>
      )}
    </>
  );
}

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
