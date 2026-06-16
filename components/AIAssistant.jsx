import { useState, useRef, useEffect, useCallback } from 'react';
import { centralSchemes, stateSchemes } from '../data/schemes';
import { centralExams, stateExams } from '../data/exams';
import { centralScholarships, stateScholarships } from '../data/scholarships';
import { centralTenders, stateTenders } from '../data/tenders';

// ── Build knowledge base ────────────────────────────────────
function buildKB() {
  const allSchemes  = [...centralSchemes,      ...Object.values(stateSchemes).flat()];
  const allExams    = [...centralExams,         ...Object.values(stateExams).flat()];
  const allSchols   = [...centralScholarships,  ...Object.values(stateScholarships).flat()];
  const allTenders  = [...centralTenders,       ...Object.values(stateTenders).flat()];

  return { allSchemes, allExams, allSchols, allTenders };
}

// ── AI Response Engine ──────────────────────────────────────
function getAIResponse(question) {
  const q = question.toLowerCase().trim();
  const { allSchemes, allExams, allSchols, allTenders } = buildKB();

  // ── Greetings ──
  if (/^(hello|hi|hey|namaste|namaskar|helo|helllo)/.test(q)) {
    return `Hello! 👋 I'm your Government Services AI Assistant. I can help you with:\n\n• **Government Schemes** (Jubo Shakti, Kanyashree, PM Awas etc.)\n• **Competitive Exams** (UPSC, WBCS, SSC, Banking etc.)\n• **Scholarships** (SVMCM, OASIS, PM Scholarship etc.)\n• **Tenders** (Construction, Water Supply etc.)\n\nJust ask me anything! For example: "What is Jubo Shakti?" or "How to apply for WBCS?"`;
  }

  // ── How to use the portal ──
  if (/how.*use|how.*work|kiv[a-z]*be|koro|guide|help.*portal/.test(q)) {
    return `📱 **How to use this portal:**\n\n1. **Register** → Click "Registration" on login page → fill your profile\n2. **Login** → Click "Public" on login page → enter mobile & password\n3. **Browse Schemes** → Go to State Schemes → select your state → apply\n4. **Check Status** → Use "Track Application" with your Reference Number\n5. **Exams** → Go to Exams page → Central or State-wise exams\n\n💡 Once registered, all forms auto-fill from your profile!`;
  }

  // ── Track application ──
  if (/track|status|reference|ref.*no|application.*status|check.*appli/.test(q)) {
    return `🔍 **Track Your Application:**\n\nYou can check your application status in two ways:\n\n1. **From Login Page** → Click "Track Application" card → Select State → Select Scheme → Enter Reference Number\n\n2. **From State Page** → Go to your state page → Click "Track Application" tab → Enter your Reference Number (starts with GOV, e.g. GOV58102263)\n\nThe status shows: Application Received → Under Review → Documents Pending → Approved / Rejected`;
  }

  // ── Search in all items ──
  const allItems = [
    ...allSchemes.map(s => ({...s, type:'Scheme'})),
    ...allExams.map(e => ({...e, type:'Exam'})),
    ...allSchols.map(s => ({...s, type:'Scholarship'})),
    ...allTenders.map(t => ({...t, type:'Tender'})),
  ];

  // Find matching item
  const match = allItems.find(item => {
    const name = (item.name || '').toLowerCase();
    const words = name.split(/[\s()]+/).filter(w => w.length > 3);
    return words.some(w => q.includes(w)) ||
      name.split(' ').slice(0,2).join(' ').split('').filter(c=>c!==' ').join('').toLowerCase().includes(q.replace(/\s/g,'').slice(0,6));
  });

  if (match) {
    const docs = Array.isArray(match.documents) ? match.documents.join(', ') : (match.documents || 'N/A');
    const fields = match.formFields?.length || 0;

    if (match.type === 'Tender') {
      return `📋 **${match.name}**\n\n🏢 **Department:** ${match.department || 'N/A'}\n📦 **Category:** ${match.category}\n💰 **Estimated Value:** ${match.estimatedValue || 'N/A'}\n⏰ **Bid Deadline:** ${match.bidDeadline || 'N/A'}\n📋 **Tender No.:** ${match.tenderNo || 'N/A'}\n\n👥 **Eligibility:** ${match.eligibility || 'N/A'}\n\n📝 **Work:** ${match.workDescription || 'N/A'}\n\n📎 **Required Documents:** ${docs}\n\n*To apply: Go to your State page → Tenders tab → Find this tender → Apply*`;
    }

    if (match.type === 'Exam') {
      return `📝 **${match.name}**\n\n🏛️ **Conducted By:** ${match.conductedBy || 'N/A'}\n🏷️ **Category:** ${match.category}\n💼 **Posts:** ${match.benefit || match.posts || 'N/A'}\n\n👥 **Eligibility:** ${match.eligibility}\n💰 **Application Fee:** ${match.applicationFee || 'N/A'}\n📅 **Exam Date:** ${match.nextExam || 'N/A'}\n⏰ **Apply By:** ${match.applicationDeadline || 'N/A'}\n\n📋 **Form has ${fields} fields**\n\n*To apply: Go to Exams page → Find this exam → Apply Now*`;
    }

    if (match.type === 'Scholarship') {
      return `🎓 **${match.name}**\n\n🏛️ **Ministry:** ${match.ministry || 'N/A'}\n🏷️ **Category:** ${match.category}\n💰 **Benefit:** ${match.benefit}\n\n👥 **Eligibility:** ${match.eligibility}\n📊 **Min Marks:** ${match.minMarks ? match.minMarks + '%' : 'N/A'}\n💵 **Income Limit:** ${match.incomeLimit ? '₹' + parseInt(match.incomeLimit).toLocaleString('en-IN') + '/year' : 'N/A'}\n\n📎 **Documents:** ${docs}\n📋 **Form has ${fields} fields**\n\n*To apply: Go to State page → Scholarships tab → Find & Apply*`;
    }

    // Scheme
    return `🏛️ **${match.name}**${match.nameBengali ? `\n*(${match.nameBengali})*` : ''}\n\n🏛️ **Ministry:** ${match.ministry || 'N/A'}\n🏷️ **Category:** ${match.category}\n✅ **Benefit:** ${match.benefit}\n\n👥 **Eligibility:** ${match.eligibility}\n\n📎 **Documents Required:**\n${Array.isArray(match.documents) ? match.documents.map(d=>'• '+d).join('\n') : (match.documents || 'N/A')}\n\n📋 **Form has ${fields} fields**\n\n*To apply: Go to State page → Find this scheme → Apply Now*`;
  }

  // ── Eligibility ──
  if (/eligib|who can|apply|qualify|criteria/.test(q)) {
    return `📋 **General Eligibility Tips:**\n\n• **Age-based schemes:** Check your age in the eligibility criteria\n• **Gender-based:** Some schemes are only for women (Annapurna Bhandar, Kanyashree)\n• **Income-based:** Many schemes require family income below a threshold\n• **Occupation:** Farmer-only schemes (PM Kisan, Krishak Bandhu)\n• **Employment status:** Jubo Shakti requires you to be unemployed\n\n💡 Your eligibility is **automatically checked** from your profile. Go to Profile page to see which schemes you qualify for!`;
  }

  // ── Documents ──
  if (/document|paper|certificate|id proof|aadhaar|pan card/.test(q)) {
    return `📎 **Common Documents Required:**\n\n• **Aadhaar Card** — mandatory for most schemes\n• **PAN Card** — for employment-linked schemes\n• **Bank Passbook** — for Direct Benefit Transfer (DBT)\n• **Income Certificate** — for need-based schemes\n• **Caste Certificate** — for SC/ST/OBC schemes\n• **Land Records** — for farmer schemes\n• **Birth Certificate** — for age verification\n• **School/College Certificate** — for scholarships\n\n💡 Keep scanned copies ready (PDF/JPG, max 5MB each)`;
  }

  // ── Jubo Shakti / unemployment ──
  if (/jubo|unemploy|bekar|youth/.test(q)) {
    return `👨‍💼 **Jubo Shakti (যুব শক্তি)**\n\n💰 **Benefit:** ₹3,000/month\n🏛️ **By:** Labour Department, Govt. of West Bengal\n\n👥 **Eligibility:**\n• Age: 18-45 years\n• Unemployed WB resident\n• Family income < ₹2L/year\n\n🔒 **Special Feature:** PAN-linked auto verification\n• Benefit **suspends automatically** when you get a job\n• Benefit **resumes automatically** when employment ends\n\nTo apply → West Bengal page → State Schemes → Jubo Shakti`;
  }

  // ── Government login ──
  if (/gov.*login|admin.*login|wb_admin|state.*admin/.test(q)) {
    return `🏛️ **Government Admin Login:**\n\nState admins can login from the **Government** card on the Login page.\n\n**State Admin Accounts:**\n• West Bengal: \`wb_admin\` / \`WB@2024\`\n• UP: \`up_admin\` / \`UP@2024\`\n• Maharashtra: \`mh_admin\` / \`MH@2024\`\n• Pattern: \`{state}_admin\` / \`{STATE}@2024\`\n\nAfter login, you can:\n✅ Add new schemes & exams\n✅ Manage district officials\n✅ Review & approve applications`;
  }

  // ── District officials ──
  if (/co.admin|coadmin|member|elder|district.*official|official.*login/.test(q)) {
    return `👑 **District Officials:**\n\nDistrict officials (Co-Admin, Member, Elder) can login from the **"District Official"** card on the Login page → \`/district-login\`\n\n**Roles:**\n• 👑 **Co-Admin** — District head, manages Members & Elders\n• 👤 **Member** — Can verify & approve applications\n• 🏅 **Elder** — Can verify & approve applications\n\n*Credentials are issued by your State Government Admin*`;
  }

  // ── Default ──
  const topSchemes = allSchemes.slice(0,3).map(s=>s.name).join(', ');
  const topExams   = allExams.slice(0,3).map(e=>e.shortName||e.name).join(', ');
  return `🤔 I couldn't find specific information about **"${question}"**.\n\nHere are some things I can help with:\n\n📋 **Schemes:** ${topSchemes}...\n📝 **Exams:** ${topExams}...\n🎓 **Scholarships:** SVMCM, OASIS, PM Scholarship...\n📋 **Tenders:** School Building, Jal Jeevan Mission...\n\n💡 Try asking:\n• "What is Jubo Shakti?"\n• "How to apply for WBCS?"\n• "Kanyashree eligibility"\n• "Documents for scholarship"\n• "How to track my application?"`;
}

