import { useState, useEffect } from 'react';
import { Layout } from 'lucide-react';
import DashboardForm from './components/DashboardForm';
import MobilePreview from './components/MobilePreview';
import StatusIndicator from './components/StatusIndicator';
import Sidebar from './components/Sidebar';
import LogsPage from './components/LogsPage';
import UsersPage from './components/UsersPage';
import SettingsPage from './components/SettingsPage';
import LoginPage from './components/LoginPage';
import { Shield } from 'lucide-react';
import { MEETING_TEMPLATES, CERTIFICATE_TEMPLATES } from './data/templates';

const INITIAL_FORM_STATE = {
  // Client Data
  clientName: '',
  clientPhone: '',

  // Agent Info
  agentName: '',

  // Meeting Info
  meetingDate: '',
  meetingTime: '',

  // Template Config
  messageType: 'meeting', // 'meeting' | 'certificate'
  selectedTemplateId: 'v1',
  customMessage: '', // New field for editable message
  isRandomTemplate: true, // Anti-Spam protection default on

  // Link Management
  isAutoLink: false,
  manualLink: '',
  protocolCode: '',
  linkFormat: 'button', // 'text' | 'button'

  // Sending Config
  destination: 'private', // 'private' | 'group'
  scheduleDate: '',
  scheduleTime: '',

  // Special
  layoutMode: 'list', // 'list', 'compact', 'visual', etc.

  // Webhook
  webhookUrl: localStorage.getItem('webhookUrl') || '',
  qrWebhookUrl: localStorage.getItem('qrWebhookUrl') || '',

  // WhatsApp Instance
  instancePhone: localStorage.getItem('instancePhone') || '',
  instanceStatus: localStorage.getItem('instanceStatus') || 'disconnected',
  serverUrl: localStorage.getItem('serverUrl') || '',
  instanceToken: localStorage.getItem('instanceToken') || ''
};

