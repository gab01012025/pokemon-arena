'use client';

export function PopupLink({ href, className, children, width = 770, height = 560 }: {
  href: string;
  className?: string;
  children: React.ReactNode;
  width?: number;
  height?: number;
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        window.open(
          href,
          'pokearena',
          `width=${width},height=${height},menubar=no,toolbar=no,location=no,status=no,scrollbars=no,resizable=yes`
        );
      }}
    >
      {children}
    </a>
  );
}
