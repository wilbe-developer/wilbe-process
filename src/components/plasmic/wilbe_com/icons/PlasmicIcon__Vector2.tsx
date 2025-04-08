/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/* prettier-ignore-start */
import React from "react";
import { classNames } from "@plasmicapp/react-web";

export type Vector2IconProps = React.ComponentProps<"svg"> & {
  title?: string;
};

export function Vector2Icon(props: Vector2IconProps) {
  const { className, style, title, ...restProps } = props;
  return (
    <svg
      xmlns={"http://www.w3.org/2000/svg"}
      fill={"none"}
      viewBox={"0 0 6 25"}
      height={"1em"}
      className={classNames("plasmic-default__svg", className)}
      style={style}
      {...restProps}
    >
      {title && <title>{title}</title>}

      <path
        d={
          "M5.018 6.91v17.638H.206V6.909h4.812zM2.621 0c.715 0 1.329.166 1.844.496.516.332.774.95.774 1.854 0 .894-.258 1.512-.774 1.854-.515.341-1.13.512-1.844.512-.727 0-1.345-.17-1.857-.512C.254 3.862 0 3.244 0 2.35 0 1.446.254.828.764.496 1.276.166 1.894 0 2.621 0z"
        }
        fill={"currentColor"}
      ></path>
    </svg>
  );
}

export default Vector2Icon;
/* prettier-ignore-end */
