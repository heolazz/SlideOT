import React, { useState } from 'react';
import { SlideData, SlideLayout, SlideItem, SlideNumbering } from '../types';
import { 
  Layout, Type, Image, Table, GitCommit, AlignLeft, 
  AlignCenter, AlignRight, Quote, Grid, Hash, Sun, Moon,
  Plus, Trash2, Upload, PlayCircle, Bookmark, Heading, ImageIcon,
  Columns, X, Baseline, GalleryHorizontal, Bold, Italic, Underline
} from 'lucide-react';

interface SlideEditorProps {
  slide: SlideData;
  onUpdate: (updatedSlide: SlideData) => void;
  onGroupUpdate?: (updatedFields: Partial<SlideData>) => void;
}

// Track which input is currently active to apply formatting
type FocusedInput = {
    field: 'title' | 'subtitle' | 'points' | 'rightColumnPoints';
    index?: number;
} | null;

// Extracted Component to prevent focus loss
const PointListEditor = ({ 
    items, 
    onChange, 
    label,
    placeholder = "Enter point...",
    fieldContext,
    onFocus
  }: { 
    items: string[], 
    onChange: (newItems: string[]) => void, 
    label: string,
    placeholder?: string,
    fieldContext: 'points' | 'rightColumnPoints',
    onFocus: (index: number) => void
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

const SlideEditor: React.FC<SlideEditorProps> = ({ slide, onUpdate, onGroupUpdate }) => {
  const [tableText, setTableText] = useState(slide.tableData ? slide.tableData.map(r => r.join(', ')).join('\n') : '');
  const [focusedInput, setFocusedInput] = useState<FocusedInput>(null);

  const handleChange = (field: keyof SlideData, value: any) => {
      onUpdate({ ...slide, [field]: value });
  };

  const handleNumberingChange = (field: keyof SlideNumbering, value: any) => {
      const currentConfig = slide.slideNumbering || { enabled: false, position: 'bottom-right', format: 'numeric' };
      const newConfig = { ...currentConfig, [field]: value };
      onUpdate({ ...slide, slideNumbering: newConfig });
  };

  // --- Formatting Logic ---
  const insertTag = (tag: string, closeTag: string) => {
      // Logic relies on document.activeElement which works fine with external components
      const activeEl = document.activeElement as HTMLInputElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
          const start = activeEl.selectionStart;
          const end = activeEl.selectionEnd;
          const text = activeEl.value;
          
          if (start !== null && end !== null) {
              const selectedText = text.substring(start, end);
              const replacement = `${tag}${selectedText || 'text'}${closeTag}`;
              
              // We need to determine WHICH field we are editing to call handleChange correctly
              // We can rely on the focusedInput state
              if (!focusedInput) return;

              const newValue = text.substring(0, start) + replacement + text.substring(end);
              
              if (focusedInput.field === 'title') handleChange('title', newValue);
              else if (focusedInput.field === 'subtitle') handleChange('subtitle', newValue);
              else if (focusedInput.field === 'points' && typeof focusedInput.index === 'number') {
                  const newPoints = [...slide.points];
                  newPoints[focusedInput.index] = newValue;
                  handleChange('points', newPoints);
              } else if (focusedInput.field === 'rightColumnPoints' && typeof focusedInput.index === 'number') {
                  const newPoints = [...(slide.rightColumnPoints || [])];
                  newPoints[focusedInput.index] = newValue;
                  handleChange('rightColumnPoints', newPoints);
              }

              // Restore focus hack
              setTimeout(() => {
                  activeEl.focus();
                  // Ideally we would set selection range here too, but React updates might make it tricky without refs
              }, 0);
          }
      }
  };

  const FormattingToolbar = () => (
      <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-sm border border-zinc-200 mb-2">
          <button onClick={() => insertTag('<b>', '</b>')} className="p-1.5 hover:bg-white rounded-sm text-zinc-600 hover:text-black transition-colors" title="Bold"><Bold size={12} /></button>
          <button onClick={() => insertTag('<i>', '</i>')} className="p-1.5 hover:bg-white rounded-sm text-zinc-600 hover:text-black transition-colors" title="Italic"><Italic size={12} /></button>
          <button onClick={() => insertTag('<u>', '</u>')} className="p-1.5 hover:bg-white rounded-sm text-zinc-600 hover:text-black transition-colors" title="Underline"><Underline size={12} /></button>
          <div className="w-px h-4 bg-zinc-300 mx-1"></div>
          <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-medium px-1">
              {focusedInput ? `Editing ${focusedInput.field}` : 'Select text to format'}
          </span>
      </div>
  );

  const handleApplyFontToAll = () => {
      if (onGroupUpdate && slide.fontFamily) {
          onGroupUpdate({ fontFamily: slide.fontFamily });
      }
  };

  const handleApplyFontSizeToAll = () => {
      if (onGroupUpdate && slide.fontSize) {
          onGroupUpdate({ fontSize: slide.fontSize });
      }
  };

  const handleApplyTitleFontSizeToAll = () => {
      if (onGroupUpdate && slide.titleFontSize) {
          onGroupUpdate({ titleFontSize: slide.titleFontSize });
      }
  };

  const handleApplyNumberingToAll = () => {
      if (onGroupUpdate && slide.slideNumbering) {
          onGroupUpdate({ slideNumbering: slide.slideNumbering });
      }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              if (typeof reader.result === 'string') {
                  callback(reader.result);
              }
          };
          reader.readAsDataURL(file);
      }
  };

  const handleAddItem = () => {
      const currentItems = slide.items || [];
      const newItem: SlideItem = {
          id: Date.now().toString(),
          title: 'New Item',
          description: 'Description...',
          imageUrl: ''
      };
      handleChange('items', [...currentItems, newItem]);
  };

  const LayoutButton = ({ layout, icon: Icon, label }: { layout: SlideLayout, icon: any, label: string }) => (
    <button 
      onClick={() => handleChange('layout', layout)}
      title={label}
      className={`p-2 rounded-sm border flex flex-col items-center justify-center gap-1 transition-all h-14 ${slide.layout === layout ? 'border-black text-black bg-zinc-50' : 'border-transparent text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50'}`}
    >
      <Icon size={16} strokeWidth={slide.layout === layout ? 2.5 : 2} />
      <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );

  const showAlignControls = [SlideLayout.Title, SlideLayout.Content, SlideLayout.ImageLeft, SlideLayout.ImageRight, SlideLayout.Table, SlideLayout.TitleOnly].includes(slide.layout);

  return (
    <div className="bg-white h-full overflow-y-auto border-l border-zinc-200">
      
      {/* Settings Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur z-10 px-6 py-4 border-b border-zinc-100 flex justify-between items-center">
        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Properties</h3>
        <div className="flex gap-1">
            <button onClick={() => handleChange('themeMode', 'light')} className={`p-1.5 rounded-sm ${slide.themeMode === 'light' ? 'bg-zinc-100 text-black' : 'text-zinc-400'}`}><Sun size={12} /></button>
            <button onClick={() => handleChange('themeMode', 'blue')} className={`p-1.5 rounded-sm ${slide.themeMode === 'blue' ? 'bg-zinc-100 text-black' : 'text-zinc-400'}`}><Moon size={12} /></button>
        </div>
      </div>

      <div className="p-6 space-y-8">
        
        {/* Layout Grid */}
        <div className="space-y-3">
            <label className="text-[10px] font-bold text-zinc-900 uppercase tracking-wider block">Layout</label>
            <div className="grid grid-cols-4 gap-1">
                <LayoutButton layout={SlideLayout.Title} icon={Type} label="Title" />
                <LayoutButton layout={SlideLayout.SectionHeader} icon={Bookmark} label="Sect" />
                <LayoutButton layout={SlideLayout.TitleOnly} icon={Heading} label="Head" />
                <LayoutButton layout={SlideLayout.Content} icon={AlignLeft} label="List" />
                <LayoutButton layout={SlideLayout.TwoColumn} icon={Columns} label="2 Col" />
                <LayoutButton layout={SlideLayout.ImageLeft} icon={Image} label="Img L" />
                <LayoutButton layout={SlideLayout.ImageRight} icon={Image} label="Img R" />
                <LayoutButton layout={SlideLayout.Gallery} icon={Grid} label="Grid" />
                <LayoutButton layout={SlideLayout.ImageCarousel} icon={GalleryHorizontal} label="Carousel" />
                <LayoutButton layout={SlideLayout.Table} icon={Table} label="Tabl" />
                <LayoutButton layout={SlideLayout.Timeline} icon={GitCommit} label="Flow" />
                <LayoutButton layout={SlideLayout.Quote} icon={Quote} label="Quot" />
                <LayoutButton layout={SlideLayout.BigNumber} icon={Hash} label="Big #" />
            </div>
        </div>

        <div className="h-px bg-zinc-100 w-full"></div>

        {/* Global Slide Settings (Typography & Numbering) */}
        <div className="space-y-5">
             {/* Font Family & Size */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                        <Baseline size={10} /> Typography
                    </label>
                    <button 
                        onClick={handleApplyFontToAll} 
                        className="text-[9px] text-zinc-400 hover:text-black hover:underline disabled:opacity-30"
                        disabled={!slide.fontFamily}
                        title="Apply Font Family to All"
                    >
                        Apply Family
                    </button>
                </div>

                <select 
                    value={slide.fontFamily || ''} 
                    onChange={(e) => handleChange('fontFamily', e.target.value || undefined)}
                    className="w-full px-2 py-1.5 bg-zinc-50 border border-zinc-200 rounded-sm text-xs focus:outline-none focus:border-zinc-400"
                >
                    <option value="">Default (Curated Mix)</option>
                    <option value="inter">Inter (Clean)</option>
                    <option value="grotesk">Space Grotesk (Modern)</option>
                    <option value="serif">Playfair (Elegant)</option>
                    <option value="mono">Monospace (Technical)</option>
                </select>

                <div className="flex gap-2">
                    <div className="flex-1">
                        <div className="flex justify-between mb-1">
                            <span className="text-[9px] text-zinc-500 uppercase">Title Size</span>
                             <button onClick={handleApplyTitleFontSizeToAll} className="text-[9px] text-zinc-300 hover:text-black" title="Apply to All">All</button>
                        </div>
                        <select 
                            value={slide.titleFontSize || ''} 
                            onChange={(e) => handleChange('titleFontSize', e.target.value || undefined)}
                            className="w-full px-2 py-1.5 bg-zinc-50 border border-zinc-200 rounded-sm text-xs focus:outline-none focus:border-zinc-400"
                        >
                            <option value="">Auto</option>
                            <option value="2xl">2XL</option>
                            <option value="3xl">3XL</option>
                            <option value="4xl">4XL</option>
                            <option value="5xl">5XL</option>
                            <option value="6xl">6XL</option>
                            <option value="7xl">7XL</option>
                            <option value="8xl">8XL</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between mb-1">
                            <span className="text-[9px] text-zinc-500 uppercase">Body Size</span>
                            <button onClick={handleApplyFontSizeToAll} className="text-[9px] text-zinc-300 hover:text-black" title="Apply to All">All</button>
                        </div>
                        <select 
                            value={slide.fontSize || 'md'} 
                            onChange={(e) => handleChange('fontSize', e.target.value)}
                            className="w-full px-2 py-1.5 bg-zinc-50 border border-zinc-200 rounded-sm text-xs focus:outline-none focus:border-zinc-400"
                        >
                            <option value="xs">XS</option>
                            <option value="sm">SM</option>
                            <option value="md">MD</option>
                            <option value="lg">LG</option>
                            <option value="xl">XL</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Slide Numbering */}
             <div className="space-y-2">
                 <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                        <Hash size={10} /> Slide Numbering
                    </label>
                    <button 
                        onClick={handleApplyNumberingToAll} 
                        className="text-[9px] text-zinc-400 hover:text-black hover:underline disabled:opacity-30"
                        disabled={!slide.slideNumbering?.enabled}
                    >
                        Apply to All
                    </button>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={slide.slideNumbering?.enabled || false}
                            onChange={(e) => handleNumberingChange('enabled', e.target.checked)}
                        />
                        <div className="w-7 h-4 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-black"></div>
                        <span className="ml-2 text-[10px] text-zinc-500 font-medium">{slide.slideNumbering?.enabled ? 'On' : 'Off'}</span>
                    </label>
                </div>

                {slide.slideNumbering?.enabled && (
                    <div className="grid grid-cols-2 gap-2">
                         <select 
                            value={slide.slideNumbering.position} 
                            onChange={(e) => handleNumberingChange('position', e.target.value)}
                            className="w-full px-2 py-1 bg-zinc-50 border border-zinc-200 rounded-sm text-[10px] focus:outline-none"
                        >
                            <option value="bottom-right">Bottom Right</option>
                            <option value="bottom-left">Bottom Left</option>
                            <option value="top-right">Top Right</option>
                            <option value="top-left">Top Left</option>
                        </select>
                        <select 
                            value={slide.slideNumbering.format} 
                            onChange={(e) => handleNumberingChange('format', e.target.value)}
                            className="w-full px-2 py-1 bg-zinc-50 border border-zinc-200 rounded-sm text-[10px] focus:outline-none"
                        >
                            <option value="numeric">1, 2, 3</option>
                            <option value="page-of">1 / 10</option>
                        </select>
                    </div>
                )}
            </div>
        </div>

        <div className="h-px bg-zinc-100 w-full"></div>

        {/* Content Editor */}
        <div className="space-y-5">
            
            {/* Title Block */}
            <div className="space-y-2">
                <div className="flex justify-between items-end">
                    <label className="text-[10px] font-bold text-zinc-900 uppercase tracking-wider">Heading</label>
                    <div className="flex items-center gap-2">
                         {/* Color Picker */}
                        <div className="relative group w-4 h-4 overflow-hidden rounded-full border border-zinc-200 cursor-pointer" title="Text Color">
                            <input type="color" value={slide.textColor || '#000000'} onChange={(e) => handleChange('textColor', e.target.value)} className="absolute -top-1 -left-1 w-6 h-6 p-0 border-0 cursor-pointer opacity-0" />
                            <div className="w-full h-full" style={{ backgroundColor: slide.textColor || '#000000' }}></div>
                        </div>
                        {/* Animation */}
                        <div className="relative">
                            <select value={slide.titleAnimation || 'none'} onChange={(e) => handleChange('titleAnimation', e.target.value)} className="appearance-none bg-zinc-50 text-[9px] font-medium text-zinc-600 pl-2 pr-5 py-1 rounded-sm border border-transparent hover:border-zinc-200 focus:outline-none cursor-pointer">
                                <option value="none">Static</option>
                                <option value="fade">Fade</option>
                                <option value="slide-top">Slide</option>
                                <option value="zoom">Zoom</option>
                            </select>
                            <PlayCircle size={8} className="absolute right-1.5 top-1.5 text-zinc-400 pointer-events-none" />
                        </div>
                        {showAlignControls && (
                            <div className="flex bg-zinc-50 rounded-sm p-0.5 border border-zinc-100">
                                <button onClick={() => handleChange('textAlign', 'left')} className={`p-1 rounded-sm ${!slide.textAlign || slide.textAlign === 'left' ? 'bg-white shadow-sm text-black' : 'text-zinc-400'}`}><AlignLeft size={10} /></button>
                                <button onClick={() => handleChange('textAlign', 'center')} className={`p-1 rounded-sm ${slide.textAlign === 'center' ? 'bg-white shadow-sm text-black' : 'text-zinc-400'}`}><AlignCenter size={10} /></button>
                                <button onClick={() => handleChange('textAlign', 'right')} className={`p-1 rounded-sm ${slide.textAlign === 'right' ? 'bg-white shadow-sm text-black' : 'text-zinc-400'}`}><AlignRight size={10} /></button>
                            </div>
                        )}
                    </div>
                </div>
                
                <FormattingToolbar />

                <input 
                    type="text" 
                    value={slide.title} 
                    onChange={(e) => handleChange('title', e.target.value)}
                    onFocus={() => setFocusedInput({ field: 'title' })}
                    className="w-full px-3 py-2 border-b border-zinc-200 focus:border-black focus:outline-none transition-colors text-sm font-bold placeholder-zinc-300 font-grotesk"
                    placeholder="TITLE GOES HERE"
                />
            </div>

            {(slide.layout === SlideLayout.Title || slide.layout === SlideLayout.SectionHeader) && (
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-900 uppercase tracking-wider">Subheading</label>
                    <input 
                        type="text" 
                        value={slide.subtitle || ''} 
                        onChange={(e) => handleChange('subtitle', e.target.value)}
                        onFocus={() => setFocusedInput({ field: 'subtitle' })}
                        className="w-full px-3 py-2 border-b border-zinc-200 focus:border-black focus:outline-none text-xs text-zinc-600"
                        placeholder="Subtitle text..."
                    />
                </div>
            )}

            {/* Background Image */}
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon size={10} /> Background
                </label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={slide.backgroundImageUrl || ''} 
                        onChange={(e) => handleChange('backgroundImageUrl', e.target.value)}
                        className="flex-1 px-2 py-1.5 bg-zinc-50 border border-zinc-200 rounded-sm text-[10px] focus:outline-none focus:border-zinc-400"
                        placeholder="Image URL"
                    />
                    <label className="cursor-pointer bg-white border border-zinc-200 rounded-sm px-2 hover:bg-zinc-50 flex items-center justify-center transition-colors">
                        <Upload size={12} className="text-zinc-600"/>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => handleChange('backgroundImageUrl', url))} />
                    </label>
                </div>
                {slide.backgroundImageUrl && (
                     <input type="range" min="0" max="0.9" step="0.1" value={slide.backgroundOverlayOpacity ?? 0.5} onChange={(e) => handleChange('backgroundOverlayOpacity', parseFloat(e.target.value))} className="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-black" />
                )}
            </div>

            {/* Layout Specific Content Input */}
            
            {/* Case 1: Complex Items (Timeline/Gallery/ImageCarousel) */}
            {['timeline', 'gallery', 'image_carousel'].includes(slide.layout) ? (
                <div className="space-y-2">
                     <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-zinc-900 uppercase tracking-wider">
                            {slide.layout === 'image_carousel' ? 'Carousel Images' : 'Grid Items'}
                        </label>
                        <button onClick={handleAddItem} className="text-[9px] font-bold uppercase bg-black text-white px-2 py-1 rounded-sm flex items-center gap-1 hover:bg-zinc-800"><Plus size={8} /> Add</button>
                    </div>
                    
                    {/* Items for complex layouts usually don't support rich text easily in this simple editor model, kept simple */}
                    <div className="space-y-2">
                        {(slide.items || []).map((item, index) => (
                            <div key={index} className="bg-zinc-50 p-2 rounded-sm border border-zinc-100 relative group">
                                <button onClick={() => {
                                    const newItems = [...(slide.items || [])];
                                    newItems.splice(index, 1);
                                    handleChange('items', newItems);
                                }} className="absolute top-1 right-1 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={10} /></button>
                                
                                <input type="text" value={item.title} onChange={(e) => {
                                     const newItems = [...(slide.items || [])];
                                     newItems[index] = { ...newItems[index], title: e.target.value };
                                     handleChange('items', newItems);
                                }} className="w-full bg-transparent border-b border-transparent focus:border-zinc-300 text-xs font-bold mb-1 focus:outline-none" placeholder="Title" />
                                
                                <input type="text" value={item.description} onChange={(e) => {
                                     const newItems = [...(slide.items || [])];
                                     newItems[index] = { ...newItems[index], description: e.target.value };
                                     handleChange('items', newItems);
                                }} className="w-full bg-transparent text-[10px] text-zinc-500 focus:outline-none mb-2" placeholder="Description" />
                                
                                {/* Image Upload for Grid Items */}
                                <div className="flex gap-2 items-center">
                                    <div className="relative flex-1">
                                        <ImageIcon size={10} className="absolute left-2 top-1.5 text-zinc-400" />
                                        <input 
                                            type="text" 
                                            value={item.imageUrl || ''} 
                                            onChange={(e) => {
                                                const newItems = [...(slide.items || [])];
                                                newItems[index] = { ...newItems[index], imageUrl: e.target.value };
                                                handleChange('items', newItems);
                                            }}
                                            className="w-full pl-6 pr-2 py-1 bg-white border border-zinc-200 rounded-sm text-[9px] focus:outline-none focus:border-zinc-400"
                                            placeholder="Image URL"
                                        />
                                    </div>
                                    <label className="cursor-pointer bg-white border border-zinc-200 rounded-sm p-1 hover:bg-zinc-50 flex items-center justify-center" title="Upload Image">
                                        <Upload size={10} className="text-zinc-600"/>
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*" 
                                            onChange={(e) => handleFileUpload(e, (url) => {
                                                const newItems = [...(slide.items || [])];
                                                newItems[index] = { ...newItems[index], imageUrl: url };
                                                handleChange('items', newItems);
                                            })} 
                                        />
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            /* Case 2: Table Data */
            ) : slide.layout === 'table' ? (
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-900 uppercase tracking-wider">CSV Data</label>
                    <textarea value={tableText} onChange={(e) => { setTableText(e.target.value); handleChange('tableData', e.target.value.split('\n').map(row => row.split(',').map(c => c.trim()))); }} rows={6} className="w-full p-2 text-xs font-mono bg-zinc-50 border border-zinc-200 rounded-sm focus:border-black focus:outline-none" placeholder="Head1, Head2..." />
                </div>

            /* Case 3: Two Column (Special Split View) */
            ) : slide.layout === SlideLayout.TwoColumn ? (
                <div className="space-y-6">
                    <PointListEditor 
                        label="Left Column Content"
                        items={slide.points} 
                        onChange={(newPoints) => handleChange('points', newPoints)}
                        placeholder="Big concept..."
                        fieldContext="points"
                        onFocus={(index) => setFocusedInput({ field: 'points', index })}
                    />
                    
                    <div className="h-px bg-zinc-100 w-full" />
                    
                    <PointListEditor 
                        label="Right Column Content"
                        items={slide.rightColumnPoints || []} 
                        onChange={(newPoints) => handleChange('rightColumnPoints', newPoints)}
                        placeholder="Detailed explanation..."
                        fieldContext="rightColumnPoints"
                        onFocus={(index) => setFocusedInput({ field: 'rightColumnPoints', index })}
                    />
                </div>

            /* Case 4: Standard Layouts (Bullets) */
            ) : (
                <div className="space-y-2">
                    <PointListEditor 
                        label="Content Points"
                        items={slide.points} 
                        onChange={(newPoints) => handleChange('points', newPoints)}
                        fieldContext="points"
                        onFocus={(index) => setFocusedInput({ field: 'points', index })}
                    />
                     {/* Image Field for relevant layouts */}
                    {['image_left', 'image_right'].includes(slide.layout) && (
                         <div className="flex gap-2 mt-2 pt-2 border-t border-zinc-100">
                            <input type="text" value={slide.imageUrl || ''} onChange={(e) => handleChange('imageUrl', e.target.value)} className="flex-1 px-2 py-1.5 bg-zinc-50 border border-zinc-200 rounded-sm text-[10px] focus:outline-none" placeholder="Featured Image URL" />
                             <label className="cursor-pointer bg-white border border-zinc-200 rounded-sm px-2 flex items-center justify-center"><Upload size={12} className="text-zinc-600"/><input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, (url) => handleChange('imageUrl', url))} /></label>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SlideEditor;