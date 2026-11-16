'use client';
import { Button } from '@/components/ui/button';

export function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (page: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-between">
      <Button variant="outline" className="h-9 px-4 text-xs" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Previous</Button>
      <span className="text-xs text-muted-foreground">Page {page} of {totalPages}</span>
      <Button variant="outline" className="h-9 px-4 text-xs" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</Button>
    </div>
  );
}