// ── Text to Speech ──────────────────────────────────────────
function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const clean = text.replace(/\*\*/g,'').replace(/#+/g,'').replace(/•/g,'').replace(/`[^`]+`/g,'');
  const utter = new SpeechSynthesisUtterance(clean);
  utter.lang = 'en-IN';
  utter.rate = 0.95;
  utter.pitch = 1;
  window.speechSynthesis.speak(utter);
}

function stopSpeech() {
  if (window.speechSynthesis) window.speechSynthesis.cancel();
}

// ── Format markdown-like text ───────────────────────────────
function FormatText({ text }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        const formatted = line
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
          .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 rounded text-xs font-mono">$1</code>');
        return (
          <p key={i} dangerouslySetInnerHTML={{ __html: formatted }}
            className={line.startsWith('•') ? 'pl-2' : ''} />
        );
      })}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────
export default function AIAssistant() {
  const [open, setOpen]           = useState(false);
  const [messages, setMessages]   = useState([{
    role: 'ai',
    text: '👋 Hello! I\'m your AI assistant. Ask me about any scheme, exam, scholarship or tender. I\'ll answer instantly!\n\n*Type your question below or try:* "What is Jubo Shakti?"',
  }]);
  const [input, setInput]         = useState('');
  const [speaking, setSpeaking]   = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const [loading, setLoading]     = useState(false);

  // ── Draggable position ──
  const [pos, setPos]             = useState({ x: null, y: null }); // null = default CSS
  const [dragging, setDragging]   = useState(false);
  const dragOffset                = useRef({ x: 0, y: 0 });
  const btnRef                    = useRef(null);
  const messagesEndRef            = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Drag handlers ──
  const onMouseDown = useCallback((e) => {
    if (e.target.closest('button[data-nodrag]') || e.target.closest('input') || e.target.closest('.chat-panel')) return;
    e.preventDefault();
    const rect = btnRef.current.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setDragging(true);
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!dragging) return;
    const x = e.clientX - dragOffset.current.x;
    const y = e.clientY - dragOffset.current.y;
    const maxX = window.innerWidth  - (btnRef.current?.offsetWidth  || 60);
    const maxY = window.innerHeight - (btnRef.current?.offsetHeight || 60);
    setPos({ x: Math.max(0, Math.min(x, maxX)), y: Math.max(0, Math.min(y, maxY)) });
  }, [dragging]);

  const onMouseUp = useCallback(() => setDragging(false), []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', e => onMouseMove(e.touches[0]));
      window.addEventListener('touchend', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging, onMouseMove, onMouseUp]);

  // Touch drag
  const onTouchStart = useCallback((e) => {
    if (e.target.closest('.chat-panel')) return;
    const touch = e.touches[0];
    const rect = btnRef.current.getBoundingClientRect();
    dragOffset.current = { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
    setDragging(true);
  }, []);

  // ── Send message ──
  const handleSend = async () => {
    const q = input.trim();
    if (!q) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setLoading(true);
    await new Promise(r => setTimeout(r, 400)); // slight delay for feel
    const answer = getAIResponse(q);
    setMessages(prev => [...prev, { role: 'ai', text: answer }]);
    setLoading(false);
  };

  // ── Speak message ──
  const handleSpeak = (text, idx) => {
    if (speakingIdx === idx && speaking) {
      stopSpeech();
      setSpeaking(false);
      setSpeakingIdx(null);
      return;
    }
    speak(text);
    setSpeaking(true);
    setSpeakingIdx(idx);
    const utter = window.speechSynthesis;
    const check = setInterval(() => {
      if (!utter.speaking) { setSpeaking(false); setSpeakingIdx(null); clearInterval(check); }
    }, 200);
  };

  const posStyle = pos.x !== null
    ? { position: 'fixed', left: pos.x, top: pos.y, bottom: 'auto', right: 'auto' }
    : { position: 'fixed', bottom: '24px', right: '24px' };

  return (
    <div ref={btnRef} style={{ ...posStyle, zIndex: 9999, userSelect:'none' }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}>

      {/* Chat Panel */}
      {open && (
        <div className="chat-panel absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
          style={{ maxHeight: '70vh', minHeight: '400px' }}
          onMouseDown={e => e.stopPropagation()}>

          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-700 to-purple-700 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-lg">🤖</div>
              <div>
                <p className="text-white font-bold text-sm leading-tight">AI Assistant</p>
                <p className="text-indigo-200 text-xs">Bharat Digital Seva</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button data-nodrag onClick={() => { stopSpeech(); setSpeaking(false); }}
                className="text-white/60 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                title="Stop audio">
                🔇
              </button>
              <button data-nodrag onClick={() => setOpen(false)}
                className="text-white/70 hover:text-white text-xl transition-colors">✕</button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm ${
                  msg.role === 'user' ? 'bg-orange-500 text-white' : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {msg.role === 'user' ? '👤' : '🤖'}
                </div>
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className={`px-3 py-2.5 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-orange-500 text-white rounded-tr-sm'
                      : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-sm'
                  }`}>
                    {msg.role === 'ai' ? <FormatText text={msg.text} /> : <p>{msg.text}</p>}
                  </div>
                  {msg.role === 'ai' && (
                    <button data-nodrag onClick={() => handleSpeak(msg.text, i)}
                      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${
                        speakingIdx === i && speaking
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600'
                      }`}>
                      {speakingIdx === i && speaking ? '🔴 Stop' : '🔊 Listen'}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-sm">🤖</div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-3 py-2.5 shadow-sm">
                  <div className="flex gap-1">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                        style={{animationDelay:`${i*0.15}s`}} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion chips */}
          <div className="px-3 py-2 flex gap-1.5 overflow-x-auto border-t border-gray-100 bg-white">
            {['Jubo Shakti','WBCS Exam','Kanyashree','Track application','How to apply'].map(chip => (
              <button key={chip} data-nodrag
                onClick={() => { setInput(chip); }}
                className="flex-shrink-0 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full transition-colors whitespace-nowrap">
                {chip}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask about any scheme, exam..."
              className="flex-1 bg-gray-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800"
              onMouseDown={e => e.stopPropagation()}
            />
            <button data-nodrag onClick={handleSend} disabled={!input.trim() || loading}
              className="w-10 h-10 bg-indigo-700 hover:bg-indigo-800 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
              <svg className="w-4 h-4 rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        data-nodrag
        onClick={() => setOpen(v => !v)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl transition-all duration-300 relative ${
          open
            ? 'bg-gray-700 hover:bg-gray-800 rotate-0 scale-95'
            : 'bg-gradient-to-br from-indigo-700 to-purple-700 hover:from-indigo-600 hover:to-purple-600 hover:scale-110'
        } ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        title="AI Assistant — Ask me anything!"
      >
        {open ? '✕' : '🤖'}
        {/* Pulse ring when closed */}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-indigo-500 opacity-30 animate-ping" />
        )}
        {/* Drag hint */}
        <span className="absolute -top-1 -left-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
          <svg className="w-2.5 h-2.5 text-gray-400" fill="currentColor" viewBox="0 0 16 16">
            <path d="M7 2a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm3 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
          </svg>
        </span>
      </button>
    </div>
  );
}
