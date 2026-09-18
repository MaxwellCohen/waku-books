import { BackToBooksLink } from '@/features/book/components/back-to-books-link';
import { BookDetail } from '@/features/book/components/book-detail';
import { queryToRecord } from '@/lib/href';
import { getApiDelayMs, parseSearchParams } from '@/lib/url-state';

export default function BookPage({ id, query }: { id: string; query: string }) {
  const searchParams = parseSearchParams(queryToRecord(query));

  return (
    <div className="flex flex-1 flex-col px-4 py-5 sm:px-6">
      <BackToBooksLink className="mb-6" />
      <div>
        <BookDetail delayMs={getApiDelayMs(searchParams)} id={id} />
      </div>
    </div>
  );
}

export const getConfig = async () => {
  return {
    render: 'dynamic',
  } as const;
};
