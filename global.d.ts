interface Element {
    scrollIntoView(arg?: boolean | ScrollIntoViewOptions): void;
  }
  
  interface ScrollIntoViewOptions {
    behavior?: 'auto' | 'smooth';
    block?: 'start' | 'center' | 'end' | 'nearest';
    inline?: 'start' | 'center' | 'end' | 'nearest';
  }