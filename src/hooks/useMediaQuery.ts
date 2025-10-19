import { useEffect, useState } from 'react';

export default function useMediaQuery(query: string): boolean {
  const getMatches = () => (typeof window === 'undefined' ? false : window.matchMedia(query).matches);
  const [matches, setMatches] = useState(getMatches);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const media = window.matchMedia(query);
    const updateMatches = () => setMatches(media.matches);

    updateMatches();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', updateMatches);
      return () => {
        media.removeEventListener('change', updateMatches);
      };
    }

    media.addListener(updateMatches);
    return () => {
      media.removeListener(updateMatches);
    };
  }, [query]);

  return matches;
}
