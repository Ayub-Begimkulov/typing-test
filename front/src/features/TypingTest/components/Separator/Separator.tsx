import { Fragment, memo } from "react";
import clsx from "clsx";
import { TextPartProps } from "../../types";
import styles from "./Separator.module.scss";

interface SeparatorProps extends TextPartProps {
  separator: string;
}

export const Separator = memo(function Separator({
  separator,
  typed,
  caret,
}: SeparatorProps) {
  return separator.split("").map((item, index) => {
    const ref = index === caret?.index ? caret.ref : undefined;
    const isError = typed && typed.length > index && typed[index] !== item;

    return (
      <Fragment key={index}>
        <span
          ref={ref}
          className={clsx(styles.separator, isError && styles.separator_error)}
        >
          {item === "\n" ? "↩" : " "}
        </span>
        {item === "\n" && <br />}
      </Fragment>
    );
  });
});
