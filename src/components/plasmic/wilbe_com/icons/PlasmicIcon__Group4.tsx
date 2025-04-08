/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/* prettier-ignore-start */
import React from "react";
import { classNames } from "@plasmicapp/react-web";

export type Group4IconProps = React.ComponentProps<"svg"> & {
  title?: string;
};

export function Group4Icon(props: Group4IconProps) {
  const { className, style, title, ...restProps } = props;
  return (
    <svg
      xmlns={"http://www.w3.org/2000/svg"}
      fill={"none"}
      viewBox={"0 0 32 21"}
      height={"1em"}
      className={classNames("plasmic-default__svg", className)}
      style={style}
      {...restProps}
    >
      {title && <title>{title}</title>}

      <path
        d={
          "M17.454 12.998c0 4.159 3.423 7.528 7.562 7.364 3.774-.148 6.832-3.247 6.978-7.072.162-4.194-3.162-7.663-7.267-7.663h-.025a1.975 1.975 0 01-1.895-2.558A15.18 15.18 0 0123.819.602a.5.5 0 00.042-.419c-.042-.084-.124-.167-.207-.167-.124-.042-.248 0-.413.125a16.814 16.814 0 00-4.215 5.654c-.91 2.01-1.446 4.146-1.53 6.407-.04.251-.04.544-.04.796zM0 12.998c0 4.159 3.422 7.528 7.562 7.364 3.773-.148 6.83-3.247 6.978-7.072.161-4.194-3.163-7.663-7.267-7.663h-.026A1.975 1.975 0 015.353 3.07 15.25 15.25 0 016.363.603a.5.5 0 00.042-.419C6.364.1 6.281.016 6.198.016c-.123-.042-.247 0-.413.125A16.814 16.814 0 001.57 5.795C.661 7.805.124 9.94.041 12.202c-.04.251-.04.544-.04.796H0z"
        }
        fill={"currentColor"}
      ></path>
    </svg>
  );
}

export default Group4Icon;
/* prettier-ignore-end */
