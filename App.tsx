import React, { useState, useEffect, useRef } from 'react';
import { SlideData, SlideLayout } from './types/index';
import SlidePreview from './components/preview/SlidePreview';
import SlideEditor from './components/editor/SlideEditor';
import { usePresentationHistory } from './hooks/usePresentationHistory';
import { exportPresentationToPDF } from './utils/pdfExport';
import { 
  Plus, ChevronLeft, ChevronRight, Trash2, Copy,
  MonitorPlay, ZoomIn, ZoomOut, Download, Loader2,
  Undo, Redo, LayoutTemplate, Menu, X, Edit3, Maximize2
} from 'lucide-react';

// 1. UPDATED INITIAL SLIDES (Generic Placeholders & Default Theme)
const initialSlides: SlideData[] = [
  {
    id: '1',
    layout: SlideLayout.Title,
    title: 'PRESENTATION TITLE',
    subtitle: 'Subtitle or Presenter Name',
    points: ['Brief introduction or context', 'Date / Year'],
    themeMode: 'light', // Set to default 'light' instead of 'bri'
  },
  {
    id: '2',
    layout: SlideLayout.Content,
    title: 'Topic Overview',
    subtitle: 'Key Discussion Points',
    themeMode: 'light',
    points: [
      '<b>First Main Point</b>: Description of the concept.',
      '<b>Second Main Point</b>: Further elaboration or data.',
      '<b>Conclusion</b>: Summary of this section.'
    ],
    textAlign: 'left'
  },
  {
    id: '3',
    layout: SlideLayout.BigNumber,
    title: 'Key Metric',
    subtitle: 'Explanation of the statistic',
    themeMode: 'light',
    points: ['95%', 'Growth year over year'],
    textAlign: 'left'
  }
];

