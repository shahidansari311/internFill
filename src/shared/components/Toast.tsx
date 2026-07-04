import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import './Toast.css';

export interface ToastData {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

// ── Toast Manager (singleton) ──
type ToastListener = (toasts: ToastData[]) => void;

let toasts: ToastData[] = [];
let listeners: ToastListener[] = [];

function notifyListeners() {
  listeners.forEach((fn) => fn([...toasts]));
}

export const toast = {
  show(data: Omit<ToastData, 'id'>) {
    const id = crypto.randomUUID();
    toasts = [...toasts, { ...data, id }];
    notifyListeners();

    const duration = data.duration ?? 4000;
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id);
      notifyListeners();
    }, duration);
  },
  success(title: string, message?: string) {
    this.show({ type: 'success', title, message });
  },
  error(title: string, message?: string) {
    this.show({ type: 'error', title, message });
  },
  info(title: string, message?: string) {
    this.show({ type: 'info', title, message });
  },
  warning(title: string, message?: string) {
    this.show({ type: 'warning', title, message });
  },
};

function ToastItem({ data, onDismiss }: { data: ToastData; onDismiss: (id: string) => void }) {
  const Icon = ICONS[data.type];

  return (
    <motion.div
      className={`toast toast-${data.type}`}
      initial={{ opacity: 0, y: -12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.95 }}
      transition={{ type: 'spring', duration: 0.35 }}
      layout
    >
      <Icon className="toast-icon" size={18} />
      <div className="toast-content">
        <p className="toast-title">{data.title}</p>
        {data.message && <p className="toast-message">{data.message}</p>}
      </div>
      <button
        className="toast-close"
        onClick={() => onDismiss(data.id)}
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

export function ToastContainer(): ReactNode {
  const [items, setItems] = useState<ToastData[]>([]);

  useEffect(() => {
    const listener = (newToasts: ToastData[]) => setItems(newToasts);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    toasts = toasts.filter((t) => t.id !== id);
    notifyListeners();
  }, []);

  return (
    <div className="toast-container" aria-live="polite">
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <ToastItem key={item.id} data={item} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}
