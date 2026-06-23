"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

/**
 * Dialog konfirmasi hapus untuk Owner Dashboard.
 * Muncul sebelum delete → "Hapus" atau "Batal".
 */
export function ConfirmDeleteDialog({
  open,
  onClose,
  onConfirm,
  title = "Hapus Data",
  message = "Apakah Anda yakin ingin menghapus? Tindakan ini tidak dapat dibatalkan.",
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="sm"
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>
          <Button
            className="bg-error text-white hover:bg-error/90"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Hapus
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-error/10 text-error">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <p className="text-sm text-black/70">{message}</p>
      </div>
    </Dialog>
  );
}
