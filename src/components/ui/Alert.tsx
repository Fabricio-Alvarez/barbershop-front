import { AlertCircle, CheckCircle2, X } from 'lucide-react';

interface AlertProps {
  tone: 'error' | 'success' | 'info';
  children: React.ReactNode;
  onClose?: () => void;
}

export function Alert({ tone, children, onClose }: AlertProps) {
  return (
    <div className={`alert alert--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      {tone === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
      <span>{children}</span>
      {onClose && (
        <button className="icon-button" type="button" onClick={onClose} aria-label="Cerrar mensaje">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
