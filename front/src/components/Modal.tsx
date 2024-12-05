import { ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  children: ReactNode;
  onClose: () => void;
}

export function Modal({ open, children, onClose }: ModalProps) {
  if (!open) {
    return null;
  }

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
        onClick={onClose}
      ></div>
      <div
        style={{
          position: "absolute",
          minWidth: 350,
          background: "#2e2e2e",
          borderRadius: 8,
          padding: 24,
        }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
