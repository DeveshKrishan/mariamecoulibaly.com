export function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div
      className={['skeleton-block rounded-sm', className].filter(Boolean).join(' ')}
    />
  );
}
