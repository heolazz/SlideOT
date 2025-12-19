import React from 'react';
import { X, Plus } from 'lucide-react';

interface PointListEditorProps {
    items: string[];
    onChange: (newItems: string[]) => void;
    label: string;
    placeholder?: string;
    onFocus: (index: number) => void;
}

const PointListEditor: React.FC<PointListEditorProps> = ({ 
    items, 
    onChange, 
    label,
    placeholder = "Enter point...",
    onFocus
  }) => {
    
    const updatePoint = (index: number, value: string) => {
        const newPoints = [...items];
        newPoints[index] = value;
        onChange(newPoints);
    };

    const removePoint = (index: number) => {
        const newPoints = items.filter((_, i) => i !== index);
        onChange(newPoints);
    };

    const addPoint = () => {
        onChange([...items, ""]);
    };

    return (
        <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-900 uppercase tracking-wider flex items-center justify-between">
                <span>{label}</span>
                <span className="text-[9px] font-normal text-zinc-400">{items.length} Items</span>
            </label>
            <div className="space-y-2">
                {items.map((point, i) => (
                    <div key={i} className="flex gap-2 items-center group">
                        <span className="text-[10px] font-mono text-zinc-300 w-3 text-right">{i+1}.</span>
                        <input
                            type="text"
                            value={point}
                            onChange={(e) => updatePoint(i, e.target.value)}
                            onFocus={() => onFocus(i)}
                            className="flex-1 px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-sm text-xs focus:outline-none focus:border-black focus:bg-white transition-colors"
                            placeholder={placeholder}
                        />
                        <button 
                            onClick={() => removePoint(i)}
                            className="text-zinc-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}
            </div>
            <button 
                onClick={addPoint}
                className="w-full py-2 border border-dashed border-zinc-200 text-zinc-400 hover:border-zinc-400 hover:text-zinc-700 text-[10px] font-bold uppercase rounded-sm flex items-center justify-center gap-1 transition-colors mt-2"
            >
                <Plus size={10} /> Add Point
            </button>
        </div>
    );
};

export default PointListEditor;