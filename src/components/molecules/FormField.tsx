import React from 'react';
import { Input, InputProps } from '../atoms/Input';
import { Typography } from '../atoms/Typography';

interface FormFieldProps extends InputProps {
    label: string;
    errorText?: string;
    containerClassName?: string;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
    ({ label, errorText, containerClassName, id, ...props }, ref) => {
        const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

        return (
            <div className={containerClassName}>
                <label htmlFor={inputId} className="block text-sm font-medium text-stone-700 mb-1">
                    {label}
                </label>
                <Input
                    id={inputId}
                    ref={ref}
                    error={!!errorText}
                    {...props}
                />
                {errorText && (
                    <Typography variant="small" className="text-red-500 mt-1">
                        {errorText}
                    </Typography>
                )}
            </div>
        );
    }
);
FormField.displayName = "FormField";
