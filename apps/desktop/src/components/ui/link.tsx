import * as Headless from "@headlessui/react";
import React, { forwardRef } from "react";
import NextLink from "next/link";
import type { LinkProps } from "next/link";

export const Link = forwardRef(function Link(
  props: LinkProps & React.ComponentPropsWithoutRef<"a">,
  ref: React.ForwardedRef<HTMLAnchorElement>
) {
  return (
    <Headless.DataInteractive>
      <NextLink {...props} ref={ref} />
    </Headless.DataInteractive>
  );
});
