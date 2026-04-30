import { useEffect, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full";
  className?: string;
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
  "2xl": "max-w-4xl",
  "3xl": "max-w-6xl",
  full: "max-w-[95vw]",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  className,
}: ModalProps) {
  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/35 animate-fade-in" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2",
            "bg-white rounded-xl shadow-lg border border-slate-200 animate-fade-in flex flex-col max-h-[90vh]",
            sizeClasses[size],
            className,
          )}
        >
          <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-100">
            <div className="min-w-0">
              <Dialog.Title className="text-base font-semibold text-slate-900">
                {title}
              </Dialog.Title>
              {description ? (
                <Dialog.Description className="mt-1 text-sm text-slate-500">
                  {description}
                </Dialog.Description>
              ) : (
                <Dialog.Description className="sr-only">
                  {`${title} dialog`}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close asChild>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>
          <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
