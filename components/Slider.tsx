"use client";

interface SliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  valueLabel?: string;
  hint?: string;
  className?: string;
}

export default function Slider({
  min,
  max,
  step,
  value,
  onChange,
  label,
  valueLabel,
  hint,
  className = "",
}: SliderProps) {
  return (
    <div className={className}>
      {(label || valueLabel) && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {valueLabel != null && (
            <span className="font-normal text-gray-600 ml-1">{valueLabel}</span>
          )}
        </label>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="settings-range w-full"
      />
      {hint && (
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          {hint.split("/").map((part, i) => (
            <span key={i}>{part.trim()}</span>
          ))}
        </div>
      )}
    </div>
  );
}