const generateProtocol = () => {
  return 'ASC-' + Math.floor(1000 + Math.random() * 9000);
};

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [formData, setFormData] = useState(() => {
    // Lazy init to ensure localStorage is read at mount time, avoiding module caching issues
    const savedUrl = localStorage.getItem('webhookUrl') || '';
    const savedQrUrl = localStorage.getItem('qrWebhookUrl') || '';
    const savedServerUrl = localStorage.getItem('serverUrl') || '';
    const savedToken = localStorage.getItem('instanceToken') || '';
    const savedPhone = localStorage.getItem('instancePhone') || '';
    const savedStatus = localStorage.getItem('instanceStatus') || 'disconnected';

    return {
      ...INITIAL_FORM_STATE,
      webhookUrl: savedUrl,
      qrWebhookUrl: savedQrUrl,
      serverUrl: savedServerUrl,
      instanceToken: savedToken,
      instancePhone: savedPhone,
      instanceStatus: savedStatus
    };
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Initial Auth Check
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        const user = JSON.parse(userStr);
        setIsAuthenticated(true);
        setCurrentUser(user);
      }
    } catch (error) {
      console.error("Erro ao recuperar sessão:", error);
      // Se falhar ao ler (ex: JSON inválido), limpa tudo para evitar loop de erro
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  }, []);

  // Fetch Global Settings on Auth
  useEffect(() => {
    if (isAuthenticated) {
      const loadSettings = async () => {
        try {
          const settings = await api.getSettings();
          console.log('Global Settings Loaded:', settings);

          if (settings) {
            setFormData(prev => ({
              ...prev,
              // Prioritize Global Settings, fallback to local only if global is missing/empty and local exists
              // Actually, global should be the source of truth. If global is empty, we technically default to empty.
              // But to be safe, we use logical OR.
              webhookUrl: settings.webhookUrl || prev.webhookUrl,
              qrWebhookUrl: settings.qrWebhookUrl || prev.qrWebhookUrl,
              instancePhone: settings.instancePhone || prev.instancePhone,
              instanceStatus: settings.instanceStatus || prev.instanceStatus,
              serverUrl: settings.serverUrl || prev.serverUrl,
              instanceToken: settings.instanceToken || prev.instanceToken
            }));

            // Persist to local storage immediately to sync state
            if (settings.webhookUrl) localStorage.setItem('webhookUrl', settings.webhookUrl);
            if (settings.qrWebhookUrl) localStorage.setItem('qrWebhookUrl', settings.qrWebhookUrl);
            if (settings.instancePhone) localStorage.setItem('instancePhone', settings.instancePhone);
            if (settings.instanceStatus) localStorage.setItem('instanceStatus', settings.instanceStatus);
            if (settings.serverUrl) localStorage.setItem('serverUrl', settings.serverUrl);
            if (settings.instanceToken) localStorage.setItem('instanceToken', settings.instanceToken);
          }
        } catch (err) {
          console.error('Failed to load global settings', err);
        }
      };
      loadSettings();
    }
  }, [isAuthenticated]);

  const handleLogin = (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  // Generate an initial protocol code or defaults if needed
  useEffect(() => {
    if (!formData.protocolCode) {
      setFormData(prev => ({ ...prev, protocolCode: generateProtocol() }));
    }
  }, []);

  // Access Control: Redirect Operador to Dashboard if they try to access other views
  useEffect(() => {
    if (currentUser?.role === 'Operador' && activeView !== 'dashboard') {
      setActiveView('dashboard');
    }
  }, [currentUser, activeView]);

  // Update customMessage when template changes
  useEffect(() => {
    const templates = formData.messageType === 'meeting' ? MEETING_TEMPLATES : CERTIFICATE_TEMPLATES;
    const template = templates.find(t => t.id === formData.selectedTemplateId) || templates[0];

    setFormData(prev => ({
      ...prev,
      customMessage: template.text
    }));
  }, [formData.selectedTemplateId, formData.messageType]);

  // Persist Webhook URLs
  useEffect(() => {
    localStorage.setItem('webhookUrl', formData.webhookUrl);
    localStorage.setItem('qrWebhookUrl', formData.qrWebhookUrl);
    localStorage.setItem('instancePhone', formData.instancePhone);
    localStorage.setItem('instanceStatus', formData.instanceStatus);
    localStorage.setItem('serverUrl', formData.serverUrl);
    localStorage.setItem('instanceToken', formData.instanceToken);
  }, [formData.webhookUrl, formData.qrWebhookUrl, formData.instancePhone, formData.instanceStatus, formData.serverUrl, formData.instanceToken]);

  // Sync Agent Name with Current User
  useEffect(() => {
    if (currentUser?.name) {
      setFormData(prev => ({
        ...prev,
        agentName: currentUser.name
      }));
    }
  }, [currentUser]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ------------------------------------------------------------------
  // Auth Check - Must be AFTER all hooks
  // ------------------------------------------------------------------
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }



  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] text-[var(--color-text-main)] font-sans flex">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        onLogout={handleLogout}
        user={currentUser}
      />

      <div className="flex-1 ml-64 transition-all duration-300">
        {/* Dynamic Content Area */}
        {activeView === 'dashboard' && (
          <>
            <header className="sticky top-0 z-40 w-full border-b border-[var(--color-border)] bg-white/80 backdrop-blur-md mb-8">
              <div className="container mx-auto max-w-7xl h-16 flex items-center justify-between px-6 lg:px-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[var(--color-primary)] rounded-xl shadow-lg shadow-[var(--color-primary)]/20 flex items-center justify-center text-white transform hover:scale-105 transition-transform duration-200">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-[var(--color-text-main)]">ASCEL Supervisor</h1>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                        v2.0.0
                      </span>
                      <span className="text-xs text-slate-500">
                        | Olá, <b>{currentUser?.name || 'Admin'}</b>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <StatusIndicator isConnected={formData.instanceStatus === 'connected'} />
                </div>
              </div>
            </header>

            <main className="container mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-[1fr_auto] lg:gap-8 items-start px-6 lg:px-8 pb-20">
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <DashboardForm
                  formData={formData}
                  onChange={handleChange}
                  onGenerateProtocol={() => handleChange('protocolCode', generateProtocol())}
                />
              </section>

              <section className="w-full lg:w-auto mt-8 lg:mt-0 lg:sticky lg:top-24 animate-in fade-in slide-in-from-right-4 duration-700 delay-100 flex justify-center">
                <MobilePreview formData={formData} />
              </section>
            </main>
          </>
        )}

        {/* Other Views */}
        <main className="p-8">
          {activeView === 'logs' && <LogsPage />}
          {activeView === 'users' && <UsersPage />}
          {activeView === 'settings' && <SettingsPage formData={formData} onChange={handleChange} user={currentUser} />}
        </main>
      </div>
    </div>
  );
}

export default App;
