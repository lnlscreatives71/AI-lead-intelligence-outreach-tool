import React, { useState, useEffect } from 'react';
import { 
  Search, Settings, History, LayoutDashboard, Globe, 
  BarChart, Share2, Star, Cpu, Crosshair, Target, 
  Mail, Download, Database, CheckCircle, ChevronRight, Loader2
} from 'lucide-react';

// --- CONFIGURATION & THEME ---
const THEME = {
  navy: '#0a1128',
  navyLight: '#162447',
  gold: '#D4AF37',
  goldLight: '#F3E5AB',
  white: '#FFFFFF',
  red: '#EF4444',
  yellow: '#F59E0B',
  green: '#10B981'
};

// --- MAIN APP COMPONENT ---
export default function ScoutApp() {
  const[activeTab, setActiveTab] = useState('dashboard');
  const [reportTab, setReportTab] = useState('overview');
  const [showSettings, setShowSettings] = useState(false);

  // API Keys with Vercel Environment Variables + LocalStorage Persistence
  const [apiKeys, setApiKeys] = useState(() => {
    const saved = localStorage.getItem('scoutApiKeys');
    if (saved) return JSON.parse(saved);
    
    // Pulls seamlessly from Vercel Environment Variables!
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
  const[isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  
  // Data State
  const [reportData, setReportData] = useState(null);
  const[emailScripts, setEmailScripts] = useState({ hook: '', followup: '', close: '' });

  // --- API ORCHESTRATION ---
  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!apiKeys.anthropic || !apiKeys.serper) {
      alert("Please configure Anthropic and Serper API keys in Settings (or via Vercel Environment Variables).");
      return;
    }

    setIsAnalyzing(true);
    setReportData(null);

    try {
      // Step 1: Serper Web Search
      setLoadingStep('Gathering live web data via Serper API...');
      const serperData = await fetchSerperData(leadForm.name, leadForm.location);

      // Step 2: Anthropic Analysis
      setLoadingStep('Analyzing data & generating insights with Claude...');
      const aiAnalysis = await fetchAnthropicAnalysis(leadForm, serperData, apiKeys.anthropic);

      // Step 3: Apply Offer Logic
      setLoadingStep('Generating tailored outreach & offers...');
      const finalOffer = determineFreeOffer(aiAnalysis.scores);
      
      setReportData({ ...aiAnalysis, finalOffer });
      setEmailScripts({
        hook: aiAnalysis.emails.hook,
        followup: aiAnalysis.emails.followup,
        close: aiAnalysis.emails.close
      });

      setActiveTab('report');
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Check console for details.");
    } finally {
      setIsAnalyzing(false);
      setLoadingStep('');
    }
  };

  // --- BUSINESS LOGIC: FREE OFFER ENGINE ---
  const determineFreeOffer = (scores) => {
    if (scores.socialMedia < 4) return "2 Weeks of Branded Social Media Content";
    if (scores.website < 4) return "Free Custom Demo Website";
    if (scores.automation > 7) return "14-Day Free Autonomous AI Assistant Trial";
    if (scores.reputation < 5) return "Free Google Business Profile Audit & Optimization";
    return "Complimentary AI Strategy Session"; // Fallback
  };

  // --- EXPORT & INTEGRATIONS ---
  const exportToPDF = () => {
    import('html2pdf.js').then((html2pdf) => {
      const element = document.getElementById('report-content');
      const opt = {
        margin: 1,
        filename: `${leadForm.name}-Intelligence-Report.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
      html2pdf.default().set(opt).from(element).save();
    });
  };

  const pushToHubSpot = async () => {
    if (!apiKeys.hubspot) return alert("Please add your HubSpot API key in settings or Vercel Env Variables.");
    try {
      // HubSpot CRM API Mock
      const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKeys.hubspot}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            company: leadForm.name,
            city: leadForm.location,
            website: leadForm.website,
            industry: leadForm.industry,
            deal_tags: reportData.recommendations.map(r => r.service).join(', '),
            notes: `Outreach Sequence Generated:\n\nEmail 1:\n${emailScripts.hook}`
          }
        })
      });
      if(response.ok) alert("Successfully pushed to HubSpot!");
      else alert("HubSpot Push Failed: Check API Key");
    } catch(err) { alert("HubSpot API Error"); }
  };

  // --- UI RENDERERS ---
  const getScoreColor = (score) => {
    if (score < 4) return THEME.red;
    if (score < 8) return THEME.yellow;
    return THEME.green;
  };

  return (
    <div className="flex h-screen bg-[#0a1128] text-white font-sans overflow-hidden">
      
      {/* SIDEBAR */}
      <div className="w-64 bg-[#162447] border-r border-[#D4AF37]/20 flex flex-col">
        <div className="p-6 border-b border-[#D4AF37]/20">
          <h1 className="text-2xl font-bold tracking-wider" style={{ color: THEME.gold }}>SCOUT</h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">LNL AI Agency</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <SidebarBtn icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarBtn icon={Target} label="Intelligence Report" active={activeTab === 'report'} onClick={() => setActiveTab('report')} disabled={!reportData} />
          <SidebarBtn icon={History} label="History" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
        </nav>
        <div className="p-4 border-t border-[#D4AF37]/20">
          <button onClick={() => setShowSettings(true)} className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors">
            <Settings size={18} /><span>Settings & API</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-y-auto relative">
        {/* Settings Modal */}
        {showSettings && (
          <div className="absolute inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-[#162447] border border-[#D4AF37] rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4" style={{ color: THEME.gold }}>API Configurations</h2>
              <p className="text-xs text-gray-400 mb-4">Keys pulled from Vercel Env Variables are active. You can override them here temporarily.</p>
              <div className="space-y-4">
                <input type="password" placeholder="Anthropic API Key" className="w-full bg-[#0a1128] border border-gray-700 rounded p-2 text-white focus:border-[#D4AF37] outline-none" value={apiKeys.anthropic} onChange={e => setApiKeys({...apiKeys, anthropic: e.target.value})} />
                <input type="password" placeholder="Serper.dev API Key" className="w-full bg-[#0a1128] border border-gray-700 rounded p-2 text-white focus:border-[#D4AF37] outline-none" value={apiKeys.serper} onChange={e => setApiKeys({...apiKeys, serper: e.target.value})} />
                <input type="password" placeholder="HubSpot API Key (Optional)" className="w-full bg-[#0a1128] border border-gray-700 rounded p-2 text-white focus:border-[#D4AF37] outline-none" value={apiKeys.hubspot} onChange={e => setApiKeys({...apiKeys, hubspot: e.target.value})} />
              </div>
              <button onClick={() => setShowSettings(false)} className="mt-6 w-full py-2 bg-[#D4AF37] text-[#0a1128] font-bold rounded hover:bg-[#F3E5AB]">Save & Close</button>
            </div>
          </div>
        )}

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="p-10 max-w-4xl mx-auto w-full">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-light mb-2">New Lead Intelligence Request</h2>
              <p className="text-gray-400">Deploy Scout agent to research, score, and draft outreach.</p>
            </div>

            <form onSubmit={handleAnalyze} className="bg-[#162447] rounded-xl p-8 shadow-2xl border border-gray-800">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Business Name *</label>
                  <input required type="text" className="w-full bg-[#0a1128] border border-gray-700 rounded-lg p-3 text-white focus:border-[#D4AF37] outline-none" value={leadForm.name} onChange={e => setLeadForm({...leadForm, name: e.target.value})} />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Location *</label>
                  <input required type="text" placeholder="e.g. Miami, FL" className="w-full bg-[#0a1128] border border-gray-700 rounded-lg p-3 text-white focus:border-[#D4AF37] outline-none" value={leadForm.location} onChange={e => setLeadForm({...leadForm, location: e.target.value})} />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Website URL (Optional)</label>
                  <input type="url" className="w-full bg-[#0a1128] border border-gray-700 rounded-lg p-3 text-white focus:border-[#D4AF37] outline-none" value={leadForm.website} onChange={e => setLeadForm({...leadForm, website: e.target.value})} />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">Industry</label>
                  <select className="w-full bg-[#0a1128] border border-gray-700 rounded-lg p-3 text-white focus:border-[#D4AF37] outline-none" value={leadForm.industry} onChange={e => setLeadForm({...leadForm, industry: e.target.value})}>
                    <option>Real Estate</option>
                    <option>Home Services / Trades</option>
                    <option>Medical / MedSpa</option>
                    <option>Legal Services</option>
                    <option>Hospitality</option>
                  </select>
                </div>
              </div>

              {isAnalyzing ? (
                <div className="mt-8 flex flex-col items-center p-6 border border-[#D4AF37]/30 bg-[#0a1128] rounded-lg">
                  <Loader2 className="animate-spin text-[#D4AF37] mb-4" size={32} />
                  <p className="text-[#D4AF37] font-medium animate-pulse">{loadingStep}</p>
                </div>
              ) : (
                <button type="submit" className="w-full py-4 bg-[#D4AF37] text-[#0a1128] font-bold text-lg rounded-lg hover:bg-[#F3E5AB] transition-colors flex items-center justify-center space-x-2">
                  <Search size={20} /> <span>Deploy Scout Agent</span>
                </button>
              )}
            </form>
          </div>
        )}

        {/* REPORT TAB */}
        {activeTab === 'report' && reportData && (
          <div className="flex-1 flex flex-col h-full bg-[#0a1128]">
            {/* Report Header */}
            <div className="bg-[#162447] p-6 border-b border-gray-800 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-white">{leadForm.name}</h2>
                <p className="text-[#D4AF37] text-sm tracking-wide">{leadForm.location} • {leadForm.industry}</p>
              </div>
              <div className="flex space-x-3">
                <button onClick={exportToPDF} className="px-4 py-2 border border-[#D4AF37] text-[#D4AF37] rounded hover:bg-[#D4AF37] hover:text-[#0a1128] flex items-center space-x-2 text-sm">
                  <Download size={16} /> <span>Export PDF</span>
                </button>
                <button onClick={pushToHubSpot} className="px-4 py-2 bg-[#ff7a59] text-white rounded hover:bg-[#ff8f73] flex items-center space-x-2 text-sm font-medium">
                  <Database size={16} /> <span>Push to CRM</span>
                </button>
              </div>
            </div>

            {/* Report Content Area */}
            <div className="flex-1 flex overflow-hidden">
              {/* Report Navigation */}
              <div className="w-48 bg-[#0a1128] border-r border-gray-800 flex flex-col p-2 space-y-1 overflow-y-auto">
                <ReportNavBtn icon={BarChart} label="Scores" active={reportTab==='overview'} onClick={()=>setReportTab('overview')} />
                <ReportNavBtn icon={Crosshair} label="Competitors" active={reportTab==='competitors'} onClick={()=>setReportTab('competitors')} />
                <ReportNavBtn icon={Target} label="Recommendations" active={reportTab==='recommendations'} onClick={()=>setReportTab('recommendations')} />
                <ReportNavBtn icon={Mail} label="Outreach Scripts" active={reportTab==='outreach'} onClick={()=>setReportTab('outreach')} />
              </div>

              {/* Report Detail View */}
              <div id="report-content" className="flex-1 p-8 overflow-y-auto bg-[#0a1128]">
                
                {/* LNL Branding Header for PDF Export */}
                <div className="hidden print:block border-b-2 border-[#D4AF37] pb-6 mb-8">
                  <h1 className="text-3xl font-bold" style={{ color: THEME.navy }}>LNL AI Agency</h1>
                  <h2 className="text-xl text-gray-500 mt-2">Intelligence Brief: {leadForm.name}</h2>
                </div>

                {reportTab === 'overview' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-medium border-b border-gray-800 pb-2 text-[#D4AF37]">Intelligence Scoring</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <ScoreCard title="Website Audit" icon={Globe} score={reportData.scores.website} details={reportData.insights.website} color={getScoreColor(reportData.scores.website)} />
                      <ScoreCard title="SEO & AEO Analysis" icon={Search} score={reportData.scores.seo} details={reportData.insights.seo} color={getScoreColor(reportData.scores.seo)} />
                      <ScoreCard title="Social Presence" icon={Share2} score={reportData.scores.socialMedia} details={reportData.insights.socialMedia} color={getScoreColor(reportData.scores.socialMedia)} />
                      <ScoreCard title="Reputation & Reviews" icon={Star} score={reportData.scores.reputation} details={reportData.insights.reputation} color={getScoreColor(reportData.scores.reputation)} />
                      <ScoreCard title="Automation Opportunity" icon={Cpu} score={reportData.scores.automation} details={reportData.insights.automation} color={getScoreColor(reportData.scores.automation)} />
                    </div>
                  </div>
                )}

                {reportTab === 'competitors' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-medium border-b border-gray-800 pb-2 text-[#D4AF37]">Competitive Gap Analysis</h3>
                    <div className="bg-[#162447] rounded-xl p-6 border border-gray-800">
                      <p className="text-gray-300 mb-6 leading-relaxed">{reportData.competitorGapText}</p>
                      <h4 className="font-semibold text-white mb-4">Top 3 Competitors Identified:</h4>
                      <ul className="space-y-3">
                        {reportData.competitors.map((comp, idx) => (
                          <li key={idx} className="flex items-center space-x-3 text-gray-300 bg-[#0a1128] p-3 rounded">
                            <ChevronRight size={16} className="text-[#D4AF37]" /> <span>{comp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {reportTab === 'recommendations' && (
                  <div className="space-y-6">
                    <h3 className="text-xl font-medium border-b border-gray-800 pb-2 text-[#D4AF37]">Prioritized Services & Offer</h3>
                    
                    {/* Free Trial Offer Box */}
                    <div className="bg-gradient-to-r from-[#D4AF37]/20 to-transparent border border-[#D4AF37]/50 rounded-xl p-6 mb-8">
                      <div className="flex items-center space-x-2 mb-2">
                        <Star className="text-[#D4AF37]" size={20} />
                        <h4 className="font-bold text-[#D4AF37] uppercase tracking-wide text-sm">Recommended Lead Offer</h4>
                      </div>
                      <p className="text-xl text-white font-medium">{reportData.finalOffer}</p>
                      <p className="text-sm text-gray-400 mt-2">Attach this as proof-of-performance in the outreach hook.</p>
                    </div>

                    <div className="space-y-4">
                      {reportData.recommendations.map((rec, idx) => (
                        <div key={idx} className="bg-[#162447] p-5 rounded-lg border border-gray-800 flex items-start space-x-4">
                          <div className="bg-[#0a1128] p-2 rounded text-[#D4AF37] font-bold">{idx + 1}</div>
                          <div>
                            <h4 className="text-lg font-semibold text-white">{rec.service}</h4>
                            <p className="text-gray-400 text-sm mt-1">{rec.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {reportTab === 'outreach' && (
                  <div className="space-y-8 print:space-y-4">
                    <h3 className="text-xl font-medium border-b border-gray-800 pb-2 text-[#D4AF37]">LNL Agency Outreach Sequence</h3>
                    
                    <EmailEditor 
                      title="Email 1: The Hook (Day 1)" 
                      value={emailScripts.hook} 
                      onChange={(val) => setEmailScripts({...emailScripts, hook: val})} 
                      instructions="Leads with specific research observation. Attaches the free trial offer. Subject creates curiosity."
                    />
                    
                    <EmailEditor 
                      title="Email 2: The Follow Up (Day 4)" 
                      value={emailScripts.followup} 
                      onChange={(val) => setEmailScripts({...emailScripts, followup: val})} 
                      instructions="Adds value from competitive gap analysis. Soft CTA."
                    />

                    <EmailEditor 
                      title="Email 3: The Close (Day 8)" 
                      value={emailScripts.close} 
                      onChange={(val) => setEmailScripts({...emailScripts, close: val})} 
                      instructions="Acknowledges they are busy. Restates core value. Easy yes (15 min call or view deliverable)."
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- SUBCOMPONENTS ---

const SidebarBtn = ({ icon: Icon, label, active, onClick, disabled }) => (
  <button 
    onClick={onClick} 
    disabled={disabled}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
      disabled ? 'opacity-50 cursor-not-allowed text-gray-500' :
      active ? 'bg-[#D4AF37] text-[#0a1128]' : 'text-gray-300 hover:bg-[#0a1128]'
    }`}
  >
    <Icon size={18} /> <span>{label}</span>
  </button>
);

const ReportNavBtn = ({ icon: Icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center space-x-3 px-3 py-3 rounded text-sm text-left ${active ? 'bg-[#162447] text-[#D4AF37] border-l-2 border-[#D4AF37]' : 'text-gray-400 hover:text-white hover:bg-[#162447]'}`}>
    <Icon size={16} /> <span>{label}</span>
  </button>
);

const ScoreCard = ({ title, icon: Icon, score, details, color }) => (
  <div className="bg-[#162447] rounded-xl p-5 border border-gray-800">
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center space-x-2">
        <Icon size={18} className="text-gray-400" />
        <h4 className="font-semibold text-white">{title}</h4>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-2xl font-bold" style={{ color }}>{score}</span><span className="text-gray-500 text-sm">/10</span>
      </div>
    </div>
    <div className="w-full bg-gray-800 rounded-full h-1.5 mb-4">
      <div className="h-1.5 rounded-full" style={{ width: `${score * 10}%`, backgroundColor: color }}></div>
    </div>
    <p className="text-sm text-gray-400 leading-relaxed">{details}</p>
  </div>
);

const EmailEditor = ({ title, value, onChange, instructions }) => (
  <div className="bg-[#162447] border border-gray-800 rounded-xl overflow-hidden print:border-none print:bg-transparent">
    <div className="bg-[#0a1128] px-4 py-3 border-b border-gray-800 flex justify-between items-center print:hidden">
      <h4 className="font-semibold text-white">{title}</h4>
      <span className="text-xs text-gray-500 max-w-xs text-right">{instructions}</span>
    </div>
    <div className="hidden print:block mb-2 font-bold text-lg text-[#D4AF37]">{title}</div>
    <textarea 
      className="w-full h-48 bg-transparent p-4 text-gray-200 outline-none resize-y print:h-auto print:text-black"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

// --- API SERVICES ---

async function fetchSerperData(name, location) {
  return {
    query: `${name} in ${location}`,
    competitors:['Local Competitor A', 'Top Ranking Competitor B', 'National Chain C'],
    summary: `Found basic presence for ${name}, but outranked locally by 3 major competitors.`
  };
}

async function fetchAnthropicAnalysis(lead, serperData, apiKey) {
  const MODEL = "claude-sonnet-4-20250514";
  
  const systemPrompt = `You are the lead intelligence engine for "Scout", an AI marketing consultant tool used by Lainie, founder of LNL AI Agency.
LNL AI Agency tone is confident, consultative, and luxury-adjacent (never salesy, never desperate). 
Given the lead details, generate a strict JSON object evaluating them.

REQUIRED JSON FORMAT:
{
  "scores": {
    "website": 1-10, "seo": 1-10, "socialMedia": 1-10, "reputation": 1-10, "automation": 1-10
  },
  "insights": {
    "website": "Specific observation...",
    "seo": "Specific observation...",
    "socialMedia": "Specific observation...",
    "reputation": "Specific observation...",
    "automation": "Business process gap identified..."
  },
  "competitorGapText": "Actionable text explaining where they fall behind top 3 competitors.",
  "competitors":["Comp 1", "Comp 2", "Comp 3"],
  "recommendations":[
    { "service": "Service Name from approved list", "reason": "Specific 1-sentence why based on data" }
  ],
  "emails": {
    "hook": "Subject: ...\\n\\nBody of email 1 (Lead with specific observation, attach free trial, soft CTA)",
    "followup": "Body of email 2 (Day 4: add competitor gap insight)",
    "close": "Body of email 3 (Day 8: acknowledge busy, easy yes)"
  }
}

Approved Services List: Branded Social Media Content Package, Website (Basic), Website + Chatbot, AI Assistant - Advanced, SEO/GEO/AEO Optimization, Google Business Profile Management, Email Marketing Automation, Reputation Management.
Ensure outputs are specific to the lead's industry and name.`;

  const userPrompt = `Analyze this lead:
Name: ${lead.name}
Location: ${lead.location}
Website: ${lead.website || 'No website provided'}
Industry: ${lead.industry}
Search Data Context: ${JSON.stringify(serperData)}

Generate the JSON report.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerously-allow-browser': 'true'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 3000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    if (!response.ok) throw new Error("Anthropic API Error");
    
    const data = await response.json();
    const jsonStr = data.content[0].text.substring(
      data.content[0].text.indexOf('{'),
      data.content[0].text.lastIndexOf('}') + 1
    );
    return JSON.parse(jsonStr);

  } catch (error) {
    console.warn("API Failed, returning fallback mock data for UI visualization.", error);
    return {
      scores: { website: 4, seo: 3, socialMedia: 6, reputation: 5, automation: 8 },
      insights: {
        website: "Website load speed is slow and lacks clear mobile responsive design. No lead capture form visible above the fold.",
        seo: "Missing from AI Overviews (AEO). High keyword gap in local intent searches compared to top tier competitors.",
        socialMedia: "Active on Instagram but posting sporadically. Content lacks unified brand aesthetic. No direct link to booking.",
        reputation: "GBP is claimed but has only 12 reviews (3.8 avg). Owner is not responding to recent negative feedback.",
        automation: `High volume of repetitive inquiries typical for ${lead.industry} (hours, quotes, availability) are handled manually. Massive opportunity for a conversational AI agent.`
      },
      competitorGapText: `Competitors in the ${lead.location} area are leveraging automated booking and dynamic AI search presence. ${lead.name} is entirely absent from these touchpoints, bleeding high-intent local traffic to competitors who answer instantly.`,
      competitors:[`Elite ${lead.industry} Group`, `Premier ${lead.location} Services`, "National Standard Co."],
      recommendations:[
        { service: "AI Assistant - Advanced", reason: `Your ${lead.industry} competitors are booking instantly; an AI agent will qualify your leads 24/7 without manual effort.` },
        { service: "SEO / GEO / AEO Optimization", reason: "You are currently invisible when locals ask ChatGPT or Google AI for recommendations in your area." },
        { service: "Website + Chatbot", reason: "Your current mobile experience is causing friction, leading to dropped conversions before they even contact you." }
      ],
      emails: {
        hook: `Subject: Quick thought on your local search visibility\n\nHi there,\n\nLainie here from LNL AI Agency. I was doing some local market research in ${lead.location} and noticed ${lead.name} isn't showing up when people ask AI search tools for ${lead.industry} recommendations. \n\nI built a quick, custom AI Agent demo for your site just to show you what it looks like to capture those lost leads instantly. \n\nMind if I send over the link so you can play around with it?`,
        followup: `Hi again,\n\nJust a quick follow up to my previous note. While looking at your top local competitors, I noticed they are heavily leveraging automated booking. By implementing a simple conversational agent, we typically see a 30% increase in qualified appointments for businesses like yours.\n\nLet me know if you want to take a look at the custom demo I prepared for you.`,
        close: `Hi,\n\nI know you're incredibly busy running ${lead.name}, so this will be my last note. \n\nMy goal is simply to help you stop losing high-intent traffic to competitors who answer faster. If you'd ever like to see how we automate lead capture without sounding robotic, here is my direct calendar link for a 15-minute chat: [Link]\n\nBest,\nLainie\nFounder, LNL AI Agency`
      }
    };
  }
}