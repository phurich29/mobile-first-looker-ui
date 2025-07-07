import { useState, useEffect, useRef } from 'react';

export const useTypewriter = (text: string, speed: number = 50) => {
  const [displayedText, setDisplayedText] = useState('');
  const index = useRef(0);

  useEffect(() => {
    const segmenter = new Intl.Segmenter('th', { granularity: 'grapheme' });
    const graphemes = Array.from(segmenter.segment(text)).map(s => s.segment);

    setDisplayedText('');
    index.current = 0;

    const intervalId = setInterval(() => {
      if (index.current < graphemes.length) {
        // Build up the text based on the array of graphemes
        // This is more robust for complex scripts like Thai
        const currentText = graphemes.slice(0, index.current + 1).join('');
        setDisplayedText(currentText);
        index.current += 1;
      } else {
        clearInterval(intervalId);
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed]);

  return displayedText;
};
