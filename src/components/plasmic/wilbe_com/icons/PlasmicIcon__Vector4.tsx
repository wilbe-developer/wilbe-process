/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/* prettier-ignore-start */
import React from "react";
import { classNames } from "@plasmicapp/react-web";

export type Vector4IconProps = React.ComponentProps<"svg"> & {
  title?: string;
};

export function Vector4Icon(props: Vector4IconProps) {
  const { className, style, title, ...restProps } = props;
  return (
    <svg
      xmlns={"http://www.w3.org/2000/svg"}
      fill={"none"}
      viewBox={"0 0 17 25"}
      height={"1em"}
      className={classNames("plasmic-default__svg", className)}
      style={style}
      {...restProps}
    >
      {title && <title>{title}</title>}

      <path
        d={
          "M4.812 0v5.71c0 .663-.019 1.32-.057 1.974a18.72 18.72 0 01-.131 1.514h.188c.463-.726 1.095-1.344 1.894-1.854.8-.512 1.835-.767 3.107-.767 1.977 0 3.582.773 4.813 2.32 1.23 1.546 1.846 3.813 1.846 6.8 0 2.01-.285 3.695-.854 5.056-.568 1.362-1.362 2.388-2.382 3.077-1.02.69-2.203 1.033-3.55 1.033-1.294 0-2.314-.231-3.06-.692-.746-.463-1.35-.985-1.814-1.564H4.48l-.805 1.94H0V0h4.812zm3.455 10.429c-.84 0-1.508.173-2.003.52-.495.347-.855.867-1.082 1.562-.225.694-.349 1.57-.37 2.633v.521c0 1.715.252 3.027.757 3.936.505.91 1.425 1.365 2.762 1.365.988 0 1.774-.457 2.358-1.372.584-.914.876-2.235.876-3.961 0-1.724-.294-3.022-.883-3.894-.59-.874-1.394-1.31-2.415-1.31"
        }
        fill={"currentColor"}
      ></path>
    </svg>
  );
}

export default Vector4Icon;
/* prettier-ignore-end */
