import React, { useState } from 'react';
import { SlideData, SlideLayout, FontSize, FontFamily } from '../types';
import { Quote as QuoteIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface SlidePreviewProps {
  slide: SlideData;
  scale?: number;
  index?: number; // Current slide index (1-based)
  total?: number; // Total slides count
}

const SlidePreview: React.FC<SlidePreviewProps> = ({ slide, scale = 1, index = 1, total = 1 }) => {
  const [carouselIndex, setCarouselIndex] = useState(0);

  const baseWidth = 960;
  const baseHeight = 540;

  const containerStyle: React.CSSProperties = {
    width: `${baseWidth}px`,
    height: `${baseHeight}px`,
    transform: `scale(${scale})`,
    transformOrigin: 'center center', 
  };

  const alignClass = slide.textAlign === 'center' ? 'text-center items-center' : 
                     slide.textAlign === 'right' ? 'text-right items-end' : 
                     'text-left items-start';

  // Aesthetic Logic: Strict Monochrome / Architectural
  const hasBgImage = !!slide.backgroundImageUrl;
  
  // Default Style: Clean White or Stark Black (if requested, but usually white paper style)
  const bgStyle = hasBgImage ? {} : { backgroundColor: 'white', color: '#111' };
  
  // Typography overrides
  const customTextColor = slide.textColor;
  const rootTextStyle = customTextColor ? { color: customTextColor } : {};

  // Font Family Helper
  const getFontClass = (type: 'heading' | 'body' | 'mono'): string => {
      if (slide.fontFamily) {
          switch (slide.fontFamily) {
              case 'inter': return 'font-sans';
              case 'grotesk': return 'font-grotesk';
              case 'serif': return 'font-serif-display';
              case 'mono': return 'font-mono';
              default: return 'font-sans';
          }
      }
      switch (type) {
          case 'heading': return 'font-grotesk';
          case 'body': return 'font-inter';
          case 'mono': return 'font-mono';
      }
  };

  const headingFont = getFontClass('heading');
  const bodyFont = getFontClass('body');
  const monoFont = getFontClass('mono');

  // Animation
  const getAnimClass = () => {
      switch(slide.titleAnimation) {
          case 'fade': return 'anim-fade';
          case 'slide-top': return 'anim-slide-top';
          case 'zoom': return 'anim-zoom';
          default: return '';
      }
  };

  // Font Size Mapper
  const getFontSizeClass = (size?: FontSize, defaultSize: string = 'text-base') => {
      if (!size) return defaultSize;
      const map: Record<FontSize, string> = {
          'xs': 'text-xs',
          'sm': 'text-sm',
          'md': 'text-base',
          'lg': 'text-lg',
          'xl': 'text-xl',
          '2xl': 'text-2xl',
          '3xl': 'text-3xl',
          '4xl': 'text-4xl',
          '5xl': 'text-5xl',
          '6xl': 'text-6xl',
          '7xl': 'text-7xl',
          '8xl': 'text-8xl',
      };
      return map[size] || defaultSize;
  };

  // Helper for top-right metadata
  const renderMeta = (text: string = "Architecture Portfolio") => (
      <div className={`absolute top-6 right-6 text-[10px] ${monoFont} tracking-widest uppercase opacity-40 flex gap-4`}>
          <span>{text}</span>
          <span>2024</span>
      </div>
  );

  // New Slide Numbering Renderer
  const renderSlideNumber = () => {
      if (!slide.slideNumbering || !slide.slideNumbering.enabled) return null;

      const { position, format } = slide.slideNumbering;
      const text = format === 'page-of' 
          ? `${index.toString().padStart(2, '0')} / ${total.toString().padStart(2, '0')}`
          : index.toString().padStart(2, '0');

      let posClass = "";
      switch(position) {
          case 'top-left': posClass = "top-6 left-6"; break;
          case 'top-right': posClass = "top-6 right-6"; break;
          case 'bottom-left': posClass = "bottom-6 left-6"; break;
          case 'bottom-right': posClass = "bottom-6 right-6"; break;
          default: posClass = "bottom-6 right-6";
      }

      return (
          <div className={`absolute ${posClass} text-xs ${monoFont} tracking-widest opacity-40 z-20`}>
              {text}
          </div>
      );
  };

  const renderContent = () => {
    // Determine dynamic body font size based on layout needs
    const contentBodySize = getFontSizeClass(slide.fontSize, 'text-lg');
    const denseBodySize = getFontSizeClass(slide.fontSize, 'text-sm');
    
    // Determine dynamic title size (defaults vary per layout)
    const titleSize = (def: string) => getFontSizeClass(slide.titleFontSize, def);

    switch (slide.layout) {
      // 1. TITLE
      case SlideLayout.Title:
        return (
          <div className="flex flex-col h-full relative p-16 justify-between" style={{ ...bgStyle, ...rootTextStyle }}>
            <div className="w-full h-px bg-current opacity-20 absolute top-12 left-0 right-0"></div>
            <div className="w-full h-px bg-current opacity-20 absolute bottom-12 left-0 right-0"></div>
            
            <div className={`${monoFont} text-xs uppercase tracking-widest pt-8`}>
                Presentation Deck
            </div>

            <div className="flex flex-col">
                <h1 
                    className={`${titleSize('text-8xl')} ${headingFont} font-bold uppercase leading-[0.85] tracking-tight mb-8 ${getAnimClass()}`}
                    dangerouslySetInnerHTML={{ __html: slide.title }}
                />
                {slide.subtitle && (
                   <div className="flex items-center gap-4">
                       <div className="h-px w-12 bg-current"></div>
                       <h2 className={`text-sm ${monoFont} tracking-widest uppercase`} dangerouslySetInnerHTML={{ __html: slide.subtitle }} />
                   </div>
                )}
            </div>

            <div className="flex justify-between items-end pb-4">
                 <div className={`text-xs ${bodyFont} opacity-60 max-w-sm leading-relaxed`}>
                    {slide.points[0] || "Architecture is the learned game, correct and magnificent, of forms assembled in the light."}
                 </div>
                 <div className="text-xs font-bold uppercase tracking-widest border border-current px-3 py-1">
                     Start
                 </div>
            </div>
          </div>
        );

      // 2. SECTION HEADER
      case SlideLayout.SectionHeader:
        return (
            <div className="flex flex-col h-full relative justify-center items-center text-center p-20 bg-zinc-900 text-white" style={{ ...bgStyle, ...rootTextStyle, ...(hasBgImage ? {} : {backgroundColor: '#18181b', color: 'white'}) }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-white/20"></div>
                <h2 className={`${monoFont} text-xs uppercase tracking-[0.3em] mb-6 text-white/50`}>Section {index.toString().padStart(2,'0')}</h2>
                <h1 
                    className={`${titleSize('text-7xl')} ${headingFont} font-bold uppercase tracking-tight mb-8 ${getAnimClass()}`}
                    dangerouslySetInnerHTML={{ __html: slide.title }}
                />
                {slide.subtitle && (
                    <div className="border-t border-white/20 pt-6 max-w-lg">
                        <p className={`text-lg ${slide.fontFamily === 'serif' ? headingFont : 'font-serif-display'} italic text-white/80`} dangerouslySetInnerHTML={{ __html: slide.subtitle }} />
                    </div>
                )}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-24 bg-white/20"></div>
            </div>
        );

      // 3. TITLE ONLY
      case SlideLayout.TitleOnly:
        return (
            <div className="flex flex-col h-full justify-center items-center p-12 text-center relative" style={{ ...bgStyle, ...rootTextStyle }}>
                {renderMeta("Concept")}
                <div className="flex-1 flex flex-col justify-center items-center">
                    <h1 
                        className={`${titleSize('text-6xl')} ${headingFont} font-bold uppercase tracking-tight ${getAnimClass()}`}
                        dangerouslySetInnerHTML={{ __html: slide.title }}
                    />
                    <div className="w-24 h-1 bg-current mt-8"></div>
                </div>
            </div>
        );

      // 4. CONTENT
      case SlideLayout.Content:
        return (
          <div className="flex flex-col h-full p-16 relative" style={{ ...bgStyle, ...rootTextStyle }}>
            {renderMeta("Details")}

            <div className="mb-12 border-b border-current/20 pb-6 flex justify-between items-end">
                <h2 
                    className={`${titleSize('text-4xl')} ${headingFont} font-bold uppercase ${getAnimClass()}`}
                    dangerouslySetInnerHTML={{ __html: slide.title }}
                />
                {slide.subtitle && <span className={`${monoFont} text-xs opacity-50`} dangerouslySetInnerHTML={{ __html: slide.subtitle }} />}
            </div>

            <div className="flex-1 pl-4">
                 <ul className="space-y-6">
                    {slide.points.map((point, i) => (
                    <li key={i} className="flex gap-6 items-baseline">
                            <span className={`${monoFont} text-xs opacity-40`}>{(i+1).toString().padStart(2, '0')}.</span>
                            <div className={`flex-1 ${bodyFont} text-zinc-700 leading-relaxed ${contentBodySize}`} style={rootTextStyle} dangerouslySetInnerHTML={{ __html: point }}></div>
                    </li>
                    ))}
                </ul>
            </div>
          </div>
        );

      // 5. TWO COLUMN
      case SlideLayout.TwoColumn:
        const leftPoints = slide.points;
        const rightPoints = slide.rightColumnPoints && slide.rightColumnPoints.length > 0 
            ? slide.rightColumnPoints 
            : []; 

        return (
          <div className="flex h-full p-16 relative gap-16" style={{ ...bgStyle, ...rootTextStyle }}>
            {/* Left Column */}
            <div className="w-5/12 flex flex-col pt-12">
                <h2 
                    className={`${titleSize('text-5xl')} ${headingFont} font-bold uppercase mb-8 leading-[0.9] ${getAnimClass()}`}
                    dangerouslySetInnerHTML={{ __html: slide.title }}
                />
                <div className="w-12 h-1 bg-current mb-12"></div>
                <div className="space-y-6">
                     {leftPoints.map((p, i) => (
                         <div key={i} className={`${headingFont} text-xl font-medium leading-tight`}>
                             <div dangerouslySetInnerHTML={{__html: p}} />
                         </div>
                     ))}
                </div>
            </div>
            
            <div className="w-px bg-current opacity-10 h-full mt-4"></div>

            {/* Right Column */}
            <div className="flex-1 pt-12 flex flex-col">
                <div className={`${bodyFont} opacity-70 leading-relaxed space-y-4 text-justify ${denseBodySize}`}>
                     {rightPoints.length > 0 ? (
                         rightPoints.map((p, i) => (
                             <p key={i} dangerouslySetInnerHTML={{__html: p}} />
                         ))
                     ) : (
                        <p className="opacity-40 italic">Add content to the right column in the editor...</p>
                     )}
                </div>
            </div>
          </div>
        );

      // 6. IMAGE LEFT
      case SlideLayout.ImageLeft:
        return (
          <div className="flex h-full w-full" style={{ ...bgStyle, ...rootTextStyle }}>
            <div className="w-1/2 h-full bg-zinc-100 relative overflow-hidden">
                <img 
                    src={slide.imageUrl || 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&q=80&w=800'} 
                    className="w-full h-full object-cover grayscale" 
                    alt="Architecture" 
                />
            </div>
            <div className="w-1/2 p-16 flex flex-col justify-center">
                <div className={`${monoFont} text-xs uppercase tracking-widest opacity-40 mb-4`}>Figure 06</div>
                <h2 
                    className={`${titleSize('text-4xl')} ${headingFont} font-bold uppercase mb-8 leading-none ${getAnimClass()}`}
                    dangerouslySetInnerHTML={{ __html: slide.title }}
                />
                <div className="space-y-6">
                    {slide.points.map((p, i) => (
                        <p key={i} className={`${denseBodySize} ${bodyFont} opacity-70 leading-7 border-b border-current/10 pb-4 last:border-0`} dangerouslySetInnerHTML={{__html: p}} />
                    ))}
                </div>
            </div>
          </div>
        );

      // 7. IMAGE RIGHT
      case SlideLayout.ImageRight:
        return (
           <div className="flex h-full w-full" style={{ ...bgStyle, ...rootTextStyle }}>
            <div className="w-1/2 p-16 flex flex-col justify-center text-right items-end">
                <div className={`${monoFont} text-xs uppercase tracking-widest opacity-40 mb-4`}>Figure 07</div>
                <h2 
                    className={`${titleSize('text-4xl')} ${headingFont} font-bold uppercase mb-8 leading-none ${getAnimClass()}`}
                    dangerouslySetInnerHTML={{ __html: slide.title }}
                />
                <div className="space-y-6">
                    {slide.points.map((p, i) => (
                        <p key={i} className={`${denseBodySize} ${bodyFont} opacity-70 leading-7`} dangerouslySetInnerHTML={{__html: p}} />
                    ))}
                </div>
            </div>
            <div className="w-1/2 h-full bg-zinc-100 relative overflow-hidden">
                <img 
                    src={slide.imageUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800'} 
                    className="w-full h-full object-cover grayscale" 
                    alt="Architecture" 
                />
            </div>
          </div>
        );

      // 8. TABLE
      case SlideLayout.Table:
        return (
            <div className="flex flex-col h-full p-16" style={{ ...bgStyle, ...rootTextStyle }}>
                {renderMeta("Data Analysis")}
                <div className="mb-10">
                    <h2 
                        className={`${titleSize('text-3xl')} ${headingFont} font-bold uppercase ${getAnimClass()}`}
                        dangerouslySetInnerHTML={{ __html: slide.title }}
                    />
                    {slide.subtitle && <p className={`text-sm ${monoFont} opacity-50 mt-2`} dangerouslySetInnerHTML={{ __html: slide.subtitle }} />}
                </div>
                
                <div className="flex-1 w-full overflow-hidden">
                    <table className="w-full text-left border-collapse border border-current/20">
                        <thead>
                            <tr className="border-b border-current/20 bg-current/5">
                                {slide.tableData?.[0]?.map((header, i) => (
                                    <th key={i} className={`py-3 px-4 ${monoFont} text-xs uppercase tracking-wider opacity-80 font-bold border-r border-current/20 last:border-r-0`}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {slide.tableData?.slice(1).map((row, i) => (
                                <tr key={i} className="border-b border-current/10 hover:bg-black/5 transition-colors">
                                    {row.map((cell, j) => (
                                        <td key={j} className={`py-3 px-4 ${bodyFont} text-sm opacity-80 border-r border-current/10 last:border-r-0`}>{cell}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {(!slide.tableData || slide.tableData.length === 0) && (
                         <div className={`w-full h-32 flex items-center justify-center border border-dashed border-current/20 mt-4 opacity-40 ${monoFont} text-xs`}>
                             NO DATA PROVIDED
                         </div>
                    )}
                </div>
            </div>
        );

      // 9. TIMELINE
      case SlideLayout.Timeline:
        const timelineItems = slide.items && slide.items.length > 0 
            ? slide.items 
            : slide.points.map((p, i) => ({ id: i.toString(), title: `PHASE ${i + 1}`, description: p, imageUrl: '' }));
            
        return (
            <div className="flex flex-col h-full p-16 justify-center" style={{ ...bgStyle, ...rootTextStyle }}>
                <h2 
                    className={`${titleSize('text-3xl')} ${headingFont} font-bold uppercase mb-16 text-center ${getAnimClass()}`}
                    dangerouslySetInnerHTML={{ __html: slide.title }}
                />
                <div className="relative flex justify-between items-start w-full px-8">
                    <div className="absolute top-[15px] left-0 w-full h-px bg-current opacity-20"></div>
                    {timelineItems.slice(0, 4).map((item, i) => (
                        <div key={i} className="relative flex flex-col items-center text-center w-1/4 px-2 z-10">
                            <div className="w-8 h-8 rounded-full border border-current bg-white flex items-center justify-center mb-6 text-[10px] font-bold">
                                {i + 1}
                            </div>
                            <h3 className={`${headingFont} font-bold text-sm uppercase mb-2`}>{item.title}</h3>
                            <p className={`${bodyFont} ${denseBodySize} opacity-60 leading-relaxed`}>{item.description}</p>
                            {item.imageUrl && (
                                <div className="mt-4 w-16 h-16 bg-gray-100 rounded-full overflow-hidden border border-current/20">
                                    <img src={item.imageUrl} className="w-full h-full object-cover" alt="icon"/>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );

      // 10. QUOTE
      case SlideLayout.Quote:
        return (
            <div className="flex flex-col h-full justify-center items-center p-24 text-center" style={{ ...bgStyle, ...rootTextStyle }}>
                <QuoteIcon size={48} className="mb-8 opacity-20" />
                <h2 
                    className={`${titleSize('text-4xl')} ${slide.fontFamily ? headingFont : 'font-serif-display'} italic leading-snug mb-8 opacity-90 ${getAnimClass()}`}
                    dangerouslySetInnerHTML={{ __html: `"${slide.title}"` }}
                />
                {slide.points[0] && (
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-px bg-current opacity-30"></div>
                        <span className={`${monoFont} text-xs uppercase tracking-widest opacity-60`} dangerouslySetInnerHTML={{ __html: slide.points[0] }} />
                        <div className="w-8 h-px bg-current opacity-30"></div>
                    </div>
                )}
            </div>
        );

      // 11. BIG NUMBER
      case SlideLayout.BigNumber:
        return (
            <div className="flex h-full" style={{ ...bgStyle, ...rootTextStyle }}>
                 <div className="w-1/2 flex items-center justify-center border-r border-current/10 bg-zinc-50">
                     <span className={`text-[180px] ${headingFont} font-bold leading-none tracking-tighter opacity-90`}>
                         {slide.points[0] || "98%"}
                     </span>
                 </div>
                 <div className="w-1/2 p-20 flex flex-col justify-center">
                     <h2 
                        className={`${titleSize('text-5xl')} ${headingFont} font-bold uppercase mb-6 leading-tight ${getAnimClass()}`}
                        dangerouslySetInnerHTML={{ __html: slide.title }}
                    />
                     <p className={`text-lg ${bodyFont} opacity-60 leading-relaxed`} dangerouslySetInnerHTML={{ __html: slide.points[1] || 'Growth metric analysis.' }} />
                 </div>
            </div>
        );

      // 12. GALLERY
      case SlideLayout.Gallery:
        const galleryItems = slide.items && slide.items.length > 0 ? slide.items : [1, 2, 3, 4, 5, 6].map(i => ({ id: i.toString(), imageUrl: '', title: `IMG ${i}`, description: '' }));
        return (
            <div className="flex flex-col h-full p-12" style={{ ...bgStyle, ...rootTextStyle }}>
                <div className="flex justify-between items-center mb-6">
                    <h2 
                        className={`${titleSize('text-2xl')} ${headingFont} font-bold uppercase ${getAnimClass()}`}
                        dangerouslySetInnerHTML={{ __html: slide.title }}
                    />
                    <span className={`${monoFont} text-[10px] opacity-40`}>VISUAL INDEX</span>
                </div>
                <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-4">
                    {galleryItems.slice(0, 6).map((item, i) => (
                        <div key={i} className="relative group bg-zinc-100 overflow-hidden w-full h-full border border-current/10">
                             <img 
                                src={item.imageUrl || `https://images.unsplash.com/photo-${15160 + i}?auto=format&fit=crop&w=400&q=80`} 
                                className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110" 
                                alt={item.title}
                             />
                             <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                 <span className="text-white font-mono text-xs uppercase tracking-widest">{item.title}</span>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        );

      // 13. IMAGE CAROUSEL (NEW)
      case SlideLayout.ImageCarousel:
          const carouselItems = slide.items && slide.items.length > 0 
            ? slide.items 
            : [{id:'1', title:'Sample 1', description:'Sample Desc', imageUrl: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&q=80&w=800'}, {id:'2', title:'Sample 2', description:'Sample Desc', imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800'}];
          
          const activeItem = carouselItems[carouselIndex % carouselItems.length];

          const handlePrev = (e: React.MouseEvent) => {
              e.stopPropagation();
              setCarouselIndex(prev => prev === 0 ? carouselItems.length - 1 : prev - 1);
          };
          const handleNext = (e: React.MouseEvent) => {
              e.stopPropagation();
              setCarouselIndex(prev => (prev + 1) % carouselItems.length);
          };

          return (
             <div className="flex h-full w-full relative bg-zinc-100 overflow-hidden group" style={{ ...bgStyle, ...rootTextStyle }}>
                 {/* Main Image */}
                 <img 
                    src={activeItem.imageUrl || `https://images.unsplash.com/photo-15160?auto=format&fit=crop&w=800&q=80`}
                    className="w-full h-full object-cover transition-transform duration-500"
                    alt={activeItem.title}
                 />
                 
                 {/* Overlay Gradient */}
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80"></div>

                 {/* Content Overlay */}
                 <div className="absolute bottom-12 left-12 right-12 text-white">
                     <div className="flex justify-between items-end">
                         <div>
                            <span className={`${monoFont} text-xs uppercase tracking-widest opacity-60 mb-2 block`}>
                                {carouselIndex + 1} / {carouselItems.length}
                            </span>
                            <h2 
                                className={`${titleSize('text-4xl')} ${headingFont} font-bold uppercase mb-2 ${getAnimClass()}`}
                                dangerouslySetInnerHTML={{ __html: activeItem.title }}
                            />
                            <p className={`${bodyFont} text-sm opacity-80 max-w-lg`}>
                                {activeItem.description}
                            </p>
                         </div>
                     </div>
                 </div>

                 {/* Navigation Controls */}
                 <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button onClick={handlePrev} className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur text-white border border-white/20 transition-all">
                         <ChevronLeft size={24} />
                     </button>
                     <button onClick={handleNext} className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur text-white border border-white/20 transition-all">
                         <ChevronRight size={24} />
                     </button>
                 </div>

                 {/* Dots */}
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                     {carouselItems.map((_, i) => (
                         <button 
                            key={i} 
                            onClick={(e) => { e.stopPropagation(); setCarouselIndex(i); }}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${i === carouselIndex ? 'bg-white w-4' : 'bg-white/30 hover:bg-white/50'}`}
                         />
                     ))}
                 </div>
             </div>
          );

      default:
        return (
           <div className="flex flex-col h-full justify-center items-center p-20 text-center" style={{ ...bgStyle, ...rootTextStyle }}>
               <h1 className="text-4xl font-bold mb-4">{slide.title}</h1>
               <p>Layout not recognized.</p>
           </div>
        );
    }
  };

  return (
    <div 
      className="bg-white shadow-2xl overflow-hidden relative"
      style={containerStyle}
    >
      {/* Background Image Rendering */}
      {hasBgImage && slide.layout !== SlideLayout.ImageCarousel && (
        <div className="absolute inset-0 z-0">
             <img src={slide.backgroundImageUrl} className="w-full h-full object-cover" alt="Slide Background" />
             <div 
                className="absolute inset-0" 
                style={{ backgroundColor: 'black', opacity: slide.backgroundOverlayOpacity ?? 0.5 }} 
             />
        </div>
      )}

      {/* Slide Numbering Overlay */}
      {renderSlideNumber()}
      
      {/* Content Container */}
      <div className="relative z-10 w-full h-full">
        {renderContent()}
      </div>
    </div>
  );
};

export default SlidePreview;