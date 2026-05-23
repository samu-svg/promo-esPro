"use client";

import { useEffect, useId, useRef } from "react";

export function useModalDialog(open: boolean, onClose: () => void) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      returnFocusRef.current = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
      if (!dialog.open) dialog.showModal();
      requestAnimationFrame(() => {
        const closeBtn = dialog.querySelector<HTMLElement>("[data-modal-close]");
        closeBtn?.focus();
      });
      return;
    }

    if (dialog.open) dialog.close();
    returnFocusRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    function handleCancel(e: Event) {
      e.preventDefault();
      onClose();
    }

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  return { dialogRef, titleId };
}
