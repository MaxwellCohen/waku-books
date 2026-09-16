import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { FastLink } from '@/components/ui/fast-link';

export default function NotFoundPage() {
  return (
    <EmptyState body="That page isn't in the catalog." title="Page not found">
      <Button className="mt-1" render={<FastLink href="/" />} variant="secondary">
        Back to the shelf
      </Button>
    </EmptyState>
  );
}

export const getConfig = async () => {
  return {
    render: 'static',
  } as const;
};
