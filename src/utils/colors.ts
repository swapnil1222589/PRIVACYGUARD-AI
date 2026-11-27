import { PIICategory } from '../types';

export interface CategoryColorMeta {
  name: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  highlightBg: string;
  highlightText: string;
  highlightBorder: string;
  hex: string;
}

export const CATEGORY_COLORS: Record<PIICategory, CategoryColorMeta> = {
  email: {
    name: 'Email Address',
    badgeBg: 'bg-purple-100 dark:bg-purple-950/60',
    badgeText: 'text-purple-800 dark:text-purple-300',
    badgeBorder: 'border-purple-300 dark:border-purple-600/40',
    highlightBg: 'bg-purple-100/90 dark:bg-purple-600/25',
    highlightText: 'text-purple-900 dark:text-purple-200',
    highlightBorder: 'border-purple-400 dark:border-purple-500/50',
    hex: '#8B5CF6',
  },
  phone: {
    name: 'Indian Phone',
    badgeBg: 'bg-cyan-100 dark:bg-cyan-950/60',
    badgeText: 'text-cyan-800 dark:text-cyan-300',
    badgeBorder: 'border-cyan-300 dark:border-cyan-600/40',
    highlightBg: 'bg-cyan-100/90 dark:bg-cyan-600/25',
    highlightText: 'text-cyan-900 dark:text-cyan-200',
    highlightBorder: 'border-cyan-400 dark:border-cyan-500/50',
    hex: '#22D3EE',
  },
  ip: {
    name: 'IPv4 Address',
    badgeBg: 'bg-blue-100 dark:bg-blue-950/60',
    badgeText: 'text-blue-800 dark:text-blue-300',
    badgeBorder: 'border-blue-300 dark:border-blue-600/40',
    highlightBg: 'bg-blue-100/90 dark:bg-blue-600/25',
    highlightText: 'text-blue-900 dark:text-blue-200',
    highlightBorder: 'border-blue-400 dark:border-blue-500/50',
    hex: '#3B82F6',
  },
  pan: {
    name: 'Income Tax PAN',
    badgeBg: 'bg-amber-100 dark:bg-amber-950/60',
    badgeText: 'text-amber-800 dark:text-amber-300',
    badgeBorder: 'border-amber-300 dark:border-amber-600/40',
    highlightBg: 'bg-amber-100/90 dark:bg-amber-600/25',
    highlightText: 'text-amber-900 dark:text-amber-200',
    highlightBorder: 'border-amber-400 dark:border-amber-500/50',
    hex: '#F59E0B',
  },
  aadhaar: {
    name: 'Aadhaar Shape',
    badgeBg: 'bg-pink-100 dark:bg-pink-950/60',
    badgeText: 'text-pink-800 dark:text-pink-300',
    badgeBorder: 'border-pink-300 dark:border-pink-600/40',
    highlightBg: 'bg-pink-100/90 dark:bg-pink-600/25',
    highlightText: 'text-pink-900 dark:text-pink-200',
    highlightBorder: 'border-pink-400 dark:border-pink-500/50',
    hex: '#EC4899',
  },
  creditCard: {
    name: 'Payment Card',
    badgeBg: 'bg-rose-100 dark:bg-rose-950/60',
    badgeText: 'text-rose-800 dark:text-rose-300',
    badgeBorder: 'border-rose-300 dark:border-rose-600/40',
    highlightBg: 'bg-rose-100/90 dark:bg-rose-600/25',
    highlightText: 'text-rose-900 dark:text-rose-200',
    highlightBorder: 'border-rose-400 dark:border-rose-500/50',
    hex: '#EF4444',
  },
};
