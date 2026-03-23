'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface SingleRangeSliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  onReset: () => void;
  formatLabel?: (value: number) => string;
  label: string;
}

export function SingleRangeSlider({
  min,
  max,
  step,
  value,
  onChange,
  onReset,
  formatLabel,
  label,
}: SingleRangeSliderProps) {
  const [localValue, setLocalValue] = useState(value);
  const [inputValue, setInputValue] = useState(value.toString());
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalValue(value);
    setInputValue(value.toString());
  }, [value]);

  const handleValueChange = (newValue: number) => {
    const clampedValue = Math.max(min, Math.min(max, newValue));
    setLocalValue(clampedValue);
    setInputValue(clampedValue.toString());
    onChange(clampedValue);
  };

  const getValueFromPosition = (clientX: number): number => {
    if (!trackRef.current) return min;

    const rect = trackRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const rawValue = min + percent * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    return Math.max(min, Math.min(max, steppedValue));
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return;
    const clickValue = getValueFromPosition(e.clientX);
    handleValueChange(clickValue);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const value = getValueFromPosition(moveEvent.clientX);
      handleValueChange(value);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);

    const handleTouchMove = (moveEvent: TouchEvent) => {
      const touch = moveEvent.touches[0];
      const value = getValueFromPosition(touch.clientX);
      handleValueChange(value);
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleInputChange = (val: string) => {
    setInputValue(val);
    const num = parseInt(val);
    if (!isNaN(num) && num >= min && num <= max) {
      setLocalValue(num);
      onChange(num);
    }
  };

  const handleInputBlur = () => {
    const num = parseInt(inputValue);
    if (isNaN(num) || num < min || num > max) {
      setInputValue(localValue.toString());
    }
  };

  const formatValue = (val: number) => {
    if (formatLabel) return formatLabel(val);
    return val.toLocaleString('nb-NO');
  };

  const percent = ((localValue - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      <label className="text-sm font-medium text-slate-100 block mb-2.5">
        {label}
      </label>

      <div className="flex items-start gap-2 mb-3">
        <div className="flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={handleInputBlur}
            className="w-full h-10 px-2 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Minimum"
          />
        </div>
        <button
          onClick={onReset}
          className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
          title="Nullstill"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="relative h-8 mr-10">
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          className="absolute w-full h-1 top-1/2 -translate-y-1/2 bg-slate-600 rounded-full cursor-pointer"
        />
        <div
          className="absolute h-1 top-1/2 -translate-y-1/2 bg-slate-400 rounded-full transition-all pointer-events-none"
          style={{
            left: '0%',
            right: `${100 - percent}%`
          }}
        />

        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing"
          style={{
            left: `${percent}%`,
            zIndex: 10,
            touchAction: 'none',
          }}
        >
          <div className="relative w-5 h-5">
            <div className="absolute inset-0 -m-2 rounded-full" />
            <div className={`w-5 h-5 rounded-full bg-slate-800 border-2 border-white shadow-lg transition-transform hover:scale-110 ${
              isDragging ? 'scale-110 ring-2 ring-blue-400' : ''
            }`} />
          </div>
        </div>
      </div>
    </div>
  );
}
