import React from 'react';
import { Shield, EyeOff, Hash, Sparkles } from 'lucide-react';
import { RedactionMode } from '../../types';

interface RedactionModeSelectorProps {
  currentMode: RedactionMode;
  onChangeMode: (mode: RedactionMode) => void;
}

export const RedactionModeSelector: React.FC<RedactionModeSelectorProps> = ({
  currentMode,
  onChangeMode,
}) => {
  const modes: {
    id: RedactionMode;
    title: string;
    description: string;
    example: string;
    accentColor: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: 'full',
      title: 'Full Masking',
      description: 'Replaces sensitive entities entirely with a uniform redaction indicator.',
      example: 'rahul@example.com → [REDACTED]',
      accentColor: 'text-primaryPurple',
      icon: EyeOff,
    },
    {
      id: 'partial',
      title: 'Partial Masking',
      description: 'Retains non-identifying characters (first letter, domain, trailing 4 digits).',
      example: 'rahul@example.com → r***@example.com',
      accentColor: 'text-accentCyan',
      icon: Shield,
    },
    {
      id: 'pseudonym',
      title: 'Consistent Pseudonymization',
      description: 'Replaces entities with deterministic in-memory placeholders preserving relations.',
      example: 'rahul@example.com → USER_01 (deterministic)',
      accentColor: 'text-blue-500',
      icon: Hash,
    },
  ];

  return (
    <div className="bg-card border border-borderTheme rounded-xl p-3.5 shadow-card space-y-2.5 transition-colors">
      <div className="flex items-center justify-between pb-2 border-b border-borderTheme">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-primaryPurple" />
          <span className="text-xs font-semibold uppercase tracking-wider text-textPrimary">
            Redaction Strategy Selector
          </span>
        </div>
        <span className="text-[10px] text-primaryPurple bg-primaryPurple/10 border border-primaryPurple/20 px-2 py-0.5 rounded-md font-mono font-medium">
          Live Real-time Preview
        </span>
      </div>

      <div
        role="radiogroup"
        aria-label="Redaction strategies"
        className="grid grid-cols-1 md:grid-cols-3 gap-2.5"
      >
        {modes.map(mode => {
          const Icon = mode.icon;
          const isSelected = currentMode === mode.id;

          return (
            <button
              type="button"
              role="radio"
              aria-checked={isSelected}
              key={mode.id}
              onClick={() => onChangeMode(mode.id)}
              className={`text-left rounded-xl p-3 border transition-all flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-primaryPurple ${
                isSelected
                  ? 'bg-primaryPurple/10 border-primaryPurple shadow-card ring-1 ring-primaryPurple/30'
                  : 'bg-cardElevated border-borderTheme hover:border-primaryPurple/40 hover:bg-cardElevated/80'
              }`}
            >
              <div className="space-y-1 w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isSelected
                          ? 'bg-primaryPurple text-white'
                          : 'bg-card border border-borderTheme text-textSecondary'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-textPrimary">
                      {mode.title}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-accentCyan animate-pulse" />
                  )}
                </div>

                <p className="text-[11px] text-textSecondary leading-normal">
                  {mode.description}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-borderTheme font-mono text-[10px] text-textSecondary truncate w-full">
                <span>Sample: </span>
                <span className="text-primaryPurple font-semibold">{mode.example}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