const App: React.FC = () => {
  const [slides, setSlides] = useState<SlideData[]>(() => {
    const saved = localStorage.getItem('presentation_slides');
    if (saved) {
        const parsed = JSON.parse(saved);
        // Reset if it looks like the old specific BRI demo to the new generic one
        if (parsed.length > 0 && parsed[0].title === 'SEI & INCUBATION') {
            return initialSlides;
        }
        return parsed;
    }
    return initialSlides;
  });
  
  const [currentSlideIndex, setCurrentSlideIndex] = useState(() => {
    const saved = localStorage.getItem('presentation_index');
    return saved ? parseInt(saved, 10) : 0;
  });

  const { history, updateWithHistory, undo, redo } = usePresentationHistory(initialSlides, setSlides, setCurrentSlideIndex);

  const [isPresenting, setIsPresenting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [zoom, setZoom] = useState(0.65);
  const [presentationScale, setPresentationScale] = useState(1);
  
  // Mobile UI States
  const [showMobileList, setShowMobileList] = useState(false);
  const [showMobileEditor, setShowMobileEditor] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Auto-fit logic for Editor Preview
  useEffect(() => {
    const handleResize = () => {
        if (previewContainerRef.current) {
            const containerWidth = previewContainerRef.current.clientWidth;
            // const containerHeight = previewContainerRef.current.clientHeight;
            const slideBaseWidth = 960;
            const padding = 32;

            const scaleWidth = (containerWidth - padding) / slideBaseWidth;
            
            if (window.innerWidth < 1024) {
               setZoom(Math.min(scaleWidth, 1));
            } 
        }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); 
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. NEW: Auto-fit logic specifically for Presentation Mode
  useEffect(() => {
    if (!isPresenting) return;

    const calculatePresentationScale = () => {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const baseWidth = 960;
      const baseHeight = 540;
      const padding = 20; // Minimal padding

      const scaleX = (windowWidth - padding) / baseWidth;
      const scaleY = (windowHeight - padding) / baseHeight;

      // Fit contained
      setPresentationScale(Math.min(scaleX, scaleY));
    };

    window.addEventListener('resize', calculatePresentationScale);
    calculatePresentationScale();

    // Lock body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('resize', calculatePresentationScale);
      document.body.style.overflow = ''; // Restore scroll
    };
  }, [isPresenting]);

  useEffect(() => {
    localStorage.setItem('presentation_slides', JSON.stringify(slides));
    localStorage.setItem('presentation_index', currentSlideIndex.toString());
  }, [slides, currentSlideIndex]);

  const currentSlide = slides[currentSlideIndex];

  const handleUpdateSlide = (updatedSlide: SlideData) => {
    const newSlides = [...slides];
    newSlides[currentSlideIndex] = updatedSlide;
    updateWithHistory(newSlides, slides);
  };

  const handleGroupUpdate = (updatedFields: Partial<SlideData>) => {
      const newSlides = slides.map(slide => ({
          ...slide,
          ...updatedFields
      }));
      updateWithHistory(newSlides, slides);
  };

  const handleAddSlide = () => {
    const newSlide: SlideData = {
      id: Date.now().toString(),
      layout: SlideLayout.Content,
      title: 'New Slide',
      points: ['Point 1...'],
      themeMode: currentSlide.themeMode // Inherit current theme
    };
    const newSlides = [...slides, newSlide];
    updateWithHistory(newSlides, slides);
    setCurrentSlideIndex(newSlides.length - 1);
    if (window.innerWidth < 1024) setShowMobileList(false);
  };

  const handleDuplicateSlide = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const slideToDuplicate = slides[index];
    const newSlide: SlideData = {
      ...JSON.parse(JSON.stringify(slideToDuplicate)),
      id: Date.now().toString(),
    };
    const newSlides = [...slides];
    newSlides.splice(index + 1, 0, newSlide);
    updateWithHistory(newSlides, slides);
    setCurrentSlideIndex(index + 1);
  };

  const handleDeleteSlide = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (slides.length <= 1) return;
    const newSlides = slides.filter((_, i) => i !== index);
    updateWithHistory(newSlides, slides);
    if (currentSlideIndex >= newSlides.length) {
        setCurrentSlideIndex(newSlides.length - 1);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    await new Promise(resolve => setTimeout(resolve, 100));
    try {
        await exportPresentationToPDF('export-container');
    } catch (error) {
        console.error("Export failed", error);
        alert("Failed to export PDF. Please try again.");
    } finally {
        setIsExporting(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPresenting) {
        if (e.key === 'ArrowRight' || e.key === 'Space') setCurrentSlideIndex(prev => Math.min(prev + 1, slides.length - 1));
        else if (e.key === 'ArrowLeft') setCurrentSlideIndex(prev => Math.max(prev - 1, 0));
        else if (e.key === 'Escape') setIsPresenting(false);
      } else {
        if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
            e.preventDefault();
            if (e.shiftKey) redo(slides); else undo(slides, currentSlideIndex);
        } else if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
            e.preventDefault();
            redo(slides);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPresenting, slides.length, undo, redo, slides, currentSlideIndex]);

  const handleMobileSelectSlide = (index: number) => {
      setCurrentSlideIndex(index);
      setShowMobileList(false);
  };

  // 3. IMPROVED PRESENTATION VIEW
  if (isPresenting) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center overflow-hidden touch-none select-none">
        
        {/* Slide Container - Centered & Scaled */}
        <div 
          className="relative transition-transform duration-300 ease-out shadow-2xl"
          style={{
            transform: `scale(${presentationScale})`,
            width: '960px',
            height: '540px',
            transformOrigin: 'center center'
          }}
        >
             <SlidePreview slide={currentSlide} index={currentSlideIndex + 1} total={slides.length}/>
        </div>
        
        {/* Invisible Click Zones for Navigation */}
        <div className="absolute inset-0 flex">
            <div className="w-1/3 h-full z-10 cursor-w-resize" onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}></div>
            <div className="w-1/3 h-full z-10 cursor-default" onClick={() => { /* Center tap implies nothing */ }}></div>
            <div className="w-1/3 h-full z-10 cursor-e-resize" onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}></div>
        </div>

        {/* Floating Controls - Improved Design */}
        <div className="absolute bottom-6 sm:bottom-10 flex items-center gap-6 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full text-white z-50 border border-white/10 shadow-2xl transition-opacity hover:opacity-100 opacity-0 sm:opacity-100 hover:delay-0 delay-1000">
           <button onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))} className="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-30" disabled={currentSlideIndex === 0}><ChevronLeft size={20} /></button>
           
           <span className="text-xs font-mono font-medium tracking-widest min-w-[60px] text-center text-white/80">
             {currentSlideIndex + 1} <span className="text-white/30">/</span> {slides.length}
           </span>
           
           <button onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))} className="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-30" disabled={currentSlideIndex === slides.length - 1}><ChevronRight size={20} /></button>
           
           <div className="w-px h-6 bg-white/20 mx-2" />
           
           <button onClick={() => setIsPresenting(false)} className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase hover:text-white text-white/70 transition-colors">
             <Maximize2 size={12} /> Exit
           </button>
        </div>

        {/* Mobile-only visible exit (top right) since bottom bar fades */}
        <button 
          onClick={() => setIsPresenting(false)} 
          className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-white rounded-full sm:hidden backdrop-blur-md"
        >
          <X size={20} />
        </button>

      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FA] font-sans text-slate-900 overflow-hidden">
      
      {/* Top Navbar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-zinc-200 flex items-center justify-between px-4 z-50 shadow-sm sm:shadow-none">
         <div className="flex items-center gap-2 sm:gap-4">
             {/* Mobile Menu Button */}
             <button onClick={() => setShowMobileList(!showMobileList)} className="lg:hidden p-2 -ml-2 text-zinc-600 hover:bg-zinc-100 rounded-md">
                {showMobileList ? <X size={20}/> : <Menu size={20}/>}
             </button>

             <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center bg-[#0857C3] text-white rounded-sm"><LayoutTemplate size={16} /></div>
                <div className="flex flex-col">
                    <h1 className="text-sm font-bold text-zinc-900 leading-none tracking-tight font-grotesk uppercase hidden sm:block">BRI SlideGen</h1>
                    <h1 className="text-sm font-bold text-zinc-900 leading-none tracking-tight font-grotesk uppercase sm:hidden">SlideOT</h1>
                    <span className="text-[10px] text-zinc-400">Autosaved</span>
                </div>
             </div>
             
             {/* Desktop Undo/Redo */}
             <div className="hidden lg:flex items-center gap-1 ml-4 border-l border-zinc-100 pl-4">
                 <button onClick={() => undo(slides, currentSlideIndex)} disabled={history.past.length === 0} className="p-1.5 rounded hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-600 transition-colors" title="Undo"><Undo size={16} /></button>
                 <button onClick={() => redo(slides)} disabled={history.future.length === 0} className="p-1.5 rounded hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-600 transition-colors" title="Redo"><Redo size={16} /></button>
             </div>
         </div>

         <div className="flex items-center gap-2">
            <button onClick={handleExport} disabled={isExporting} className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-sm text-xs font-semibold uppercase tracking-wider text-zinc-600 hover:bg-zinc-100 transition-colors border border-transparent hover:border-zinc-200">
                {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export PDF'}</span>
            </button>
            <div className="w-px h-6 bg-zinc-200 mx-1 hidden sm:block" />
            <button onClick={() => setIsPresenting(true)} className="flex items-center gap-2 px-3 sm:px-5 py-1.5 rounded-sm text-xs font-bold uppercase tracking-wider text-white bg-[#0857C3] hover:bg-[#064299] transition-colors shadow-sm">
                <MonitorPlay size={14} />
                <span>Play</span>
            </button>
         </div>
      </div>

      <div className="flex w-full h-full pt-14 relative">
        
        {/* Left Sidebar (Slide List) - Responsive Drawer */}
        <div className={`
            fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-zinc-200 transform transition-transform duration-300 ease-in-out pt-14
            lg:relative lg:translate-x-0 lg:pt-0 lg:w-60 lg:flex flex-col
            ${showMobileList ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:shadow-none'}
        `}>
            {/* Mobile Header for Sidebar */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-zinc-100 bg-white">
                <span className="font-bold text-xs uppercase text-zinc-500">All Slides</span>
                <button onClick={() => setShowMobileList(false)}><X size={16} className="text-zinc-400"/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin h-full">
                {slides.map((slide, index) => (
                    <div key={slide.id} className="flex gap-3 group">
                        <div className="w-4 text-right pt-2 text-[10px] font-mono text-zinc-400 group-hover:text-zinc-900">{String(index + 1).padStart(2, '0')}</div>
                        <div className="flex-1">
                            <div onClick={() => handleMobileSelectSlide(index)} className={`aspect-video bg-white transition-all duration-200 relative cursor-pointer ${currentSlideIndex === index ? 'shadow-md ring-1 ring-[#0857C3]' : 'border border-zinc-200 hover:border-zinc-400'}`}>
                                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-100 pointer-events-none">
                                    <div className="origin-top-left w-[960px] h-[540px]" style={{ transform: 'scale(0.18)' }}><SlidePreview slide={slide} index={index + 1} total={slides.length} /></div>
                                </div>
                                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 lg:opacity-0 opacity-100">
                                    <button onClick={(e) => handleDuplicateSlide(e, index)} className="bg-white text-zinc-700 p-1 shadow-sm hover:text-black hover:bg-zinc-50 border border-zinc-200"><Copy size={10} /></button>
                                    <button onClick={(e) => handleDeleteSlide(e, index)} className="bg-white text-zinc-700 p-1 shadow-sm hover:text-red-600 hover:bg-red-50 border border-zinc-200"><Trash2 size={10} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                <button onClick={handleAddSlide} className="w-full mt-4 py-3 border border-dashed border-zinc-300 text-zinc-400 hover:border-[#0857C3] hover:text-[#0857C3] hover:bg-white flex items-center justify-center gap-2 transition-all text-xs font-semibold uppercase tracking-wider mb-20 lg:mb-0"><Plus size={14} /><span>Add Slide</span></button>
            </div>
        </div>

        {/* Overlay for mobile sidebar */}
        {showMobileList && <div className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-sm" onClick={() => setShowMobileList(false)}></div>}

        {/* Center Area (Preview) */}
        <div className="flex-1 bg-[#F0F0F0] flex flex-col relative overflow-hidden w-full">
            <div ref={previewContainerRef} className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-8 relative">
                <div 
                    className="shadow-2xl ring-1 ring-black/5 bg-white transition-transform duration-150 ease-out origin-center will-change-transform" 
                    style={{ 
                        transform: `scale(${zoom})`, 
                        width: '960px', 
                        height: '540px', 
                        flexShrink: 0 
                    }}
                >
                    <SlidePreview slide={currentSlide} index={currentSlideIndex + 1} total={slides.length}/>
                </div>
            </div>

            {/* Bottom Bar: Zoom & Info */}
            <div className="h-10 bg-white border-t border-zinc-200 flex items-center justify-between px-4 text-[10px] font-mono text-zinc-500 uppercase tracking-wide z-10 shrink-0">
                <div className="flex gap-4">
                    <span className="hidden sm:inline">SLIDE {String(currentSlideIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
                    <span className="sm:hidden">{currentSlideIndex + 1}/{slides.length}</span>
                </div>
                <div className="flex items-center gap-4">
                    {/* Zoom Control - Hidden on small mobile, visible on tablet+ */}
                    <div className="hidden sm:flex items-center gap-2 w-32 sm:w-48">
                        <button onClick={() => setZoom(Math.max(0.2, zoom - 0.1))} className="hover:text-black"><ZoomOut size={12}/></button>
                        <input type="range" min="0.2" max="1.5" step="0.05" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} className="w-full h-0.5 bg-zinc-200 appearance-none cursor-pointer accent-black"/>
                        <button onClick={() => setZoom(Math.min(1.5, zoom + 0.1))} className="hover:text-black"><ZoomIn size={12}/></button>
                        <span className="w-8 text-right text-zinc-900">{Math.round(zoom * 100)}%</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Right Sidebar (Editor) - Responsive Drawer */}
        <div className={`
            fixed inset-y-0 right-0 z-50 bg-white border-l border-zinc-200 transform transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
            w-[85vw] sm:w-[400px] lg:w-80 lg:relative lg:translate-x-0 lg:flex flex-col pt-14 lg:pt-0
            ${showMobileEditor ? 'translate-x-0' : 'translate-x-full'}
        `}>
            {/* Mobile Header for Editor */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-zinc-100 bg-white">
                <div className="flex items-center gap-2">
                    <Edit3 size={14} className="text-[#0857C3]"/>
                    <span className="font-bold text-xs uppercase text-zinc-900">Edit Slide</span>
                </div>
                <button onClick={() => setShowMobileEditor(false)} className="p-1 hover:bg-zinc-100 rounded"><X size={18} className="text-zinc-500"/></button>
            </div>

            <div className="h-full overflow-y-auto">
                <SlideEditor key={currentSlide.id} slide={currentSlide} onUpdate={handleUpdateSlide} onGroupUpdate={handleGroupUpdate}/>
            </div>
        </div>

        {/* Overlay for mobile editor */}
        {showMobileEditor && <div className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm" onClick={() => setShowMobileEditor(false)}></div>}

        {/* Mobile Floating Action Button for Editing */}
        <button 
            onClick={() => setShowMobileEditor(true)} 
            className="lg:hidden fixed bottom-14 right-4 z-30 w-12 h-12 bg-[#0857C3] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#064299] active:scale-95 transition-all"
        >
            <Edit3 size={20} />
        </button>

      </div>
        
        {/* Hidden Export Container */}
        <div id="export-container" style={{ position: 'fixed', top: 0, left: -10000, width: '960px' }}>
            {slides.map((slide, i) => <div key={slide.id} style={{ width: '960px', height: '540px', overflow: 'hidden' }}><SlidePreview slide={slide} scale={1} index={i + 1} total={slides.length}/></div>)}
        </div>
        
        {/* Export Loading Overlay */}
        {isExporting && <div className="fixed inset-0 bg-white/80 z-[100] flex items-center justify-center backdrop-blur-sm"><div className="flex flex-col items-center gap-4"><Loader2 size={32} className="text-black animate-spin" /><div className="text-center"><h3 className="font-bold text-sm uppercase tracking-widest text-zinc-900">Rendering PDF</h3></div></div></div>}
    </div>
  );
};
export default App;