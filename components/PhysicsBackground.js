'use client';
import { Atom, Orbit, Zap, Sigma, Magnet } from 'lucide-react';

const ITEMS = [
  { Icon: Atom, top: '8%', left: '4%', size: 64, cls: 'text-amber-400/10 animate-float-slow' },
  { Icon: Orbit, top: '62%', left: '88%', size: 90, cls: 'text-teal-400/10 animate-spin-slow' },
  { Icon: Zap, top: '82%', left: '8%', size: 46, cls: 'text-amber-400/10 animate-float' },
  { Icon: Sigma, top: '14%', left: '82%', size: 50, cls: 'text-teal-400/10 animate-float-slow' },
  { Icon: Magnet, top: '42%', left: '48%', size: 60, cls: 'text-amber-400/10 animate-float' },
  { Icon: Atom, top: '90%', left: '55%', size: 40, cls: 'text-teal-400/10 animate-spin-slow' },
];

export default function PhysicsBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {ITEMS.map(({ Icon, top, left, size, cls }, i) => (
        <Icon key={i} size={size} className={`absolute ${cls}`} style={{ top, left }} />
      ))}
    </div>
  );
}
