import { Suspense } from 'react';
import {
  EMPTY_IMAGE_URL,
  getLargeBookImageUrl,
  PRIORITY_COVER_COUNT,
} from '@/features/book/book-constants';
import { getBooksPage, type BookSummary } from '@/features/book/book-queries';
import { toBookQuery } from '@/features/book/book-utils';
import { BookGrid } from '@/features/book/components/book-grid';
import { BookPagination, BookPaginationSkeleton } from '@/features/book/components/book-pagination';
import { queryToRecord } from '@/lib/href';
import { waitForApiDelay } from '@/lib/api-delay';
import { getApiDelayMs, parseSearchParams } from '@/lib/url-state';

const GRID_SIZES =
  '(min-width: 1280px) 14vw, (min-width: 1024px) 16vw, (min-width: 768px) 20vw, (min-width: 640px) 25vw, 33vw';

export default async function HomePage({ query }: { query: string }) {
  const searchParams = parseSearchParams(queryToRecord(query));
  await waitForApiDelay(getApiDelayMs(searchParams));
  const books = await getBooksPage(toBookQuery(searchParams));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <title>Waku Books</title>
      <CoverPreloads books={books} />
      <div className="flex-1 px-4 py-5 transition-opacity duration-200 ease-out group-has-[[data-filtering]]:opacity-60 sm:px-6">
        <BookGrid books={books} searchParams={searchParams} />
      </div>
      <footer className="border-divider dark:border-divider-dark mt-auto border-t px-4 py-3 sm:px-6">
        <Suspense fallback={<BookPaginationSkeleton />}>
          <BookPagination searchParams={searchParams} />
        </Suspense>
      </footer>
    </div>
  );
}

function CoverPreloads({ books }: { books: BookSummary[] }) {
  return books.slice(0, PRIORITY_COVER_COUNT).map((book, index) => {
    if (!book.image_url || book.image_url === EMPTY_IMAGE_URL) return null;
    return (
      <link
        key={book.id}
        rel="preload"
        as="image"
        href={getLargeBookImageUrl(book.image_url)}
        imageSizes={GRID_SIZES}
        fetchPriority={index === 0 ? 'high' : 'auto'}
      />
    );
  });
}

export const getConfig = async () => {
  return {
    render: 'dynamic',
  } as const;
};
