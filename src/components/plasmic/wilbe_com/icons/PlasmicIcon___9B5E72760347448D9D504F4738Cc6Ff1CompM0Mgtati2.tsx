/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/* prettier-ignore-start */
import React from "react";
import { classNames } from "@plasmicapp/react-web";

export type _9B5E72760347448D9D504F4738Cc6Ff1CompM0Mgtati2IconProps =
  React.ComponentProps<"svg"> & {
    title?: string;
  };

export function _9B5E72760347448D9D504F4738Cc6Ff1CompM0Mgtati2Icon(
  props: _9B5E72760347448D9D504F4738Cc6Ff1CompM0Mgtati2IconProps
) {
  const { className, style, title, ...restProps } = props;
  return (
    <svg
      xmlns={"http://www.w3.org/2000/svg"}
      fill={"none"}
      viewBox={"0 0 56 56"}
      height={"1em"}
      className={classNames("plasmic-default__svg", className)}
      style={style}
      {...restProps}
    >
      {title && <title>{title}</title>}

      <path d={"M0 55.294h55.296V0H0v55.294z"} fill={"currentColor"}></path>
    </svg>
  );
}

export default _9B5E72760347448D9D504F4738Cc6Ff1CompM0Mgtati2Icon;
/* prettier-ignore-end */
