import React, { useState, useEffect } from 'react';

/**
 * TypewriterHeadline - Clean luxury character-by-character typing & word-cycling animation
 */
export default function TypewriterHeadline({
  words = ["CALM.", "PERMANENCE.", "SILENCE.", "STRUCTURE.", "SERENITY."],
  typingSpeed = 85,
  deletingSpeed = 45,
  pauseTime = 2200,
  className = ""
}) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[currentWordIndex % words.length];
    let timer;

    if (!isDeleting) {
      // Typing phase
      if (displayText.length < currentWord.length) {
        timer = setTimeout(() => {
          setDisplayText(currentWord.slice(0, displayText.length + 1));
        }, typingSpeed);
      } else {
        // Full word typed -> pause then start deleting
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, pauseTime);
      }
    } else {
      // Deleting phase
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(currentWord.slice(0, displayText.length - 1));
        }, deletingSpeed);
      } else {
        // Finished deleting -> move to next word
        setIsDeleting(false);
        setCurrentWordIndex(prev => (prev + 1) % words.length);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentWordIndex, words, typingSpeed, deletingSpeed, pauseTime]);

  return (
    <span className={`inline-flex items-center ${className}`}>
      <span>{displayText}</span>
      {/* Sleek luxury vertical blinking cursor */}
      <span
        className="inline-block w-[2.5px] h-[0.9em] ml-1 bg-camel-600 dark:bg-camel-400 rounded-full animate-pulse transition-opacity"
        style={{ animationDuration: '0.9s' }}
        aria-hidden="true"
      />
    </span>
  );
}
