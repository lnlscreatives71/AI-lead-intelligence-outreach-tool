import React, { useState, useEffect } from 'react';
import { 
  Search, Settings, History, LayoutDashboard, Globe, 
  BarChart, Share2, Star, Cpu, Crosshair, Target, 
  Mail, Download, Database, ChevronRight, Loader2, Zap, Terminal
} from 'lucide-react';

// --- CYBERPUNK THEME COLORS ---
const THEME = {
  cyan: '#00f3ff',
  cyanGlow: 'rgba(0, 243, 255, 0.5)',
  purple: '#b026ff',
  purpleGlow: 'rgba(176, 38, 255, 0.4)',
  green: '#39ff14',
  red: '#ff003c',
  yellow: '#ffea00',
  black: '#000000',
  glassBg: 'rgba(10, 15, 25, 0.65)',
  glassBorder: 'rgba(0, 243, 255, 0.15)'
};

export default function ScoutApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reportTab, setReportTab] = useState('overview');
  const [showSettings, setShowSettings] = useState(false);

  // API Keys
  const [apiKeys, setApiKeys] = useState(() => {
    const saved = localStorage.getItem('scoutApiKeys');
    if (saved) return JSON.parse(saved);
    return { 
      anthropic: import.meta.env.VITE_ANTHROPIC_API_KEY || '', 
      serper: import.meta.env.VITE_SERPER_API_KEY || '', 
      hubspot: import.meta.env.VITE_HUBSPOT_API_KEY || '' 
    };
  });

  useEffect(() => {
    localStorage.setItem('scoutApiKeys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  // Lead State
  const [leadForm, setLeadForm] = useState({ name: '', location: '', website: '', industry: 'Real Estate' });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  
  // Data State
  const [reportData, setReportData] = useState(null);
  const [emailScripts, setEmailScripts] = useState({ hook: '', followup: '', close: '' });

  // --- API ORCHESTRATION ---
  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!apiKeys.anthropic || !apiKeys.serper) {
      alert("SYSTEM ERROR: API Auth Tokens Missing. Configure in Settings.");
      return;
    }
    setIsAnalyzing(true);
    setReportData(null);
    try {
      setLoadingStep('INITIALIZING LIVE WEB SCRAPE [SERPER]...');
      const serperData = await fetchSerperData(leadForm.name, leadForm.location);
      
      setLoadingStep('PROCESSING NEURAL ANALYSIS [CLAUDE]...');
      const aiAnalysis = await fetchAnthropicAnalysis(leadForm, serperData, apiKeys.anthropic);
      
      setLoadingStep('GENERATING TACTICAL OUTREACH VECTORS...');
      const finalOffer = determineFreeOffer(aiAnalysis.scores);
      
      setReportData({ ...aiAnalysis, finalOffer });
      setEmailScripts({ hook: aiAnalysis.emails.hook, followup: aiAnalysis.emails.followup, close: aiAnalysis.emails.close });
      setActiveTab('report');
    } catch (error) {
      alert("CRITICAL ERROR: Neural link severed. Check API keys.");
    } finally {
      setIsAnalyzing(false);
      setLoadingStep('');
    }
  };

  const determineFreeOffer = (scores) => {
    if (scores.socialMedia < 4) return "2-Week Branded Social Matrix Content";
    if (scores.website < 4) return "Custom Neural-Net Demo Website";
    if (scores.automation > 7) return "14-Day Autonomous AI Agent Trial";
    if (scores.reputation < 5) return "Deep-Dive GBP Algorithm Audit";
    return "Complimentary Tech-Stack Strategy Session"; 
  };

  const exportToPDF = () => {
    import('html2pdf.js').then((html2pdf) => {
      const element = document.getElementById('report-content');
      const opt = {
        margin: 0.5,
        filename: `${leadForm.name}-Target-Profile.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      // Temporarily remove dark mode for PDF print readability
      element.classList.add('print-mode-active');
      html2pdf.default().set(opt).from(element).save().then(() => {
        element.classList.remove('print-mode-active');
      });
    });
  };

  const pushToHubSpot = async () => {
    if (!apiKeys.hubspot) return alert("SYSTEM ERROR: HubSpot uplink missing.");
    try {
      const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKeys.hubspot}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          properties: {
            company: leadForm.name, city: leadForm.location, website: leadForm.website, industry: leadForm.industry,
            deal_tags: reportData.recommendations.map(r => r.service).join(', '),
            notes: `OUTREACH PROTOCOL INITIALIZED:\n\n${emailScripts.hook}`
          }
        })
      });
      if(response.ok) alert("UPLINK SUCCESSFUL: Target acquired in CRM.");
      else alert("UPLINK FAILED: Invalid Auth Token.");
    } catch(err) { alert("UPLINK FAILED: Network error."); }
  };

  const getScoreColor = (score) => {
    if (score < 4) return THEME.red;
    if (score < 8) return THEME.yellow;
    return THEME.green;
  };

  return (
    <div className="flex h-screen bg-black text-gray-200 font-sans overflow-hidden relative selection:bg-[#b026ff] selection:text-white">
      
      {/* --- AMBIENT CYBERPUNK GLOWS & GRID --- */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#00f3ff10_1px,transparent_1px),linear-gradient(to_bottom,#00f3ff10_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20 pointer-events-none"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-[#b026ff] rounded-full mix-blend-screen filter blur-[200px] opacity-15 pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] bg-[#00f3ff] rounded-full mix-blend-screen filter blur-[150px] opacity-15 pointer-events-none"></div>

      {/* --- SIDEBAR (GLASSMORPHISM) --- */}
      <div className="relative z-10 w-72 bg-black/40 backdrop-blur-2xl border-r border-[#00f3ff]/20 flex flex-col shadow-[4px_0_24px_rgba(0,243,255,0.05)]">
        <div className="p-8 border-b border-[#00f3ff]/20">
          <div className="flex items-center space-x-3">
            <Zap size={28} className="text-[#00f3ff] animate-pulse" />
            <h1 className="text-3xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#b026ff]">SCOUT</h1>
          </div>
          <p className="text-[10px] font-mono text-[#00f3ff]/70 mt-2 uppercase tracking-[0.3em]">LNL AI Core // v2.4.0</p>
        </div>
        <nav className="flex-1 p-6 space-y-4">
          <SidebarBtn icon={LayoutDashboard} label="MAIN CONSOLE" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarBtn icon={Target} label="TARGET INTEL" active={activeTab === 'report'} onClick={() => setActiveTab('report')} disabled={!reportData} />
          <SidebarBtn icon={Terminal} label="LOG HISTORY" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
        </nav>
        <div className="p-6 border-t border-[#00f3ff]/20">
          <button onClick={() => setShowSettings(true)} className="flex items-center space-x-3 font-mono text-sm text-gray-500 hover:text-[#00f3ff] transition-all hover:drop-shadow-[0_0_8px_#00f3ff]">
            <Settings size={18} /><span>SYS_CONFIG</span>
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col overflow-y-auto relative z-10">
        
        {/* Settings Modal (Cyber-terminal style) */}
        {showSettings && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#050505] border border-[#b026ff]/50 rounded-lg p-8 w-full max-w-md shadow-[0_0_40px_rgba(176,38,255,0.2)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00f3ff] to-[#b026ff]"></div>
              <h2 className="text-xl font-mono text-[#00f3ff] mb-2 tracking-widest">>> AUTH_TOKENS</h2>
              <p className="text-xs font-mono text-gray-500 mb-6">Local override protocol active. Data encrypted.</p>
              <div className="space-y-5">
                <InputWrapper label="CLAUDE_API_KEY (ANTHROPIC)" value={apiKeys.anthropic} onChange={e => setApiKeys({...apiKeys, anthropic: e.target.value})} type="password" />
                <InputWrapper label="SERPER_DEV_KEY" value={apiKeys.serper} onChange={e => setApiKeys({...apiKeys, serper: e.target.value})} type="password" />
                <InputWrapper label="HUBSPOT_UPLINK (OPTIONAL)" value={apiKeys.hubspot} onChange={e => setApiKeys({...apiKeys, hubspot: e.target.value})} type="password" />
              </div>
              <button onClick={() => setShowSettings(false)} className="mt-8 w-full py-3 bg-[#b026ff]/10 border border-[#b026ff] text-[#b026ff] font-mono tracking-widest hover:bg-[#b026ff] hover:text-black hover:shadow-[0_0_20px_#b026ff] transition-all duration-300">
                INITIATE_SAVE
              </button>
            </div>
          </div>
        )}

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="p-12 max-w-5xl mx-auto w-full flex-1 flex flex-col justify-center">
            <div className="mb-10">
              <h2 className="text-4xl font-black tracking-wider text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">INITIALIZE TARGET</h2>
              <p className="text-sm font-mono text-[#00f3ff] mt-2 tracking-widest">DEPLOYING AUTONOMOUS SCOUT AGENT...</p>
            </div>

            <form onSubmit={handleAnalyze} className="bg-white/[0.02] backdrop-blur-xl rounded-2xl p-10 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
              <div className="grid grid-cols-2 gap-8 mb-8">
                <InputWrapper className="col-span-2 sm:col-span-1" label="TARGET ENTITY (BUSINESS NAME)" value={leadForm.name} onChange={e => setLeadForm({...leadForm, name: e.target.value})} />
                <InputWrapper className="col-span-2 sm:col-span-1" label="GEOLOCATION (CITY, ST)" value={leadForm.location} onChange={e => setLeadForm({...leadForm, location: e.target.value})} />
                <InputWrapper className="col-span-2 sm:col-span-1" label="NODE ADDRESS (URL - OPTIONAL)" value={leadForm.website} onChange={e => setLeadForm({...leadForm, website: e.target.value})} type="url" />
                
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-[#b026ff] mb-2">SECTOR (INDUSTRY)</label>
                  <select className="w-full bg-[#050510] border border-[#00f3ff]/30 rounded p-4 text-[#00f3ff] font-mono focus:border-[#00f3ff] focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] outline-none transition-all appearance-none" value={leadForm.industry} onChange={e => setLeadForm({...leadForm, industry: e.target.value})}>
                    <option>Real Estate</option>
                    <option>Home Services / Trades</option>
                    <option>Medical / MedSpa</option>
                    <option>Legal Services</option>
                    <option>Hospitality</option>
                  </select>
                </div>
              </div>

              {isAnalyzing ? (
                <div className="mt-8 flex flex-col items-center p-8 bg-[#00f3ff]/5 border border-[#00f3ff]/30 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 left-[-100%] w-[200%] h-1 bg-gradient-to-r from-transparent via-[#00f3ff] to-transparent animate-[scan_2s_linear_infinite]"></div>
                  <Loader2 className="animate-spin text-[#00f3ff] mb-4 drop-shadow-[0_0_10px_#00f3ff]" size={40} />
                  <p className="text-[#00f3ff] font-mono text-sm tracking-[0.2em] animate-pulse">{loadingStep}</p>
                </div>
              ) : (
                <button type="submit" className="w-full py-5 bg-[#00f3ff]/10 border border-[#00f3ff] text-[#00f3ff] font-mono text-lg font-bold tracking-[0.3em] rounded hover:bg-[#00f3ff] hover:text-black hover:shadow-[0_0_30px_rgba(0,243,255,0.6)] transition-all duration-300 flex items-center justify-center space-x-3">
                  <Crosshair size={24} /> <span>EXECUTE SCAN</span>
                </button>
              )}
            </form>
          </div>
        )}

        {/* REPORT TAB */}
        {activeTab === 'report' && reportData && (
          <div className="flex-1 flex flex-col h-full bg-transparent">
            {/* Report Header */}
            <div className="bg-black/60 backdrop-blur-xl p-8 border-b border-[#b026ff]/30 flex justify-between items-center shrink-0 shadow-[0_4px_20px_rgba(176,38,255,0.1)]">
              <div>
                <h2 className="text-3xl font-black text-white tracking-wide">{leadForm.name}</h2>
                <p className="text-[#00f3ff] font-mono text-sm tracking-widest mt-1">[{leadForm.location}] // {leadForm.industry}</p>
              </div>
              <div className="flex space-x-4">
                <button onClick={exportToPDF} className="px-5 py-2.5 bg-black/50 border border-[#00f3ff] text-[#00f3ff] font-mono text-sm tracking-widest hover:bg-[#00f3ff] hover:text-black hover:shadow-[0_0_15px_#00f3ff] transition-all flex items-center space-x-2">
                  <Download size={16} /> <span>DECRYPT_PDF</span>
                </button>
                <button onClick={pushToHubSpot} className="px-5 py-2.5 bg-[#b026ff]/20 border border-[#b026ff] text-[#b026ff] font-mono text-sm tracking-widest hover:bg-[#b026ff] hover:text-black hover:shadow-[0_0_15px_#b026ff] transition-all flex items-center space-x-2">
                  <Database size={16} /> <span>SYNC_CRM</span>
                </button>
              </div>
            </div>

            {/* Report Content Area */}
            <div className="flex-1 flex overflow-hidden">
              {/* Report Navigation (Vertical Tabs) */}
              <div className="w-64 bg-black/40 backdrop-blur-md border-r border-white/5 flex flex-col p-4 space-y-2 overflow-y-auto">
                <ReportNavBtn icon={BarChart} label="DIAGNOSTICS" active={reportTab==='overview'} onClick={()=>setReportTab('overview')} />
                <ReportNavBtn icon={Crosshair} label="RIVAL_MATRIX" active={reportTab==='competitors'} onClick={()=>setReportTab('competitors')} />
                <ReportNavBtn icon={Zap} label="UPGRADE_PATH" active={reportTab==='recommendations'} onClick={()=>setReportTab('recommendations')} />
                <ReportNavBtn icon={Terminal} label="COMMS_LINK" active={reportTab==='outreach'} onClick={()=>setReportTab('outreach')} />
              </div>

              {/* Report Detail View */}
              <div id="report-content" className="flex-1 p-10 overflow-y-auto">
                
                {/* Print Branding (Hidden in UI) */}
                <div className="hidden print:block border-b-2 border-black pb-6 mb-8 bg-white text-black">
                  <h1 className="text-4xl font-black">LNL AI NEURAL_NET</h1>
                  <h2 className="text-xl mt-2 font-mono text-gray-600">TARGET ACQUISITION BRIEF: {leadForm.name}</h2>
                </div>

                {reportTab === 'overview' && (
                  <div className="space-y-6 max-w-6xl">
                    <h3 className="text-xl font-mono tracking-[0.2em] text-[#b026ff] border-b border-[#b026ff]/30 pb-3 mb-6">>> VULNERABILITY DIAGNOSTICS</h3>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      <CyberScoreCard title="NODE_INTERFACE (WEB)" icon={Globe} score={reportData.scores.website} details={reportData.insights.website} color={getScoreColor(reportData.scores.website)} />
                      <CyberScoreCard title="ALGORITHM_RANK (SEO/AEO)" icon={Search} score={reportData.scores.seo} details={reportData.insights.seo} color={getScoreColor(reportData.scores.seo)} />
                      <CyberScoreCard title="SOCIAL_MATRIX" icon={Share2} score={reportData.scores.socialMedia} details={reportData.insights.socialMedia} color={getScoreColor(reportData.scores.socialMedia)} />
                      <CyberScoreCard title="PUBLIC_TRUST" icon={Star} score={reportData.scores.reputation} details={reportData.insights.reputation} color={getScoreColor(reportData.scores.reputation)} />
                      <CyberScoreCard title="AUTOMATION_DEFICIT" icon={Cpu} score={reportData.scores.automation} details={reportData.insights.automation} color={getScoreColor(reportData.scores.automation)} />
                    </div>
                  </div>
                )}

                {reportTab === 'competitors' && (
                  <div className="space-y-6 max-w-4xl">
                    <h3 className="text-xl font-mono tracking-[0.2em] text-[#b026ff] border-b border-[#b026ff]/30 pb-3 mb-6">>> RIVAL MATRIX ANALYSIS</h3>
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff003c] rounded-full mix-blend-screen filter blur-[80px] opacity-20"></div>
                      <p className="text-gray-300 mb-8 leading-relaxed font-light text-lg">{reportData.competitorGapText}</p>
                      <h4 className="font-mono text-[#ff003c] mb-5 tracking-widest text-sm">DETECTED THREATS (LOCAL RIVALS):</h4>
                      <ul className="space-y-4">
                        {reportData.competitors.map((comp, idx) => (
                          <li key={idx} className="flex items-center space-x-4 text-white bg-black/60 border border-white/5 p-4 rounded backdrop-blur-sm">
                            <span className="text-[#ff003c] font-mono">0{idx+1}</span>
                            <span className="font-medium tracking-wide">{comp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {reportTab === 'recommendations' && (
                  <div className="space-y-6 max-w-4xl">
                    <h3 className="text-xl font-mono tracking-[0.2em] text-[#b026ff] border-b border-[#b026ff]/30 pb-3 mb-6">>> OPTIMAL UPGRADE VECTOR</h3>
                    
                    {/* Neon Offer Box */}
                    <div className="bg-[#39ff14]/5 border border-[#39ff14]/50 rounded-xl p-8 mb-10 relative overflow-hidden shadow-[0_0_20px_rgba(57,255,20,0.15)]">
                      <div className="absolute top-0 left-0 w-2 h-full bg-[#39ff14] shadow-[0_0_15px_#39ff14]"></div>
                      <div className="flex items-center space-x-3 mb-3 pl-4">
                        <Star className="text-[#39ff14]" size={20} />
                        <h4 className="font-mono text-[#39ff14] uppercase tracking-[0.2em] text-sm">TROJAN DEPLOYMENT OFFER</h4>
                      </div>
                      <p className="text-2xl text-white font-bold pl-4 drop-shadow-md">{reportData.finalOffer}</p>
                      <p className="text-sm text-[#39ff14]/70 mt-3 font-mono pl-4">Deploy this free-value hook in primary comms sequence.</p>
                    </div>

                    <div className="space-y-5">
                      {reportData.recommendations.map((rec, idx) => (
                        <div key={idx} className="bg-white/5 backdrop-blur-md p-6 rounded-lg border border-white/10 flex items-start space-x-5 hover:border-[#00f3ff]/40 transition-colors">
                          <div className="bg-[#00f3ff]/20 px-3 py-1 rounded text-[#00f3ff] font-mono text-lg font-bold border border-[#00f3ff]/30 shadow-[0_0_10px_rgba(0,243,255,0.2)]">0{idx + 1}</div>
                          <div>
                            <h4 className="text-xl font-semibold text-white tracking-wide">{rec.service}</h4>
                            <p className="text-gray-400 text-base mt-2 leading-relaxed">{rec.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {reportTab === 'outreach' && (
                  <div className="space-y-10 max-w-4xl print:text-black">
                    <h3 className="text-xl font-mono tracking-[0.2em] text-[#b026ff] border-b border-[#b026ff]/30 pb-3 mb-6 print:text-black">>> LNL AUTONOMOUS COMMS</h3>
                    
                    <CyberEmailEditor 
                      title="TX_01: INFILTRATION (HOOK)" 
                      value={emailScripts.hook} 
                      onChange={(val) => setEmailScripts({...emailScripts, hook: val})} 
                      color="cyan"
                    />
                    
                    <CyberEmailEditor 
                      title="TX_02: VALUE_INJECT (DAY 04)" 
                      value={emailScripts.followup} 
                      onChange={(val) => setEmailScripts({...emailScripts, followup: val})} 
                      color="purple"
                    />

                    <CyberEmailEditor 
                      title="TX_03: EXTRACTION (DAY 08)" 
                      value={emailScripts.close} 
                      onChange={(val) => setEmailScripts({...emailScripts, close: val})} 
                      color="green"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Inline Keyframes for specific animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan { 0% { transform: translateX(0); } 100% { transform: translateX(100%); } }
        .print-mode-active * { color: #000 !important; background: transparent !important; border-color: #ccc !important; box-shadow: none !important; filter: none !important; }
      `}} />
    </div>
  );
}

// --- CYBERPUNK SUBCOMPONENTS ---

const InputWrapper = ({ label, value, onChange, type="text", className="" }) => (
  <div className={className}>
    <label className="block text-[10px] font-mono uppercase tracking-[0.2em] text-[#b026ff] mb-2">{label}</label>
    <input required type={type} className="w-full bg-[#050510] border border-[#00f3ff]/30 rounded p-4 text-[#00f3ff] font-mono focus:border-[#00f3ff] focus:shadow-[0_0_15px_rgba(0,243,255,0.3)] outline-none transition-all placeholder:text-[#00f3ff]/20" value={value} onChange={onChange} />
  </div>
);

const SidebarBtn = ({ icon: Icon, label, active, onClick, disabled }) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className={`w-full flex items-center space-x-4 px-5 py-4 rounded transition-all font-mono tracking-widest text-sm ${
      disabled ? 'opacity-30 cursor-not-allowed text-gray-500' :
      active ? 'bg-[linear-gradient(90deg,rgba(0,243,255,0.2)_0%,transparent_100%)] border-l-2 border-[#00f3ff] text-[#00f3ff] shadow-[inset_10px_0_20px_rgba(0,243,255,0.05)]' : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
    }`}
  >
    <Icon size={18} /> <span>{label}</span>
  </button>
);

