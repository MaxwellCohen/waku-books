import { FeatureShell } from '@/features/feature-tests/feature-shell';
import heroSrcset from '@/features/feature-tests/assets/ft-cover-a.jpg?w=200;400;800&format=webp&as=srcset';
import heroSrc from '@/features/feature-tests/assets/ft-cover-a.jpg?w=400&format=webp';
import lazySrcset from '@/features/feature-tests/assets/ft-cover-b.jpg?w=200;400;800&format=avif&as=srcset';
import lazySrc from '@/features/feature-tests/assets/ft-cover-b.jpg?w=400&format=avif';

export default function ImagePipelinePage() {
  return (
    <FeatureShell id="image-pipeline">
      <p className="text-muted text-sm">
        vite-imagetools resizes and re-encodes the source JPEGs at build time; the srcset/sizes markup is
        written by hand.
      </p>
      <img
        data-testid="hero-image"
        alt="Cover A"
        src={heroSrc}
        srcSet={heroSrcset}
        sizes="(min-width: 768px) 200px, 50vw"
        width={200}
        height={300}
        fetchPriority="high"
      />
      <div style={{ height: 6000 }} aria-hidden />
      <img
        data-testid="lazy-image"
        alt="Cover B"
        src={lazySrc}
        srcSet={lazySrcset}
        sizes="(min-width: 768px) 200px, 50vw"
        width={200}
        height={300}
        loading="lazy"
        decoding="async"
      />
    </FeatureShell>
  );
}

export const getConfig = async () => ({ render: 'static' }) as const;
