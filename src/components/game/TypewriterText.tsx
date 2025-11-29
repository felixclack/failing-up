'use client';

import { useState, useEffect, useCallback } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number; // ms per character
  className?: string;
  onComplete?: () => void;
  startDelay?: number; // delay before starting
  skipAnimation?: boolean; // instantly show text
}

export function TypewriterText({
  text,
  speed = 20,
  className = '',
  onComplete,
  startDelay = 0,
  skipAnimation = false,
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [shouldNotify, setShouldNotify] = useState(false);

  // Reset when text changes
  useEffect(() => {
    if (skipAnimation) {
      setDisplayedText(text);
      setIsComplete(true);
      setHasStarted(true);
      setShouldNotify(true);
      return;
    }

    setDisplayedText('');
    setIsComplete(false);
    setHasStarted(false);
    setShouldNotify(false);

    // Start delay
    const startTimer = setTimeout(() => {
      setHasStarted(true);
    }, startDelay);

    return () => clearTimeout(startTimer);
  }, [text, skipAnimation, startDelay]);

  // Notify parent via effect to avoid setState-during-render
  useEffect(() => {
    if (shouldNotify && isComplete) {
      onComplete?.();
    }
  }, [shouldNotify, isComplete, onComplete]);

  // Typewriter effect
  useEffect(() => {
    if (!hasStarted || skipAnimation || isComplete) return;

    if (displayedText.length < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(text.slice(0, displayedText.length + 1));
      }, speed);
      return () => clearTimeout(timer);
    } else {
      setIsComplete(true);
      setShouldNotify(true);
    }
  }, [displayedText, text, speed, hasStarted, skipAnimation, isComplete]);

  // Allow clicking to skip animation
  const handleClick = useCallback(() => {
    if (!isComplete) {
      setDisplayedText(text);
      setIsComplete(true);
      setShouldNotify(true);
    }
  }, [isComplete, text]);

  return (
    <span className={className} onClick={handleClick}>
      {displayedText}
      {!isComplete && hasStarted && (
        <span className="animate-pulse">▌</span>
      )}
    </span>
  );
}

// Component that reveals multiple lines sequentially
interface TypewriterSequenceProps {
  items: Array<{
    id: string;
    text: string;
    className?: string;
    prefix?: string;
    prefixClassName?: string;
  }>;
  speed?: number;
  delayBetween?: number; // delay between items
  onAllComplete?: () => void;
  skipAnimation?: boolean;
}

export function TypewriterSequence({
  items,
  speed = 20,
  delayBetween = 300,
  onAllComplete,
  skipAnimation = false,
}: TypewriterSequenceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [allDone, setAllDone] = useState(false);

  // Reset when items change
  useEffect(() => {
    setCurrentIndex(0);
    setCompletedItems(new Set());
    setAllDone(false);
  }, [items]);

  // Call onAllComplete via effect to avoid setState-during-render
  useEffect(() => {
    if (allDone) {
      onAllComplete?.();
    }
  }, [allDone, onAllComplete]);

  const handleItemComplete = useCallback((id: string) => {
    setCompletedItems(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

    // Move to next item after delay
    setTimeout(() => {
      setCurrentIndex(prev => {
        const next = prev + 1;
        if (next >= items.length) {
          setAllDone(true);
        }
        return next;
      });
    }, delayBetween);
  }, [items.length, delayBetween]);

  if (skipAnimation) {
    return (
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id}>
            {item.prefix && (
              <span className={item.prefixClassName}>{item.prefix}</span>
            )}
            <span className={item.className}>{item.text}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.slice(0, currentIndex + 1).map((item, index) => (
        <div key={item.id}>
          {item.prefix && (
            <span className={item.prefixClassName}>{item.prefix}</span>
          )}
          {index < currentIndex || completedItems.has(item.id) ? (
            <span className={item.className}>{item.text}</span>
          ) : (
            <TypewriterText
              text={item.text}
              speed={speed}
              className={item.className}
              onComplete={() => handleItemComplete(item.id)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
