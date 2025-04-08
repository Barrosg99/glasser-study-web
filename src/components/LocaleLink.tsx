"use client";

import { useCurrentLocale } from "@/hooks/useCurrentLocale";
import Link from "next/link";

export default function LocaleLink({
  children,
  className,
  href,
  style,
}: {
  children: React.ReactNode;
  className: string;
  href: string;
  style?: React.CSSProperties;
}) {
  const locale = useCurrentLocale();

  return (
    <Link href={`/${locale}${href}`} className={className} style={style}>
      {children}
    </Link>
  );
}
