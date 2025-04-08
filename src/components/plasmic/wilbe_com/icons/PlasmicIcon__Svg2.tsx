/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/* prettier-ignore-start */
import React from "react";
import { classNames } from "@plasmicapp/react-web";

export type Svg2IconProps = React.ComponentProps<"svg"> & {
  title?: string;
};

export function Svg2Icon(props: Svg2IconProps) {
  const { className, style, title, ...restProps } = props;
  return (
    <svg
      xmlns={"http://www.w3.org/2000/svg"}
      fill={"none"}
      viewBox={"0 0 9 15"}
      height={"1em"}
      className={classNames("plasmic-default__svg", className)}
      style={style}
      {...restProps}
    >
      {title && <title>{title}</title>}

      <path
        d={
          "M.75.553L1.309 0l6.777 6.73-6.778 6.729-.558-.554L6.97 6.73.749.553z"
        }
        fill={"currentColor"}
      ></path>
    </svg>
  );
}

export default Svg2Icon;
/* prettier-ignore-end */
