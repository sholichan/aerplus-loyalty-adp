import { useEffect } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';
import Label from './Label';
import { CalenderIcon } from '../../icons';
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: Hook | Hook[];
  defaultDate?: DateOption;
  label?: string;
  placeholder?: string;
  minDate?: DateOption; // <-- tambahin
  maxDate?: DateOption; // <-- tambahin
  required?: boolean;
};

const isValidDate = (value: Date): boolean => !Number.isNaN(value.getTime());

const normalizeDateOption = (value?: DateOption): DateOption | undefined => {
  if (value === undefined || value === null) return undefined;

  if (Array.isArray(value)) {
    const normalized = value
      .map((item) => normalizeDateOption(item as DateOption))
      .filter((item): item is Date | string | number => item !== undefined);

    return normalized.length ? normalized : undefined;
  }

  if (value instanceof Date) {
    return isValidDate(value) ? value : undefined;
  }

  if (typeof value === "string") {
    if (!value.trim()) return undefined;
    const parsed = new Date(value);
    return isValidDate(parsed) ? value : undefined;
  }

  if (typeof value === "number") {
    const parsed = new Date(value);
    return isValidDate(parsed) ? value : undefined;
  }

  return undefined;
};

export default function DatePicker({
  id,
  mode,
  onChange,
  label,
  defaultDate,
  placeholder,
  minDate,
  maxDate,
  required = false,
}: PropsType) {
  useEffect(() => {
    const safeDefaultDate = normalizeDateOption(defaultDate);
    const safeMinDate = normalizeDateOption(minDate);
    const safeMaxDate = normalizeDateOption(maxDate);

    const flatPickr = flatpickr(`#${id}`, {
      mode: mode || "single",
      static: true,
      monthSelectorType: "static",
      dateFormat: "Y-m-d",
      defaultDate: safeDefaultDate,
      minDate: safeMinDate,
      maxDate: safeMaxDate,
      onChange,
    });

    return () => {
      if (!Array.isArray(flatPickr)) {
        flatPickr.destroy();
      }
    };
  }, [mode, onChange, id, defaultDate, minDate, maxDate]);

  return (
    <div>
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </Label>
      )}

      <div className="relative">
        <input
          id={id}
          placeholder={placeholder}
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30  bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700  dark:focus:border-brand-800"
        />

        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalenderIcon className="size-6" />
        </span>
      </div>
    </div>
  );
}
