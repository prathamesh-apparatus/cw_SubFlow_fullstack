'use client';
import { Button } from '@/components/ui/button';

export function Pagination({ page, totalPages, onPageChange, alwaysShow = false }: { page: number; totalPages: number; onPageChange: (page: number) => void; alwaysShow?: boolean }) {
  const pages = Math.max(1, totalPages);
  if (!alwaysShow && pages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-between">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</Button>
      <span className="text-sm text-muted-foreground">Page {page} of {pages}</span>
      <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>Next</Button>
    </div>
  );
}
