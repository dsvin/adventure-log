import React from 'react';

export function IconMain({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <path d="M16 2 L30 16 L16 30 L2 16 Z" opacity="0.55" />
      <path d="M16 9 L23 21 L9 21 Z" fill="currentColor" stroke="none" />
      <circle cx="16" cy="6.3" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconShrine({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
      <path d="M16 2 L30 16 L16 30 L2 16 Z" />
      <path d="M16 9 L23 16 L16 23 L9 16 Z" fill="currentColor" stroke="none" opacity="0.92" />
    </svg>
  );
}

export function IconSide({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="16" cy="16" r="13" opacity="0.5" />
      <circle cx="16" cy="16" r="5" fill="currentColor" stroke="none" />
      <path d="M16 3 L16 7 M16 25 L16 29 M3 16 L7 16 M25 16 L29 16" strokeLinecap="round" />
    </svg>
  );
}

export function questIcon(type: string, className?: string) {
  if (type === 'main') return <IconMain className={className} />;
  if (type === 'shrine') return <IconShrine className={className} />;
  return <IconSide className={className} />;
}

export function IconFlame({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 30" fill="currentColor">
      <path d="M12 1 C13 7 19 9 19 17 a7 7 0 0 1 -14 0 c0 -4 2.5 -6 4 -8 c0.6 2 2 2.6 3 2 C14 9 11 6 12 1 Z" />
    </svg>
  );
}

export function IconGem({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 30" fill="currentColor" stroke="rgba(0,0,0,0.3)" strokeWidth="0.6">
      <path d="M12 1 L21 11 L12 29 L3 11 Z" />
      <path d="M3 11 L21 11 M12 1 L12 29 M7.5 11 L12 29 M16.5 11 L12 29" stroke="rgba(0,0,0,0.25)" fill="none" strokeWidth="0.7" />
    </svg>
  );
}

export function IconSeal({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="60" cy="60" r="54" opacity="0.4" />
      <circle cx="60" cy="60" r="44" opacity="0.7" />
      <path d="M60 16 L70 50 L104 60 L70 70 L60 104 L50 70 L16 60 L50 50 Z" fill="currentColor" stroke="none" opacity="0.92" />
      <path d="M60 30 L60 90 M30 60 L90 60" opacity="0.3" />
    </svg>
  );
}

export function CrestWatermark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="0.8">
      <path d="M60 6 L78 42 L114 60 L78 78 L60 114 L42 78 L6 60 L42 42 Z" />
      <path d="M60 24 L72 48 L96 60 L72 72 L60 96 L48 72 L24 60 L48 48 Z" />
      <circle cx="60" cy="60" r="9" />
      <circle cx="60" cy="60" r="40" opacity="0.5" />
    </svg>
  );
}

export const Ico = {
  plus: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  edit: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M16 3l5 5L8 21H3v-5z"/></svg>,
  trash: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14"/></svg>,
  close: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>,
  clock: () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>,
};
