import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext.jsx';

export default function Toast() {
  const { toastMessage } = usePlayer();

  if (!toastMessage) return null;

  return (
    <div className="toast-notification" role="status" aria-live="polite">
      <CheckCircle2 size={18} color="var(--primary)" />
      <span>{toastMessage}</span>
    </div>
  );
}
