'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MoveHorizontal } from 'lucide-react';

interface Props {
  beforeImageUrl: string;
  afterImageUrl: string;
  initialPosition?: number;
  className?: string;
}

export const BeforeAfterSlider: React.FC<Props> = ({
  beforeImageUrl,
  afterImageUrl,
  initialPosition = 50,
  className = '',
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const newPosition = (x / rect.width) * 100;
      const clamped = Math.max(0, Math.min(100, newPosition));
      setPosition(clamped);
    },
    []
  );

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const onPointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    } else {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, onPointerMove, onPointerUp]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    handleMove(e.clientX);
  };

  return (
    <div
      ref={containerRef}
      className={`relative aspect-square w-full overflow-hidden select-none touch-none bg-bg-100 ${className}`}
      onPointerDown={handlePointerDown}
      style={{ cursor: isDragging ? 'ew-resize' : 'default' }}
    >
      {/* After Image (Background) - Shows on the right side of the handle */}
      <img
        src={afterImageUrl}
        alt="After"
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />

      {/* Before Image (Clipped) - Shows on the left side of the handle */}
      <div
        className="absolute inset-0 h-full w-full overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <img
          src={beforeImageUrl}
          alt="Before"
          className="h-full w-full object-cover"
          draggable={false}
        />
      </div>

      {/* Labels */}
      <div className="absolute left-3 top-3 z-20 rounded bg-bg-100/70 px-2 py-1 text-[10px] font-mono text-gray-100 backdrop-blur-sm pointer-events-none border border-line-100">
        BEFORE
      </div>
      <div className="absolute right-3 top-3 z-20 rounded bg-bg-100/70 px-2 py-1 text-[10px] font-mono text-gray-100 backdrop-blur-sm pointer-events-none border border-line-100">
        AFTER
      </div>

      {/* Handle Line */}
      <div
        className="absolute bottom-0 top-0 z-30 w-[2px] bg-primary-100 shadow-[0_0_10px_rgba(76,255,145,0.5)] pointer-events-none"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      >
        {/* Handle Circle */}
        <div
          className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary-100 shadow-[0_0_15px_rgba(76,255,145,0.4)] active:scale-110 transition-transform pointer-events-auto cursor-ew-resize"
        >
          <MoveHorizontal className="h-4 w-4 text-bg-100" />
        </div>
      </div>

      {/* Invisible overlay to capture all pointer events while dragging */}
      {isDragging && (
        <div className="absolute inset-0 z-50 cursor-ew-resize" />
      )}
    </div>
  );
};



