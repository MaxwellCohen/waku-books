'use client';

import geistLatin from '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url';
import { preload } from 'react-dom';

/**
 * Waku has no font API. Preload the Latin Geist face that styles.css's Fontsource
 * @font-face points at (same hashed asset), so text doesn't wait on the stylesheet.
 * React's preload() runs during SSR and emits one deduplicated <link rel="preload">.
 */
export function FontPreload() {
  preload(geistLatin, { as: 'font', crossOrigin: 'anonymous', type: 'font/woff2' });
  return null;
}
