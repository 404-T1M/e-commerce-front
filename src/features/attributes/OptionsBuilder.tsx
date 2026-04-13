import { useState } from 'react';
import { Plus, X } from 'lucide-react';

export function OptionsBuilder({
    options,
    onChange,
}: {
    options: string[];
    onChange: (opts: string[]) => void;
}) {
    const [input, setInput] = useState('');

    const add = () => {
        const val = input.trim();
        if (val && !options.includes(val)) {
            onChange([...options, val]);
            setInput('');
        }
    };

    const remove = (opt: string) => onChange(options.filter((o) => o !== opt));

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
                    placeholder="Type option and press Enter…"
                    className="input text-sm flex-1"
                />
                <button type="button" onClick={add} className="btn-secondary btn-sm shrink-0">
                    <Plus className="w-3.5 h-3.5" /> Add
                </button>
            </div>
            {options.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-lg border border-slate-200 min-h-[40px]">
                    {options.map((opt) => (
                        <span key={opt} className="flex items-center gap-1 badge badge-blue text-xs pr-1">
                            {opt}
                            <button
                                type="button"
                                onClick={() => remove(opt)}
                                className="hover:text-red-600 ml-0.5 transition-colors"
                                aria-label={`Remove ${opt}`}
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
