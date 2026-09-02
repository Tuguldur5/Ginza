// app/components/Modal.tsx

import { ReactNode } from "react";

// 1. Үйлдлийн төрлийг тодорхойлсон интерфейсийг олж засна
interface ModalAction {
  label: string;
  onClick: () => void;
  variant?: "danger" | "primary" | "soft";
  // 👇 ЭНЭ МӨРИЙГ НЭМЖ ӨГНӨ (асуултын тэмдэг нь энэ заавал байх албагүй гэдгийг илтгэнэ)
  disabled?: boolean; 
}

interface ModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  actions?: ModalAction[]; // actions массив нь ModalAction төрлийнх байна
}

export const Modal = ({
  isOpen,
  title,
  children,
  onClose,
  actions,
}: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">{children}</div>

        {actions && actions.length > 0 && (
          <div className="modal-actions">
            {actions.map((action, index) => (
              <button
                key={index}
                className={`btn btn-${action.variant || "soft"}`}
                onClick={action.onClick}
                // 👇 Компонент доторх товчлуур дээр disabled шинжийг холбож өгнө
                disabled={action.disabled} 
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};