const ReportNavBtn = ({ icon: Icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center space-x-4 px-4 py-4 rounded font-mono text-sm tracking-widest text-left transition-all ${
    active ? 'bg-[#b026ff]/20 text-[#b026ff] border border-[#b026ff]/50 shadow-[0_0_15px_rgba(176,38,255,0.2)]' : 'text-gray-500 hover:text-gray-200 hover:bg-white/5 border border-transparent'
  }`}>
    <Icon size={16} /> <span>{label}</span>
  </button>
);

const CyberScoreCard = ({ title, icon: Icon, score, details, color }) => (
  <div className="bg-white/[0.02] backdrop-blur-xl rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.5)] group relative overflow-hidden">
    <div className="absolute top-0 right-0 w-16 h-16 rounded-full mix-blend-screen filter blur-[40px] opacity-20 transition-all duration-500 group-hover:opacity-40" style={{ backgroundColor: color }}></div>
    <div className="flex justify-between items-start mb-6">
      <div className="flex items-center space-x-3">
        <Icon size={20} className="text-gray-400 group-hover:text-white transition-colors" />
        <h4 className="font-mono text-white tracking-widest text-sm">{title}</h4>
      </div>
      <div className="flex items-end space-x-1 font-mono">
        <span className="text-3xl font-black drop-shadow-[0_0_8px_currentColor]" style={{ color }}>{score}</span>
        <span className="text-gray-600 mb-1">/10</span>
      </div>
    </div>
    <div className="w-full bg-black border border-white/10 rounded-full h-2 mb-5 relative overflow-hidden">
      <div className="h-full relative shadow-[0_0_10px_currentColor]" style={{ width: `${score * 10}%`, backgroundColor: color }}>
        <div className="absolute inset-0 bg-white/30 w-full h-full animate-pulse"></div>
      </div>
    </div>
    <p className="text-sm text-gray-400 leading-relaxed font-light">{details}</p>
  </div>
);

const CyberEmailEditor = ({ title, value, onChange, color }) => {
  const colorMap = {
    cyan: 'border-[#00f3ff]/30 text-[#00f3ff]',
    purple: 'border-[#b026ff]/30 text-[#b026ff]',
    green: 'border-[#39ff14]/30 text-[#39ff14]',
  };
  
  return (
    <div className="bg-black/60 backdrop-blur-lg border border-white/10 rounded-xl overflow-hidden print:border-none print:bg-transparent shadow-[0_0_30px_rgba(0,0,0,0.4)]">
      <div className="bg-[#050510] px-5 py-4 border-b border-white/10 flex items-center space-x-3 print:hidden">
        <Terminal size={16} className={colorMap[color].split(' ')[1]} />
        <h4 className={`font-mono text-sm tracking-[0.2em] ${colorMap[color].split(' ')[1]}`}>{title}</h4>
      </div>
      <textarea 
        className="w-full h-56 bg-transparent p-6 text-gray-300 outline-none resize-y print:h-auto print:text-black font-sans leading-relaxed selection:bg-gray-700 focus:bg-white/[0.02] transition-colors"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

// --- MOCK API DATA SERVICES ---
async function fetchSerperData(name, location) { return { query: `${name} in ${location}`, competitors:['Local Rival Alpha', 'Prime Node Beta', 'Legacy Corp Gamma'] }; }

async function fetchAnthropicAnalysis(lead, serperData, apiKey) {
  const MODEL = "claude-sonnet-4-20250514";
  const systemPrompt = `You are the lead intelligence engine for "Scout", an AI marketing consultant tool used by Lainie, founder of LNL AI Agency. LNL AI Agency tone is confident, consultative, and luxury-adjacent (never salesy, never desperate). 
REQUIRED JSON FORMAT:
{
  "scores": { "website": 1-10, "seo": 1-10, "socialMedia": 1-10, "reputation": 1-10, "automation": 1-10 },
  "insights": { "website": "...", "seo": "...", "socialMedia": "...", "reputation": "...", "automation": "..." },
  "competitorGapText": "Actionable text explaining where they fall behind top 3 competitors.",
  "competitors":["Comp 1", "Comp 2", "Comp 3"],
  "recommendations":[ { "service": "Service Name", "reason": "Specific 1-sentence why" } ],
  "emails": { "hook": "Subject... Body...", "followup": "Body...", "close": "Body..." }
}`;
  const userPrompt = `Analyze: ${lead.name}, ${lead.location}, ${lead.website || 'N/A'}, ${lead.industry}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json', 'anthropic-dangerously-allow-browser': 'true' },
      body: JSON.stringify({ model: MODEL, max_tokens: 3000, system: systemPrompt, messages: [{ role: 'user', content: userPrompt }] })
    });
    if (!response.ok) throw new Error("Anthropic API Error");
    const data = await response.json();
    const jsonStr = data.content[0].text.substring(data.content[0].text.indexOf('{'), data.content[0].text.lastIndexOf('}') + 1);
    return JSON.parse(jsonStr);
  } catch (error) {
    return {
      scores: { website: 4, seo: 3, socialMedia: 6, reputation: 5, automation: 8 },
      insights: {
        website: "Node latency detected. Mobile interface fractured. No clear data-capture portal.",
        seo: "Algorithm invisibility. Local search vectors dominated by rival entities.",
        socialMedia: "Signal output sporadic. Visual aesthetic misaligned with core brand parameters.",
        reputation: "Public trust metrics vulnerable. Active negative feedback loops ignored.",
        automation: `High manual load for ${lead.industry} operations. Critical need for autonomous agent deployment.`
      },
      competitorGapText: `Rival nodes in ${lead.location} are leveraging instant AI response protocols. ${lead.name} is bleeding traffic due to analog processing delays.`,
      competitors:[`Cyber ${lead.industry} Syndicate`, `Neon ${lead.location} Group`, "Global Standard Co."],
      recommendations:[
        { service: "AI Agent Deployment", reason: "Automate lead qualification natively, running 24/7." },
        { service: "Neural SEO Grid", reason: "Re-establish local search dominance across AI platforms." },
        { service: "Web Node Upgrade", reason: "Modernize interface to reduce bounce rate friction." }
      ],
      emails: {
        hook: `Subject: Quick thought on your local visibility\n\nHi there,\n\nLainie here from LNL AI Agency. I was analyzing the local market in ${lead.location} and noticed ${lead.name} is missing from AI search engine results...\n\n[Free Offer Demo Link attached]`,
        followup: `Hi again,\n\nFollowing up on my previous note. Your rivals are heavily leveraging automated booking. Let's fix that.`,
        close: `Final note. I know you're busy running ${lead.name}. Let me know if you want to chat later.\n\nBest,\nLainie`
      }
    };
  }
}
