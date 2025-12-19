export enum SlideLayout {
  Title = 'title',
  SectionHeader = 'section_header',
  TitleOnly = 'title_only',
  Content = 'content',
  TwoColumn = 'two_column',
  ImageLeft = 'image_left',
  ImageRight = 'image_right',
  Table = 'table',
  Timeline = 'timeline',
  Quote = 'quote',
  BigNumber = 'big_number',
  Gallery = 'gallery',
  ImageCarousel = 'image_carousel'
}

export type TextAlign = 'left' | 'center' | 'right';
export type ThemeMode = 'light' | 'bri'; // Updated to include BRI
export type FontSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl';
export type TablePadding = 'compact' | 'normal' | 'spacious';
export type TitleAnimation = 'none' | 'fade' | 'slide-top' | 'zoom';
export type FontFamily = 'inter' | 'grotesk' | 'serif' | 'mono';

export interface SlideItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
}

export interface SlideNumbering {
  enabled: boolean;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  format: 'numeric' | 'page-of';
}

export interface SlideData {
  id: string;
  layout: SlideLayout;
  title: string;
  subtitle?: string;
  points: string[];
  rightColumnPoints?: string[];
  imageUrl?: string;
  tableData?: string[][];
  textAlign?: TextAlign; 
  themeMode?: ThemeMode; 
  fontSize?: FontSize;
  titleFontSize?: FontSize;
  tablePadding?: TablePadding; 
  titleAnimation?: TitleAnimation; 
  items?: SlideItem[];
  backgroundImageUrl?: string; 
  backgroundOverlayOpacity?: number; 
  textColor?: string;
  fontFamily?: FontFamily;
  slideNumbering?: SlideNumbering;
}

export interface Presentation {
  title: string;
  slides: SlideData[];
}