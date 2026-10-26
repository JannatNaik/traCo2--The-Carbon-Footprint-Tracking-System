import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };
  return { toasts, show };
}

export function ToastContainer({ toasts }) {
  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
      {toasts.map(t => (
        <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
          t.type === 'success' ? 'bg-primary-600' : 'bg-red-600'
        }`}>
          {t.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {t.message}
        </div>
      ))}
    </div>
  );
}
