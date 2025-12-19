import React from 'react';
import { Bold, Italic, Underline } from 'lucide-react';

interface FormattingToolbarProps {
    onInsertTag: (tag: string, closeTag: string) => void;
    focusedField?: string;
}

const FormattingToolbar: React.FC<FormattingToolbarProps> = ({ onInsertTag, focusedField }) => {
    return (
        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-sm border border-zinc-200 mb-2">
            <button onClick={() => onInsertTag('<b>', '</b>')} className="p-1.5 hover:bg-white rounded-sm text-zinc-600 hover:text-black transition-colors" title="Bold"><Bold size={12} /></button>
            <button onClick={() => onInsertTag('<i>', '</i>')} className="p-1.5 hover:bg-white rounded-sm text-zinc-600 hover:text-black transition-colors" title="Italic"><Italic size={12} /></button>
            <button onClick={() => onInsertTag('<u>', '</u>')} className="p-1.5 hover:bg-white rounded-sm text-zinc-600 hover:text-black transition-colors" title="Underline"><Underline size={12} /></button>
            <div className="w-px h-4 bg-zinc-300 mx-1"></div>
            <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-medium px-1">
                {focusedField ? `Editing ${focusedField}` : 'Select text to format'}
            </span>
        </div>
    );
};

export default FormattingToolbar;