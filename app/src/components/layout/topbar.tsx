'use client';

type TopbarProps = {
  title?: string;
  actions?: React.ReactNode;
};

export function Topbar({ title, actions }: TopbarProps) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b px-4">
      {title && (
        <h1 className="text-sm font-medium text-muted-foreground truncate">{title}</h1>
      )}
      {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
    </header>
  );
}
