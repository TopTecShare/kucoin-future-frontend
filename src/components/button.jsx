import React from "react";
import clsx from "clsx";
import BaseButton from "@material-ui/core/Button";
import BeatLoader from "react-spinners/BeatLoader";

import "../styles/button.scss";

const Button = ({
  children,
  disabled,
  customClass,
  secondary,
  loading,
  ...props
}) => {
  const classes = clsx(
    "button",
    { disabled: disabled },
    { secondary: secondary },
    customClass
  );

  return (
    <BaseButton className={classes} {...props}>
      {loading ? <BeatLoader color="#fff" loading={true} size={8} /> : children}
    </BaseButton>
  );
};

export default Button;
