import React, { useState, useEffect } from 'react';
import { Sidebar, NavigationPage } from './Sidebar';
import { Header } from './Header';
import { DashboardPage } from '../../pages/DashboardPage';
import { DataSanitizerPage } from '../../pages/DataSanitizerPage';
import { FindingsPage } from '../../pages/FindingsPage';
import { AlertsPage } from '../../pages/AlertsPage';
import { DetectionAnalyticsPage } from '../../pages/DetectionAnalyticsPage';
import { PrivacyAuditPage } from '../../pages/PrivacyAuditPage';
import { PromptLogPage } from '../../pages/PromptLogPage';
import { SettingsPage } from '../../pages/SettingsPage';
import { AboutPage } from '../../pages/AboutPage';
import { useSanitizer } from '../../context/SanitizerContext';
import { useTheme } from '../../context/ThemeContext';

export const AppLayout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const { exportSanitized, document } = useSanitizer();
  const { isDark } = useTheme();

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Export shortcut: Ctrl+E or Cmd+E
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        if (document) {
          e.preventDefault();
          exportSanitized();
        }
      }
      // Close mobile drawer on Escape
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [document, exportSanitized, mobileOpen]);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigateToSanitizer={() => setCurrentPage('sanitizer')} />;
      case 'sanitizer':
        return <DataSanitizerPage />;
      case 'findings':
        return <FindingsPage onNavigateToSanitizer={() => setCurrentPage('sanitizer')} />;
      case 'alerts':
        return <AlertsPage onNavigateToSanitizer={() => setCurrentPage('sanitizer')} />;
      case 'analytics':
        return <DetectionAnalyticsPage />;
      case 'audit':
        return <PrivacyAuditPage />;
      case 'prompts':
        return <PromptLogPage />;
      case 'settings':
        return <SettingsPage onNavigateToSanitizer={() => setCurrentPage('sanitizer')} />;
      case 'about':
        return <AboutPage onNavigateToSanitizer={() => setCurrentPage('sanitizer')} />;
      default:
        return <DashboardPage onNavigateToSanitizer={() => setCurrentPage('sanitizer')} />;
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#101010] text-[#F8FAFC]' : 'bg-[#F7F7FA] text-gray-900'} flex transition-colors duration-150`}>
      {/* Sidebar with Mobile Drawer */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col transition-all duration-150 min-h-screen lg:ml-16">
        <Header
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onOpenMobile={() => setMobileOpen(true)}
        />
        <main className="flex-1 p-3.5 sm:p-5 md:p-6 max-w-[1500px] w-full mx-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};
