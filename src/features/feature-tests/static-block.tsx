// Server component only: neither this code nor this marker may reach the client.
const STATIC_MARKER = 'ft-static-only-marker-91c2';

export function StaticBlock() {
  const checksum = [...STATIC_MARKER].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return (
    <section data-testid="static-block" className="rounded border p-3">
      Static server component (checksum {checksum}). Rendered on the server, no client code.
    </section>
  );
}
