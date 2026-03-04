import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

interface MultiSelectProps {
    options: string[];
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export default function MultiSelect({
    options,
    value = [],
    onChange,
    placeholder = "Select options",
    className = "",
    disabled = false
}: MultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleOption = (option: string) => {
        const newValue = value.includes(option)
            ? value.filter(v => v !== option)
            : [...value, option];
        onChange(newValue);
    };

    const removeOption = (e: React.MouseEvent, option: string) => {
        e.stopPropagation();
        onChange(value.filter(v => v !== option));
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <div
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full min-h-[42px] px-3 py-2 bg-white border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all flex items-center justify-between ${disabled ? 'bg-gray-50 text-gray-600 cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
            >
                <div className="flex flex-wrap gap-2">
                    {value.length === 0 && (
                        <span className="text-gray-400 text-sm">{placeholder}</span>
                    )}
                    {value.map(item => (
                        <span
                            key={item}
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${disabled ? 'bg-gray-100 text-gray-600 border-gray-200' : 'bg-blue-50 text-blue-700 border-blue-100'}`}
                        >
                            {item}
                            {!disabled && (
                                <button
                                    onClick={(e) => removeOption(e, item)}
                                    className="ml-1 p-0.5 hover:bg-blue-200 rounded-full transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </span>
                    ))}
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto animate-in fade-in zoom-in-95 duration-100">
                    {options.map(option => {
                        const isSelected = value.includes(option);
                        return (
                            <div
                                key={option}
                                onClick={() => toggleOption(option)}
                                className={`px-4 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-50 text-sm transition-colors ${isSelected ? 'bg-blue-50/50' : ''}`}
                            >
                                <span className={isSelected ? 'text-blue-700 font-medium' : 'text-gray-700'}>
                                    {option}
                                </span>
                                {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
