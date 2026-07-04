import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react';
import './Select.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      hint,
      icon,
      options,
      placeholder = 'Select an option',
      fullWidth = true,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const selectId =
      id || `select-${label?.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div
        className={`select-group ${fullWidth ? 'select-full' : ''} ${error ? 'select-error' : ''} ${className}`}
      >
        {label && (
          <label htmlFor={selectId} className="select-label">
            {label}
            {props.required && <span className="select-required">*</span>}
          </label>
        )}
        <div className="select-wrapper">
          {icon && <span className="select-icon">{icon}</span>}
          <select
            ref={ref}
            id={selectId}
            className={`select-field ${icon ? 'select-with-icon' : ''}`}
            {...props}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="select-chevron" aria-hidden="true">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 4.5L6 7.5L9 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
        {error && <p className="select-error-text">{error}</p>}
        {hint && !error && <p className="select-hint">{hint}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
