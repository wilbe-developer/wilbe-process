/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/* prettier-ignore-start */
import React from "react";
import { classNames } from "@plasmicapp/react-web";

export type VectorIconProps = React.ComponentProps<"svg"> & {
  title?: string;
};

export function VectorIcon(props: VectorIconProps) {
  const { className, style, title, ...restProps } = props;
  return (
    <svg
      xmlns={"http://www.w3.org/2000/svg"}
      fill={"none"}
      viewBox={"0 0 32 24"}
      height={"1em"}
      className={classNames("plasmic-default__svg", className)}
      style={style}
      {...restProps}
    >
      {title && <title>{title}</title>}

      <path
        d={
          "M31.24 0l-5.87 23.066H19.8L16.677 10.95a24.792 24.792 0 01-.253-1.057c-.114-.518-.224-1.035-.33-1.554a61.176 61.176 0 01-.308-1.593c-.09-.5-.15-.897-.181-1.192-.032.295-.092.69-.181 1.184a96.907 96.907 0 01-.626 3.14c-.104.483-.188.851-.25 1.104L11.44 23.066H5.884L0 0h4.812l2.951 12.59c.083.38.18.832.29 1.358a93.064 93.064 0 01.631 3.303c.09.531.157.992.199 1.382.052-.4.12-.866.203-1.397.085-.531.176-1.072.276-1.623.093-.515.196-1.028.308-1.539.105-.474.2-.859.285-1.154L13.315 0h4.624l3.36 12.92c.073.285.16.667.259 1.147a88.484 88.484 0 01.601 3.184c.089.531.155.992.198 1.382.073-.526.175-1.164.305-1.916.132-.751.274-1.5.427-2.248a99.56 99.56 0 01.402-1.879L26.427 0h4.813z"
        }
        fill={"currentColor"}
      ></path>
    </svg>
  );
}

export default VectorIcon;
/* prettier-ignore-end */
