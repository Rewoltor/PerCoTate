import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'selected' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    isLoading?: boolean;
    className?: string; // Allow overrides if absolutely necessary
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    isLoading = false,
    className = '',
    disabled,
    ...props
}) => {

    const baseStyles = "py-4 px-6 rounded-xl font-bold transition-all duration-200 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2";

    // Extracted from AITrial
    const variants = {
        primary: "bg-gray-900 text-white shadow-lg hover:bg-black hover:scale-[1.01] hover:shadow-xl focus:ring-gray-900",
        secondary: "bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50 focus:ring-blue-500",
        selected: "bg-blue-600 border-2 border-blue-600 text-white transform scale-[1.02] shadow-md focus:ring-blue-600",
        danger: "text-red-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-100",
    };

    const loadingStyles = isLoading || disabled ? "opacity-50 cursor-not-allowed transform-none hover:scale-100" : "";

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${loadingStyles} ${className}`}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading ? "Loading..." : children}
        </button>
    );
};
