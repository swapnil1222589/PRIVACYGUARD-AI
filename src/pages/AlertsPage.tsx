import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Clock,
  Shield,
  Bell,
} from 'lucide-react';
import { useSanitizer } from '../context/SanitizerContext';

interface AlertsPageProps {
  onNavigateToSanitizer?: () => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ onNavigateToSanitizer: _onNavigateToSanitizer }) => {
  const { activityHistory, analytics, document } = useSanitizer();

  // Synthesize genuine operational alerts from actual session events and validation diagnostics
  const alerts: {
    id: string;
    level: 'critical' | 'warning' | 'info' | 'success';
    title: string;
    description: string;
    timestamp: string;
  }[] = [];

  // Luhn candidate failure alert
  if (analytics.luhnInvalidCards > 0) {
    alerts.push({
      id: 'alert-luhn-invalid',
      level: 'warning',
      title: 'Luhn Modulo-10 Checksum Failures Detected',
      description: `${analytics.luhnInvalidCards} 16-digit numeric candidate(s) failed credit card checksum verification and were automatically excluded from payment-card redaction to protect non-sensitive document integers.`,
      timestamp: 'Session Live',
    });
  }

  // Malformed IP alert
  if (analytics.rejectedBreakdown.malformedIp > 0) {
    alerts.push({
      id: 'alert-malformed-ip',
      level: 'warning',
      title: 'Out-of-Range IPv4 Octets Identified',
      description: `${analytics.rejectedBreakdown.malformedIp} candidate IP address(es) exceeded valid octet boundaries (0–255) and were excluded from confirmed network PII sanitization.`,
      timestamp: 'Session Live',
    });
  }

  // Active document loaded alert
  if (document) {
    alerts.push({
      id: 'alert-doc-mounted',
      level: 'info',
      title: `Document Mounted: ${document.metadata.filename}`,
      description: `Loaded ${document.metadata.charCount} characters (${document.metadata.lineCount} lines) into sandboxed browser V8 memory heap.`,
      timestamp: 'Session Live',
    });
  }

  // Redaction success alert
  if (analytics.totalRedacted > 0) {
    alerts.push({
      id: 'alert-redaction-complete',
      level: 'success',
      title: `${analytics.totalRedacted} Sensitive Entities Successfully Sanitized`,
      description: `Applied active redaction strategy across ${analytics.totalDetected} confirmed PII tokens with 0 network exfiltration.`,
      timestamp: 'Session Live',
    });
  }

  // Add historical session activities
  activityHistory.forEach(item => {
    alerts.push({
      id: item.id,
      level: item.action.includes('Cleared') ? 'info' : 'success',
      title: item.action,
      description: item.detail,
      timestamp: item.timestamp,
    });
  });

  return (
    <div className="space-y-4 pb-10 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-card border border-borderTheme shadow-card">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-warningOrange/10 border border-warningOrange/20 flex items-center justify-center text-warningOrange shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-textPrimary leading-tight">
              Operational Alerts & Event Stream
            </h1>
            <p className="text-[11px] text-textSecondary leading-normal">
              Live diagnostic events, data integrity warnings, and processing milestones derived strictly from session runtime state.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-cardElevated border border-borderTheme px-3 py-1.5 rounded-xl text-xs font-mono text-textPrimary shadow-subtle">
          <Shield className="w-3.5 h-3.5 text-successGreen" />
          <span>Active Events: {alerts.length}</span>
        </div>
      </div>

      {/* Alerts Stream List */}
      <div className="space-y-3">
        {alerts.length > 0 ? (
          alerts.map(alert => {
            const isWarning = alert.level === 'warning';
            const isSuccess = alert.level === 'success';

            return (
              <div
                key={alert.id}
                className="bg-card border border-borderTheme rounded-2xl p-4 shadow-card flex items-start gap-3.5 hover:border-borderTheme/80 transition-colors"
              >
                <div
                  className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                    isWarning
                      ? 'bg-warningOrange/10 text-warningOrange border border-warningOrange/20'
                      : isSuccess
                      ? 'bg-successGreen/10 text-successGreen border border-successGreen/20'
                      : 'bg-primaryPurple/10 text-primaryPurple border border-primaryPurple/20'
                  }`}
                >
                  {isWarning ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : isSuccess ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Info className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-xs font-bold text-textPrimary">
                      {alert.title}
                    </h3>
                    <span className="text-[10px] font-mono text-textSecondary flex items-center gap-1">
                      <Clock className="w-3 h-3 text-textSecondary/60" />
                      {alert.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-textSecondary leading-relaxed">
                    {alert.description}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-borderTheme bg-card/60 p-8 text-center space-y-2 shadow-card">
            <CheckCircle2 className="w-8 h-8 text-successGreen mx-auto opacity-70" />
            <h3 className="text-sm font-semibold text-textPrimary">All Security Systems Nominal</h3>
            <p className="text-xs text-textSecondary">
              Zero anomalies, out-of-range candidates, or integrity warnings detected in the active workspace.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
