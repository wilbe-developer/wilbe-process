/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/* prettier-ignore-start */
import React from "react";
import { classNames } from "@plasmicapp/react-web";

export type Vector5IconProps = React.ComponentProps<"svg"> & {
  title?: string;
};

export function Vector5Icon(props: Vector5IconProps) {
  const { className, style, title, ...restProps } = props;
  return (
    <svg
      xmlns={"http://www.w3.org/2000/svg"}
      fill={"none"}
      viewBox={"0 0 17 19"}
      height={"1em"}
      className={classNames("plasmic-default__svg", className)}
      style={style}
      {...restProps}
    >
      {title && <title>{title}</title>}

      <path
        d={
          "M8.347 0c1.629 0 3.033.314 4.211.94a6.504 6.504 0 012.728 2.723c.642 1.188.963 2.64.963 4.353v2.336H4.874c.053 1.357.461 2.421 1.224 3.194.763.773 1.822 1.16 3.18 1.159 1.124 0 2.154-.116 3.089-.348.936-.231 1.9-.578 2.889-1.04v3.723c-.869.43-1.789.748-2.738.946-.951.2-2.105.3-3.462.3-1.767 0-3.332-.326-4.695-.978-1.362-.651-2.43-1.645-3.202-2.98C.386 12.99 0 11.308 0 9.278c0-2.062.349-3.779 1.047-5.15.7-1.374 1.676-2.404 2.926-3.093C5.226.345 6.683 0 8.346 0m.03 3.425c-.935 0-1.71.3-2.325.9-.616.6-.97 1.54-1.065 2.822h6.75c-.01-.714-.138-1.35-.387-1.908a3.03 3.03 0 00-1.104-1.325c-.488-.326-1.111-.49-1.869-.49z"
        }
        fill={"currentColor"}
      ></path>
    </svg>
  );
}

export default Vector5Icon;
/* prettier-ignore-end */
