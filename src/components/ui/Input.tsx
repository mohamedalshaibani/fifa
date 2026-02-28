import { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Input({ label, error, helperText, className = "", id, ...props }: InputProps) {
  const inputId = id || props.name;
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="text-label mb-1.5 block">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input ${error ? "border-danger focus:border-danger focus:ring-danger" : ""} ${className}`}
        {...props}
      />
      {helperText && !error && (
        <p className="mt-1.5 text-xs text-muted">{helperText}</p>
      )}
      {error && <p className="mt-1.5 text-xs text-danger font-medium flex items-center gap-1">
        {error}
      </p>}
    </div>
  );
}
