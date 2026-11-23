"use client";

import { X } from "lucide-react";
import { Dialog } from "radix-ui";
import type { ReactNode } from "react";

/**
 * Panel lateral (registro) y diálogo centrado, sobre Radix Dialog: atrapan el foco, se cierran con
 * Esc (sección 3) y devuelven el foco a quien los abrió.
 */
function Contenido({
  titulo,
  descripcion,
  children,
  lateral,
  onOpenAutoFocus,
}: {
  titulo: string;
  descripcion?: string;
  children: ReactNode;
  lateral: boolean;
  onOpenAutoFocus?: (evento: Event) => void;
}) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
      <Dialog.Content
        onOpenAutoFocus={onOpenAutoFocus}
        className={`bg-superficie border-borde text-texto fixed z-50 flex flex-col gap-5 overflow-y-auto border shadow-xl focus:outline-none ${
          lateral
            ? "top-0 right-0 h-screen w-[440px] max-w-full p-6"
            : "top-1/2 left-1/2 max-h-[90vh] w-[480px] max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg p-6"
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Dialog.Title className="text-xl font-semibold">{titulo}</Dialog.Title>
            {descripcion ? (
              <Dialog.Description className="text-texto-2 text-sm">{descripcion}</Dialog.Description>
            ) : (
              <Dialog.Description className="sr-only">{titulo}</Dialog.Description>
            )}
          </div>
          <Dialog.Close
            aria-label="Cerrar"
            className="text-texto-3 hover:text-texto hover:bg-superficie-2 focus-visible:outline-acento rounded-md p-1 focus-visible:outline-2"
          >
            <X aria-hidden="true" className="size-5" />
          </Dialog.Close>
        </div>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}

type PropsDialogo = {
  abierto: boolean;
  alCambiar: (abierto: boolean) => void;
  titulo: string;
  descripcion?: string;
  children: ReactNode;
  onOpenAutoFocus?: (evento: Event) => void;
};

export function PanelLateral({ abierto, alCambiar, ...resto }: PropsDialogo) {
  return (
    <Dialog.Root open={abierto} onOpenChange={alCambiar}>
      <Contenido lateral {...resto} />
    </Dialog.Root>
  );
}

export function Dialogo({ abierto, alCambiar, ...resto }: PropsDialogo) {
  return (
    <Dialog.Root open={abierto} onOpenChange={alCambiar}>
      <Contenido lateral={false} {...resto} />
    </Dialog.Root>
  );
}
