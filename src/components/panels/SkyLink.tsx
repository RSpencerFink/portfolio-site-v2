'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { softNav } from './softNav';

/** A link that opens its target as a panel over the sky. Use for star links only. */
export function SkyLink({ onClick, ...props }: ComponentProps<typeof Link> & { href: string }) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        softNav.set(props.href);
        onClick?.(e);
      }}
    />
  );
}
