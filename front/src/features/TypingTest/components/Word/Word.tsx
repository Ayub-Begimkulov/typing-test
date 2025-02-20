import { memo } from "react";
import clsx from "clsx";
import { TextPartProps } from "../../types";
import styles from "./Word.module.scss";

interface WordProps extends TextPartProps {
  word: string;
}

export const Word = memo(function Word({ word, typed, caret }: WordProps) {
  return (
    <span className={styles.word}>
      {word.split("").map((item, index) => {
        const typedLetter = typed?.[index];
        const ref = index === caret?.index ? caret.ref : undefined;

        return (
          <span
            ref={ref}
            key={index}
            className={clsx(styles.wordLetter, {
              [styles.wordLetter_correct]: typedLetter === item,
              [styles.wordLetter_error]: typedLetter && typedLetter !== item,
            })}
          >
            {item}
          </span>
        );
      })}
    </span>
  );
});
