'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface DualRangeSliderProps {
  min: number;
  max: number;
  step: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
  onReset: () => void;
  formatLabel?: (value: number) => string;
  label: string;
  unit?: string;
}

export function DualRangeSlider({
  min,
  max,
  step,
  valueMin,
  valueMax,
  onChange,
  onReset,
  formatLabel,
  label,
  unit = '',
}: DualRangeSliderProps) {
  const [localMin, setLocalMin] = useState(valueMin);
  const [localMax, setLocalMax] = useState(valueMax);
  const [inputMin, setInputMin] = useState(valueMin.toString());
  const [inputMax, setInputMax] = useState(valueMax.toString());
  const [activeHandle, setActiveHandle] = useState<'min' | 'max' | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const formatValue = (value: number) => {
    if (formatLabel) return formatLabel(value);
    return value.toLocaleString('nb-NO');
  };

  useEffect(() => {
    setLocalMin(valueMin);
    setLocalMax(valueMax);
    setInputMin(formatValue(valueMin));
    setInputMax(formatValue(valueMax));
  }, [valueMin, valueMax]);

  const handleMinChange = (value: number) => {
    const newMin = Math.min(Math.max(value, min), localMax);
    setLocalMin(newMin);
    setInputMin(formatValue(newMin));
    onChange(newMin, localMax);
  };

  const handleMaxChange = (value: number) => {
    const newMax = Math.max(Math.min(value, max), localMin);
    setLocalMax(newMax);
    setInputMax(formatValue(newMax));
    onChange(localMin, newMax);
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
    if (isDragging.current) return;

    const clickValue = getValueFromPosition(e.clientX);
    const distToMin = Math.abs(clickValue - localMin);
    const distToMax = Math.abs(clickValue - localMax);

    if (distToMin < distToMax) {
      handleMinChange(clickValue);
      setActiveHandle('min');
    } else {
      handleMaxChange(clickValue);
      setActiveHandle('max');
    }
  };

  const handleMouseDown = (handle: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    setActiveHandle(handle);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const value = getValueFromPosition(moveEvent.clientX);
      if (handle === 'min') {
        handleMinChange(value);
      } else {
        handleMaxChange(value);
      }
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (handle: 'min' | 'max') => (e: React.TouchEvent) => {
    isDragging.current = true;
    setActiveHandle(handle);

    const handleTouchMove = (moveEvent: TouchEvent) => {
      const touch = moveEvent.touches[0];
      const value = getValueFromPosition(touch.clientX);
      if (handle === 'min') {
        handleMinChange(value);
      } else {
        handleMaxChange(value);
      }
    };

    const handleTouchEnd = () => {
      isDragging.current = false;
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleInputMinChange = (value: string) => {
    setInputMin(value);
    const cleanValue = value.replace(/\./g, '').replace(/\s/g, '');
    const num = parseInt(cleanValue);
    if (!isNaN(num) && num >= min && num <= localMax) {
      setLocalMin(num);
      onChange(num, localMax);
    }
  };

  const handleInputMaxChange = (value: string) => {
    setInputMax(value);
    const cleanValue = value.replace(/\./g, '').replace(/\s/g, '');
    const num = parseInt(cleanValue);
    if (!isNaN(num) && num <= max && num >= localMin) {
      setLocalMax(num);
      onChange(localMin, num);
    }
  };

  const handleInputMinBlur = () => {
    const cleanValue = inputMin.replace(/\./g, '').replace(/\s/g, '');
    const num = parseInt(cleanValue);
    if (isNaN(num) || num < min) {
      setInputMin(formatValue(localMin));
    }
  };

  const handleInputMaxBlur = () => {
    const cleanValue = inputMax.replace(/\./g, '').replace(/\s/g, '');
    const num = parseInt(cleanValue);
    if (isNaN(num) || num > max) {
      setInputMax(formatValue(localMax));
    }
  };

  const minPercent = ((localMin - min) / (max - min)) * 100;
  const maxPercent = ((localMax - min) / (max - min)) * 100;

  const getTextSize = (text: string) => {
    const length = text.length;
    if (length <= 3) return 'text-sm';
    if (length <= 5) return 'text-xs';
    return 'text-[0.65rem]';
  };

  return (
    <div className="w-full">
      <label className="text-sm font-medium text-slate-100 block mb-2.5">
        {label}
      </label>

      <div className="flex items-start gap-2 mb-3">
        <div className="flex-1 flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={inputMin}
              onChange={(e) => handleInputMinChange(e.target.value)}
              onBlur={handleInputMinBlur}
              className={`w-full h-10 px-2 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white ${getTextSize(inputMin)} focus:outline-none focus:ring-2 focus:ring-blue-400`}
              placeholder="Min"
            />
          </div>
          <span className="text-slate-400 text-sm flex-shrink-0">til</span>
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={inputMax}
              onChange={(e) => handleInputMaxChange(e.target.value)}
              onBlur={handleInputMaxBlur}
              className={`w-full h-10 px-2 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white ${getTextSize(inputMax)} focus:outline-none focus:ring-2 focus:ring-blue-400`}
              placeholder="Max"
            />
          </div>
        </div>
        <button
          onClick={onReset}
          className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
          title="Nullstill"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="relative h-8 flex items-center gap-2 mr-10">
        <div className="flex-1 min-w-0"></div>
        <span className="text-slate-400 text-sm flex-shrink-0 invisible pointer-events-none">til</span>
        <div className="flex-1 min-w-0"></div>

        <div
          ref={trackRef}
          onClick={handleTrackClick}
          className="absolute inset-0 h-1 top-1/2 -translate-y-1/2 bg-slate-600 rounded-full cursor-pointer"
        />
        <div
          className="absolute h-1 top-1/2 -translate-y-1/2 bg-slate-400 rounded-full transition-all pointer-events-none"
          style={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`
          }}
        />

        <div
          onMouseDown={handleMouseDown('min')}
          onTouchStart={handleTouchStart('min')}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing"
          style={{
            left: `${minPercent}%`,
            zIndex: activeHandle === 'min' ? 20 : 10,
            touchAction: 'none',
          }}
        >
          <div className="relative w-5 h-5">
            <div className="absolute inset-0 -m-2 rounded-full" />
            <div className={`w-5 h-5 rounded-full bg-slate-800 border-2 border-white shadow-lg transition-transform hover:scale-110 ${
              activeHandle === 'min' ? 'scale-110 ring-2 ring-blue-400' : ''
            }`} />
          </div>
        </div>

        <div
          onMouseDown={handleMouseDown('max')}
          onTouchStart={handleTouchStart('max')}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing"
          style={{
            left: `${maxPercent}%`,
            zIndex: activeHandle === 'max' ? 20 : 10,
            touchAction: 'none',
          }}
        >
          <div className="relative w-5 h-5">
            <div className="absolute inset-0 -m-2 rounded-full" />
            <div className={`w-5 h-5 rounded-full bg-slate-800 border-2 border-white shadow-lg transition-transform hover:scale-110 ${
              activeHandle === 'max' ? 'scale-110 ring-2 ring-blue-400' : ''
            }`} />
          </div>
        </div>
      </div>
    </div>
  );
}
