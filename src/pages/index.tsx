import { Suspense } from 'react';
import { AnimatedSuspense } from '@/components/ui/animated-suspense';
import { getBooksPage } from '@/features/book/book-queries';
import { toBookQuery } from '@/features/book/book-utils';
import { BookGrid, BookGridSkeleton } from '@/features/book/components/book-grid';
import { BookPagination, BookPaginationSkeleton } from '@/features/book/components/book-pagination';
import { queryToRecord } from '@/lib/href';
import { waitForApiDelay } from '@/lib/api-delay';
import { getApiDelayMs, parseSearchParams } from '@/lib/url-state';
import type { SearchParams } from '@/lib/url-state';

export default function HomePage({ query }: { query: string }) {
  const searchParams = parseSearchParams(queryToRecord(query));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <title>Waku Books</title>
      <div className="flex-1 px-4 py-5 transition-opacity duration-200 ease-out group-has-[[data-filtering]]:opacity-60 sm:px-6">
        <AnimatedSuspense fallback={<BookGridSkeleton />}>
          <BookResults searchParams={searchParams} />
        </AnimatedSuspense>
      </div>
      <footer className="border-divider dark:border-divider-dark mt-auto border-t px-4 py-3 sm:px-6">
        <Suspense fallback={<BookPaginationSkeleton />}>
          <BookPagination searchParams={searchParams} />
        </Suspense>
      </footer>
    </div>
  );
}

async function BookResults({ searchParams }: { searchParams: SearchParams }) {
  await waitForApiDelay(getApiDelayMs(searchParams));
  const books = await getBooksPage(toBookQuery(searchParams));

  return <BookGrid books={books} searchParams={searchParams} />;
}

export const getConfig = async () => {
  return {
    render: 'dynamic',
  } as const;
};
