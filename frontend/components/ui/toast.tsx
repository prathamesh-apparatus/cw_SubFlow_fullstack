'use client';
import { createContext, useCallback, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';
type Toast = { id: number; title: string; variant?: 'success' | 'error' };
const Ctx = createContext<{ toast: (t: Omit<Toast, 'id'>) => void }>({ toast: () => {} });
export const useToast = () => useContext(Ctx);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toast = useCallback((t: Omit<Toast, 'id'>) => { const id = Date.now() + Math.random(); setToasts((p) => [...p, { ...t, id }]); setTimeout(() => setToasts((p) => p.filter((x) => x.id !== id)), 4000); }, []);
  return <Ctx.Provider value={{ toast }}>{children}<div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">{toasts.map((t) => (<div key={t.id} className="flex items-center gap-2 rounded-lg border bg-card px-4 py-3 shadow-lg text-sm">{t.variant === 'error' ? <XCircle className="h-4 w-4 text-destructive" /> : <CheckCircle2 className="h-4 w-4 text-green-600" />}<span>{t.title}</span><button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}><X className="h-4 w-4" /></button></div>))}</div></Ctx.Provider>;
}
