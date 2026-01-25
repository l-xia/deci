interface FormFieldCounterProps {
  error?: string | undefined;
  currentLength: number;
  maxLength: number;
}

/**
 * Reusable component for form field validation messages and character counters
 * Displays error message on the left and character count on the right
 */
export function FormFieldCounter({
  error,
  currentLength,
  maxLength,
}: FormFieldCounterProps) {
  return (
    <div className="flex justify-between items-center mt-1">
      {error ? <p className="text-xs text-red-500">{error}</p> : <div />}
      <span className="text-xs text-gray-400">
        {currentLength}/{maxLength}
      </span>
    </div>
  );
}
