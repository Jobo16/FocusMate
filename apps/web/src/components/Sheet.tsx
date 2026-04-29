import { useRef, useState, type PointerEvent, type ReactNode } from "react";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export const Sheet = ({ open, onClose, children }: SheetProps) => {
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragOffsetRef = useRef(0);
  const pointerId = useRef<number | null>(null);

  if (!open) return null;

  const startDrag = (event: PointerEvent<HTMLButtonElement>) => {
    pointerId.current = event.pointerId;
    dragStartY.current = event.clientY;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (pointerId.current !== event.pointerId) return;
    const nextOffset = Math.max(0, event.clientY - dragStartY.current);
    dragOffsetRef.current = nextOffset;
    setDragOffset(nextOffset);
  };

  const endDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (pointerId.current !== event.pointerId) return;
    const shouldClose = dragOffsetRef.current > 88;
    pointerId.current = null;
    dragOffsetRef.current = 0;
    setDragging(false);
    setDragOffset(0);
    if (shouldClose) onClose();
  };

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-20 mx-auto flex max-h-[calc(100dvh-16px)] max-w-xl flex-col rounded-t-[30px] bg-paper px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-3 shadow-sheet ring-1 ring-black/10 ${
        dragging ? "" : "transition-transform duration-200 ease-out"
      }`}
      style={{ transform: `translateY(${dragOffset}px)` }}
    >
      <button
        type="button"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="mx-auto mb-4 flex h-6 w-20 touch-none items-center justify-center rounded-full"
        aria-label="向下拖动收起"
      >
        <span className="h-1.5 w-12 rounded-full bg-black/20" />
      </button>
      <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
};
