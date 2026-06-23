import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DistrictRolesManager from '../../components/DistrictRolesManager';
import prisma from '../../lib/prisma';

export async function getServerSideProps() {
  const [allSchemes, allExams, allScholarships, allTenders] = await Promise.all([
    prisma.scheme.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.exam.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.scholarship.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.tender.findMany({ orderBy: { createdAt: 'asc' } }),
  ]);
  return {
    props: JSON.parse(JSON.stringify({ allSchemes, allExams, allScholarships, allTenders })),
  };
}

// ── Constants ──────────────────────────────────────────────
const FIELD_TYPES = [
  { value: 'text',     label: 'Text Input',            icon: '✏️' },
  { value: 'number',   label: 'Number',                icon: '🔢' },
  { value: 'date',     label: 'Date',                  icon: '📅' },
  { value: 'month',    label: 'Month / Year',          icon: '🗓️' },
  { value: 'email',    label: 'Email Address',         icon: '📧' },
  { value: 'tel',      label: 'Mobile / Phone',        icon: '📱' },
  { value: 'select',   label: 'Dropdown (Options)',    icon: '📋' },
  { value: 'textarea', label: 'Long Text / Paragraph', icon: '📝' },
  { value: 'checkbox', label: 'Checkbox / Declaration',icon: '☑️' },
];

const SCHEME_CATEGORIES      = ['Youth Employment','Housing','Agriculture','Health','Education','Women Welfare','Girl Child','Business Loan','Food Security','Energy','Farmer Support','Marriage Assistance','Electricity','Other'];
const EXAM_CATEGORIES        = ['Civil Services','Police','Education / Teaching','Banking','Railway','Medical Entrance','Engineering Entrance','Revenue / Admin','Forest Department','Other'];
const SCHOLARSHIP_CATEGORIES = ['Merit-based','Need-based (Income)','SC/ST/OBC','Minority','Disability','Girls Only','Post-Matric','Pre-Matric','Higher Education','Technical / Professional','Other'];
const TENDER_CATEGORIES      = ['Infrastructure / Road','Building Construction','Electrical / Electrification','Water & Sanitation','IT / Software','Healthcare Procurement','School / Education Infra','Defence Supply','Agriculture Supply','Other'];
const ICONS  = ['🏛️','👨‍💼','🌾','🏠','🏥','🎓','👩','👧','💰','💼','🔥','👰','💡','⚡','🌿','🚂','🏦','📋','🎯','🤝','🌟','💊','📚','🏗️','⚖️','🌍'];
const COLORS = [
  { label: 'Orange', card: 'bg-orange-100 border-orange-300', badge: 'bg-orange-100 text-orange-700' },
  { label: 'Blue',   card: 'bg-blue-100 border-blue-300',     badge: 'bg-blue-100 text-blue-700' },
  { label: 'Green',  card: 'bg-green-100 border-green-300',   badge: 'bg-green-100 text-green-700' },
  { label: 'Red',    card: 'bg-red-100 border-red-300',       badge: 'bg-red-100 text-red-700' },
  { label: 'Purple', card: 'bg-purple-100 border-purple-300', badge: 'bg-purple-100 text-purple-700' },
  { label: 'Pink',   card: 'bg-pink-100 border-pink-300',     badge: 'bg-pink-100 text-pink-700' },
  { label: 'Amber',  card: 'bg-amber-100 border-amber-300',   badge: 'bg-amber-100 text-amber-700' },
  { label: 'Teal',   card: 'bg-teal-100 border-teal-300',     badge: 'bg-teal-100 text-teal-700' },
];

const blankField = () => ({
  _id: Date.now() + Math.random(),
  label: '', name: '', type: 'text', required: true, placeholder: '', options: '',
});

const blankScheme = () => ({
  name: '', nameHindi: '', ministry: '', category: '', benefit: '',
  eligibility: '', icon: '🏛️', colorIdx: 0, description: '', documents: '',
});

const blankExam = () => ({
  name: '', conductedBy: '', category: '', benefit: '', eligibility: '',
  posts: '', applicationFee: '', nextExam: '', applicationDeadline: '',
  status: 'upcoming', icon: '📋', colorIdx: 1, description: '',
});

const blankScholarship = () => ({
  name: '', nameHindi: '', ministry: '', category: '', benefit: '',
  eligibility: '', minMarks: '', incomeLimit: '', targetGroup: '',
  applicationDeadline: '', icon: '🎓', colorIdx: 1, description: '', documents: '',
});

const blankTender = () => ({
  name: '', department: '', category: '', estimatedValue: '', bidDeadline: '',
  workDescription: '', eligibility: '', tenderNo: '',
  status: 'upcoming', icon: '📋', colorIdx: 6, description: '',
});


// ── Field Row Component ─────────────────────────────────────
function FieldRow({ field, idx, total, onChange, onRemove, onMove }) {
  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-blue-700 text-white rounded-full text-xs flex items-center justify-center font-bold">{idx + 1}</span>
          <span className="text-sm font-semibold text-gray-700">
            {field.label || <span className="text-gray-400 font-normal">Untitled Field</span>}
          </span>
          {field.required && <span className="text-red-500 text-xs font-bold">*Required</span>}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => onMove(idx, -1)} disabled={idx === 0}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">▲</button>
          <button onClick={() => onMove(idx, 1)} disabled={idx === total - 1}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 text-xs">▼</button>
          <button onClick={() => onRemove(field._id)}
            className="ml-1 text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors text-sm">🗑</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Field Label *</label>
          <input
            value={field.label}
            onChange={e => {
              const label = e.target.value;
              const name = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
              onChange(field._id, 'label', label);
              onChange(field._id, 'name', name);
            }}
            placeholder="e.g. Full Name, Date of Birth..."
            className="form-input text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Field Type</label>
          <select value={field.type} onChange={e => onChange(field._id, 'type', e.target.value)} className="form-input text-sm">
            {FIELD_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1">Placeholder / Hint</label>
          <input value={field.placeholder} onChange={e => onChange(field._id, 'placeholder', e.target.value)}
            placeholder="Hint shown inside the field..." className="form-input text-sm" />
        </div>

        {field.type === 'select' && (
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="text-xs font-semibold text-gray-500 block mb-1">
              Dropdown Options <span className="font-normal text-gray-400">(comma separated)</span>
            </label>
            <input value={field.options} onChange={e => onChange(field._id, 'options', e.target.value)}
              placeholder="Option 1, Option 2, Option 3, ..."
              className="form-input text-sm" />
          </div>
        )}

        <div className="flex items-center">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => onChange(field._id, 'required', !field.required)}
              className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${field.required ? 'bg-blue-600' : 'bg-gray-300'}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${field.required ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
            <span className="text-sm text-gray-600">Required field</span>
          </label>
        </div>
      </div>
    </div>
  );
}


// ── Form Builder View ───────────────────────────────────────
function FormBuilder({ type, stateId, stateName, onBack, onPublished, editItem = null }) {
  const isScheme      = type === 'scheme';
  const isExam        = type === 'exam';
  const isScholarship = type === 'scholarship';
  const isTender      = type === 'tender';
  const isEditing     = !!editItem;

  const getInitialDetails = () => {
    if (editItem) {
      const { id, stateId: sid, stateName: sn, color, badgeColor, formFields, publishedAt, isCustom, documents, ...rest } = editItem;
      return { ...rest, colorIdx: rest.colorIdx ?? 0, documents: Array.isArray(documents) ? documents.join(', ') : (documents || '') };
    }
    if (isScholarship) return blankScholarship();
    if (isTender)      return blankTender();
    if (isExam)        return blankExam();
    return blankScheme();
  };

  const [details, setDetails] = useState(getInitialDetails);
  const [fields, setFields]   = useState(() =>
    editItem?.formFields?.map(f => ({ ...f, _id: Date.now() + Math.random(), options: Array.isArray(f.options) ? f.options.join(', ') : (f.options || '') })) || []
  );
  const [preview, setPreview] = useState(false);
  const [errors, setErrors]   = useState({});

  const set = (k, v) => { setDetails(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };

  const addField    = () => setFields(f => [...f, blankField()]);
  const removeField = (id) => setFields(f => f.filter(x => x._id !== id));
  const updateField = (id, k, v) => setFields(f => f.map(x => x._id === id ? { ...x, [k]: v } : x));
  const moveField   = (idx, dir) => {
    const arr = [...fields], sw = idx + dir;
    if (sw < 0 || sw >= arr.length) return;
    [arr[idx], arr[sw]] = [arr[sw], arr[idx]];
    setFields(arr);
  };

  const validate = () => {
    const e = {};
    if (!details.name) e.name = 'Name is required';
    if (!details.category) e.category = 'Category is required';
    if (isTender) {
      if (!details.estimatedValue) e.estimatedValue = 'Estimated value is required';
      if (!details.bidDeadline)    e.bidDeadline    = 'Bid deadline is required';
      if (!details.department)     e.department     = 'Department is required';
      if (!details.tenderNo)       e.tenderNo       = 'Tender number is required';
    } else {
      if (!details.benefit)     e.benefit     = 'Benefit is required';
      if (!details.eligibility) e.eligibility = 'Eligibility is required';
      if (isExam && !details.conductedBy) e.conductedBy = 'Conducted By is required';
    }
    return e;
  };

  const publish = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    if (!isEditing && fields.length === 0) { alert('Please add at least one form field before publishing.'); return; }

    const colorObj = COLORS[details.colorIdx] || COLORS[0];
    const cleanFields = fields.map(({ _id, options, ...f }) => ({
      ...f,
      options: f.type === 'select' ? options.split(',').map(o => o.trim()).filter(Boolean) : undefined,
    }));

    const item = {
      id: isEditing ? editItem.id : `custom-${Date.now()}`,
      ...details,
      stateId,
      stateName,
      color: colorObj.card,
      badgeColor: colorObj.badge,
      documents: details.documents ? details.documents.split(',').map(d => d.trim()).filter(Boolean) : [],
      formFields: cleanFields,
      publishedAt: isEditing ? editItem.publishedAt : new Date().toISOString().split('T')[0],
      updatedAt: isEditing ? new Date().toISOString().split('T')[0] : undefined,
      isCustom: isEditing ? Boolean(editItem.isCustom) : true,
    };

    const endpoint = isScheme      ? '/api/schemes'
                   : isExam        ? '/api/exams'
                   : isScholarship ? '/api/scholarships'
                   :                 '/api/tenders';

    try {
      await fetch(endpoint, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
    } catch (_) {}

    onPublished(item, type);
  };

  const colorObj = COLORS[details.colorIdx] || COLORS[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors font-semibold">
          ← Back to Dashboard
        </button>
        <h2 className="text-xl font-extrabold text-gray-800">
          {isEditing ? '✏️ Edit — ' : ''}
          {isScheme      ? '🏛️ Scheme / Prokolpo'
           : isExam       ? '📝 Job / Exam'
           : isScholarship? '🎓 Scholarship'
           :                '📋 Tender'}
          {isEditing && <span className="text-sm font-normal text-gray-500 ml-2">(updating existing)</span>}
        </h2>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">

          {/* Basic Details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-blue-700 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              {isScheme ? 'Scheme / Prokolpo Details'
               : isExam ? 'Exam / Job Details'
               : isScholarship ? 'Scholarship Details'
               : 'Tender Details'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div className="sm:col-span-2">
                <label className="form-label">
                  {isScheme ? 'Scheme Name'
                   : isExam ? 'Exam / Job Name'
                   : isScholarship ? 'Scholarship Name'
                   : 'Tender Name'} *
                </label>
                <input value={details.name} onChange={e => set('name', e.target.value)}
                  placeholder={
                    isScheme ? 'e.g. Yuva Shakti Prakalpa'
                    : isExam ? 'e.g. State Police Constable Exam 2026'
                    : isScholarship ? 'e.g. Chief Minister Scholarship 2026'
                    : 'e.g. District Road Construction Tender 2026'
                  }
                  className={`form-input ${errors.name ? 'border-red-400' : ''}`} />
                {errors.name && <p className="text-red-500 text-xs mt-1">⚠ {errors.name}</p>}
              </div>

              {isScheme && (
                <div className="sm:col-span-2">
                  <label className="form-label">Hindi / Local Language Name <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input value={details.nameHindi} onChange={e => set('nameHindi', e.target.value)}
                    placeholder="युवा शक्ति प्रकल्प" className="form-input" />
                </div>
              )}

              <div>
                <label className="form-label">
                  {isTender ? 'Department / Authority' : isExam ? 'Conducted By' : 'Ministry / Department'} *
                </label>
                <input
                  value={isTender ? details.department : isExam ? details.conductedBy : details.ministry}
                  onChange={e => set(isTender ? 'department' : isExam ? 'conductedBy' : 'ministry', e.target.value)}
                  placeholder={isTender ? 'e.g. PWD / PHED / Education Dept.' : isExam ? 'State PSC / WBPRB' : 'Ministry of Labour'}
                  className={`form-input ${errors[isTender ? 'department' : isExam ? 'conductedBy' : 'ministry'] ? 'border-red-400' : ''}`} />
              </div>

              <div>
                <label className="form-label">Category *</label>
                <select value={details.category} onChange={e => set('category', e.target.value)}
                  className={`form-input ${errors.category ? 'border-red-400' : ''}`}>
                  <option value="">-- Select Category --</option>
                  {(isScholarship ? SCHOLARSHIP_CATEGORIES
                    : isTender ? TENDER_CATEGORIES
                    : isExam ? EXAM_CATEGORIES
                    : SCHEME_CATEGORIES).map(c => <option key={c}>{c}</option>)}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">⚠ {errors.category}</p>}
              </div>

              {!isTender && (
                <div>
                  <label className="form-label">
                    {isScholarship ? 'Scholarship Amount' : isExam ? 'Posts / Benefit' : 'Benefit / Amount'} *
                  </label>
                  <input value={details.benefit} onChange={e => set('benefit', e.target.value)}
                    placeholder={isScholarship ? 'e.g. ₹5,000/month or ₹60,000/year' : isExam ? 'e.g. 200 posts' : '₹3,000/month'}
                    className={`form-input ${errors.benefit ? 'border-red-400' : ''}`} />
                  {errors.benefit && <p className="text-red-500 text-xs mt-1">⚠ {errors.benefit}</p>}
                </div>
              )}

              {isTender && (
                <div>
                  <label className="form-label">Estimated Contract Value *</label>
                  <input value={details.estimatedValue} onChange={e => set('estimatedValue', e.target.value)}
                    placeholder="e.g. ₹2.5 Crore"
                    className={`form-input ${errors.estimatedValue ? 'border-red-400' : ''}`} />
                  {errors.estimatedValue && <p className="text-red-500 text-xs mt-1">⚠ {errors.estimatedValue}</p>}
                </div>
              )}

              {!isTender && (
                <div>
                  <label className="form-label">
                    {isScholarship ? 'Eligibility (marks, income etc.)' : 'Eligibility'} *
                  </label>
                  <input value={details.eligibility} onChange={e => set('eligibility', e.target.value)}
                    placeholder={isScholarship ? 'e.g. Min 60% marks, income < ₹2.5L' : 'Age 18-35, Unemployed, Graduate...'}
                    className={`form-input ${errors.eligibility ? 'border-red-400' : ''}`} />
                  {errors.eligibility && <p className="text-red-500 text-xs mt-1">⚠ {errors.eligibility}</p>}
                </div>
              )}

              {isTender && (
                <>
                  <div>
                    <label className="form-label">Tender Number *</label>
                    <input value={details.tenderNo} onChange={e => set('tenderNo', e.target.value)}
                      placeholder="e.g. PWD/WB/2026/045"
                      className={`form-input font-mono ${errors.tenderNo ? 'border-red-400' : ''}`} />
                    {errors.tenderNo && <p className="text-red-500 text-xs mt-1">⚠ {errors.tenderNo}</p>}
                  </div>
                  <div>
                    <label className="form-label">Bid / Application Deadline *</label>
                    <input value={details.bidDeadline} onChange={e => set('bidDeadline', e.target.value)}
                      placeholder="e.g. July 30, 2026"
                      className={`form-input ${errors.bidDeadline ? 'border-red-400' : ''}`} />
                    {errors.bidDeadline && <p className="text-red-500 text-xs mt-1">⚠ {errors.bidDeadline}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="form-label">Work Description *</label>
                    <textarea value={details.workDescription} onChange={e => set('workDescription', e.target.value)}
                      rows={2} placeholder="Describe the work / scope of tender..."
                      className="form-input resize-none" />
                  </div>
                  <div>
                    <label className="form-label">Eligibility for Bidders</label>
                    <input value={details.eligibility} onChange={e => set('eligibility', e.target.value)}
                      placeholder="e.g. Class-I contractor, min turnover ₹5 Cr"
                      className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Status</label>
                    <select value={details.status} onChange={e => set('status', e.target.value)} className="form-input">
                      <option value="upcoming">🟡 Upcoming</option>
                      <option value="active">🟢 Open Now</option>
                    </select>
                  </div>
                </>
              )}

              {isScholarship && (
                <>
                  <div>
                    <label className="form-label">Minimum Marks Required (%)</label>
                    <input type="number" value={details.minMarks} onChange={e => set('minMarks', e.target.value)}
                      placeholder="e.g. 60" className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Income Limit (₹/year)</label>
                    <input type="number" value={details.incomeLimit} onChange={e => set('incomeLimit', e.target.value)}
                      placeholder="e.g. 250000" className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Application Deadline</label>
                    <input value={details.applicationDeadline} onChange={e => set('applicationDeadline', e.target.value)}
                      placeholder="e.g. October 31, 2026" className="form-input" />
                  </div>
                </>
              )}

              {!isScheme && (
                <>
                  <div>
                    <label className="form-label">Application Fee</label>
                    <input value={details.applicationFee} onChange={e => set('applicationFee', e.target.value)}
                      placeholder="₹200 (SC/ST Free)" className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Exam Date / Schedule</label>
                    <input value={details.nextExam} onChange={e => set('nextExam', e.target.value)}
                      placeholder="Written: March 2027" className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Application Deadline</label>
                    <input value={details.applicationDeadline} onChange={e => set('applicationDeadline', e.target.value)}
                      placeholder="January 2027" className="form-input" />
                  </div>
                  <div>
                    <label className="form-label">Status</label>
                    <select value={details.status} onChange={e => set('status', e.target.value)} className="form-input">
                      <option value="upcoming">🟡 Upcoming — Not Open Yet</option>
                      <option value="active">🟢 Active — Applications Open</option>
                    </select>
                  </div>
                </>
              )}

              <div className="sm:col-span-2">
                <label className="form-label">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                <textarea value={details.description} onChange={e => set('description', e.target.value)}
                  rows={2} placeholder="Brief description for applicants..."
                  className="form-input resize-none" />
              </div>

              <div className="sm:col-span-2">
                <label className="form-label">
                  Required Documents <span className="text-gray-400 font-normal">(comma separated, optional)</span>
                </label>
                <input value={details.documents} onChange={e => set('documents', e.target.value)}
                  placeholder="Aadhaar Card, PAN Card, Birth Certificate, Bank Passbook"
                  className="form-input" />
              </div>
            </div>
          </div>

          {/* Icon & Color */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 bg-blue-700 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              Icon & Card Colour
            </h3>
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Choose Icon</p>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map(icon => (
                    <button key={icon} type="button" onClick={() => set('icon', icon)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                        details.icon === icon ? 'bg-blue-100 ring-2 ring-blue-500 scale-110' : 'bg-gray-100 hover:bg-gray-200'
                      }`}>
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-2">Card Colour Theme</p>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c, i) => (
                    <button key={i} type="button" onClick={() => set('colorIdx', i)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all ${c.card} ${
                        details.colorIdx === i ? 'ring-2 ring-offset-1 ring-blue-600 scale-105' : ''
                      }`}>
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Form Field Builder */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <span className="w-7 h-7 bg-blue-700 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                Application Form Fields
                <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full ml-1">
                  {fields.length} field{fields.length !== 1 ? 's' : ''}
                </span>
              </h3>
              <button onClick={addField}
                className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold px-5 py-2 rounded-xl transition-colors flex items-center gap-2">
                + Add Field
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4">Add each field of the application form one by one. Set the label, type and whether it is required.</p>

            {fields.length === 0 ? (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center">
                <div className="text-5xl mb-3">📋</div>
                <p className="text-gray-500 font-medium">No fields added yet</p>
                <p className="text-gray-400 text-sm mt-1 mb-4">Click <strong>+ Add Field</strong> to start building the application form</p>
                <button onClick={addField}
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold px-6 py-2 rounded-xl transition-colors text-sm">
                  + Add First Field
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map((f, idx) => (
                  <FieldRow
                    key={f._id} field={f} idx={idx} total={fields.length}
                    onChange={updateField} onRemove={removeField} onMove={moveField}
                  />
                ))}
                <button onClick={addField}
                  className="w-full border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                  + Add Another Field
                </button>
              </div>
            )}
          </div>

          {fields.length > 0 && (
            <div className="flex gap-3">
              <button onClick={() => setPreview(v => !v)}
                className="flex-1 border-2 border-blue-300 text-blue-700 font-semibold py-3 rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                {preview ? '✕ Close Preview' : '👁 Preview Form'}
              </button>
              <button onClick={publish}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-base">
                🚀 Publish {isScheme ? 'Scheme' : isExam ? 'Exam' : isScholarship ? 'Scholarship' : 'Tender'}
              </button>
            </div>
          )}

          {preview && fields.length > 0 && (
            <div className="bg-white rounded-2xl border-2 border-green-200 p-6">
              <h3 className="font-bold text-green-800 mb-1 text-base">👁 Form Preview</h3>
              <p className="text-xs text-gray-400 mb-4">This is exactly how the application form will look to public users.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map(f => (
                  <div key={f._id} className={f.type === 'textarea' || f.type === 'checkbox' ? 'md:col-span-2' : ''}>
                    {f.type === 'checkbox' ? (
                      <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input type="checkbox" disabled className="rounded" />
                        {f.label || 'Declaration'} {f.required && <span className="text-red-500">*</span>}
                      </label>
                    ) : (
                      <>
                        <label className="form-label text-xs">
                          {f.label || 'Field'} {f.required && <span className="text-red-500">*</span>}
                        </label>
                        {f.type === 'select' ? (
                          <select disabled className="form-input bg-gray-50 text-sm">
                            <option>-- Select --</option>
                            {(f.options || '').split(',').filter(Boolean).map(o => <option key={o}>{o.trim()}</option>)}
                          </select>
                        ) : f.type === 'textarea' ? (
                          <textarea disabled rows={2} placeholder={f.placeholder} className="form-input bg-gray-50 text-sm resize-none" />
                        ) : (
                          <input type={f.type} disabled placeholder={f.placeholder || f.label} className="form-input bg-gray-50 text-sm" />
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
              <button disabled className="mt-5 w-full py-3 rounded-xl bg-orange-400 text-white font-bold opacity-60 cursor-not-allowed text-sm">
                📤 Submit Application (Preview Only)
              </button>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sticky top-20">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Live Card Preview</p>
            <div className={`rounded-2xl border-2 ${colorObj.card} p-4`}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-3xl">{details.icon}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colorObj.badge}`}>
                  {details.category || 'Category'}
                </span>
              </div>
              <p className="font-bold text-gray-800 text-sm leading-tight">
                {details.name || (isScheme ? 'Scheme Name' : 'Exam Name')}
              </p>
              {details.nameHindi && <p className="text-xs text-gray-500 mt-0.5">{details.nameHindi}</p>}
              <p className="text-xs text-green-700 font-semibold mt-1.5">{details.benefit || '₹ Benefit / Posts'}</p>
              <p className="text-xs text-gray-500 mt-0.5">{details.eligibility || 'Eligibility criteria...'}</p>
              {!isScheme && details.nextExam && (
                <p className="text-xs text-blue-600 mt-1">📅 {details.nextExam}</p>
              )}
              <div className="mt-3 bg-gray-800 text-white text-xs text-center py-2 rounded-xl font-semibold">
                Apply Now →
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">Updates as you type</p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <p className="font-bold text-blue-800 text-sm mb-2">📚 Field Types</p>
            {FIELD_TYPES.map(t => (
              <div key={t.value} className="flex items-center gap-1.5 text-xs text-blue-700 py-0.5">
                <span>{t.icon}</span><span>{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


// ── Main Admin Dashboard ────────────────────────────────────
export default function AdminDashboard({ allSchemes, allExams, allScholarships, allTenders }) {
  const router = useRouter();
  const [adminInfo, setAdminInfo] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Gov admin auth guard
  useEffect(() => {
    try {
      const session = JSON.parse(localStorage.getItem('gov_admin_session'));
      if (!session) {
        router.replace('/login');
        return;
      }
      setAdminInfo(session);
    } catch {
      router.replace('/login');
      return;
    }
    setAuthChecked(true);

    // Load edit item passed from all-items page via sessionStorage
    try {
      const stored = sessionStorage.getItem('admin_edit_item');
      if (stored) {
        sessionStorage.removeItem('admin_edit_item');
        const { editItem, editType } = JSON.parse(stored);
        if (editItem && editType) {
          setEditingItem({ item: editItem, type: editType });
          setView('add-' + editType);
        }
      }
    } catch (_) {}
  }, []);

  const [view, setView] = useState('home');
  const [editingItem, setEditingItem] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  // Custom items fetched from API
  const [customSchemes,      setCustomSchemes]      = useState([]);
  const [customExams,        setCustomExams]        = useState([]);
  const [customScholarships, setCustomScholarships] = useState([]);
  const [customTenders,      setCustomTenders]      = useState([]);
  const [pendingApps, setPendingApps]               = useState(0);
  const [successMsg, setSuccessMsg]                 = useState('');

  useEffect(() => {
    if (!adminInfo) return;
    const stateId = adminInfo.stateId || 'central';

    const fetchData = async () => {
      try {
        const [schemesRes, examsRes, scholarshipsRes, tendersRes, appsRes] = await Promise.all([
          fetch(`/api/schemes?stateId=${stateId}`),
          fetch(`/api/exams?stateId=${stateId}`),
          fetch(`/api/scholarships?stateId=${stateId}`),
          fetch(`/api/tenders?stateId=${stateId}`),
          fetch(`/api/applications?stateId=${stateId}`),
        ]);
        // Only keep custom-created items in state; official items come from getServerSideProps
        if (schemesRes.ok)      { const d = await schemesRes.json(); setCustomSchemes(d.filter(s => s.isCustom)); }
        if (examsRes.ok)        { const d = await examsRes.json();   setCustomExams(d.filter(e => e.isCustom)); }
        if (scholarshipsRes.ok) { const d = await scholarshipsRes.json(); setCustomScholarships(d.filter(s => s.isCustom)); }
        if (tendersRes.ok)      { const d = await tendersRes.json(); setCustomTenders(d.filter(t => t.isCustom)); }
        if (appsRes.ok) {
          const apps = await appsRes.json();
          setPendingApps(apps.filter(a => a.status === 'Under Review' || a.status === 'Application Received').length);
        }
      } catch (_) {}
    };

    fetchData();
  }, [adminInfo]);

  if (!authChecked || !adminInfo) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin text-4xl">⟳</div></div>;
  }

  const stateId   = adminInfo.stateId   || 'central';
  const stateName = adminInfo.stateName || 'Central Government';
  const stateEmoji= adminInfo.emoji     || '🇮🇳';
  const isCentral = stateId === 'central';

  const onLogout = () => {
    localStorage.removeItem('gov_admin_session');
    router.replace('/login');
  };

  const toggleSection = (type) => setExpandedSections(p => ({ ...p, [type]: !p[type] }));

  const handleEdit = (item, type) => {
    setEditingItem({ item, type });
    setView('add-' + type);
  };

  const staticSchemes      = isCentral
    ? allSchemes.filter(s => s.scope === 'central')
    : allSchemes.filter(s => s.stateId === stateId);
  const staticExams        = isCentral
    ? allExams.filter(e => e.scope === 'central')
    : allExams.filter(e => e.stateId === stateId);
  const staticScholarships = isCentral
    ? allScholarships.filter(s => s.scope === 'central')
    : allScholarships.filter(s => s.stateId === stateId);
  const staticTenders      = isCentral
    ? allTenders.filter(t => t.stateId === 'central')
    : allTenders.filter(t => t.stateId === stateId);

  const publishedSchemes      = [...staticSchemes,      ...customSchemes];
  const publishedExams        = [...staticExams,        ...customExams];
  const publishedScholarships = [...staticScholarships, ...customScholarships];
  const publishedTenders      = [...staticTenders,      ...customTenders];
  const totalPublished = publishedSchemes.length + publishedExams.length + publishedScholarships.length + publishedTenders.length;

  const handlePublished = (item, type) => {
    setSuccessMsg(editingItem
      ? `✅ "${item.name}" updated successfully!`
      : `✅ "${item.name}" published! Citizens can now view and apply.`
    );
    setEditingItem(null);
    setView('home');

    if (!item.isCustom) {
      // Built-in item updated in DB — reload to get fresh server-side data
      setTimeout(() => window.location.reload(), 1200);
      return;
    }

    const updater = (prev) => {
      const exists = prev.some(x => x.id === item.id);
      return exists ? prev.map(x => x.id === item.id ? item : x) : [...prev, item];
    };
    if      (type === 'scheme')      setCustomSchemes(updater);
    else if (type === 'exam')        setCustomExams(updater);
    else if (type === 'scholarship') setCustomScholarships(updater);
    else                             setCustomTenders(updater);
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const deleteItem = async (type, id, isStatic) => {
    if (!window.confirm('এই আইটেমটি ডিলিট করবেন? এটি পূর্বাবস্থায় ফেরানো যাবে না।')) return;
    const endpoint = type === 'scheme'      ? '/api/schemes'
                   : type === 'exam'        ? '/api/exams'
                   : type === 'scholarship' ? '/api/scholarships'
                   :                          '/api/tenders';
    try {
      await fetch(`${endpoint}?id=${id}`, { method: 'DELETE' });
    } catch (_) {}
    if (isStatic) {
      // Re-fetch to reflect DB change
      window.location.reload();
    } else {
      if      (type === 'scheme')      setCustomSchemes(prev => prev.filter(x => x.id !== id));
      else if (type === 'exam')        setCustomExams(prev => prev.filter(x => x.id !== id));
      else if (type === 'scholarship') setCustomScholarships(prev => prev.filter(x => x.id !== id));
      else                             setCustomTenders(prev => prev.filter(x => x.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
              {stateEmoji}
            </div>
            <div>
              <h1 className="font-extrabold text-lg leading-tight">
                {stateName} — Admin Portal
              </h1>
              <p className="text-blue-200 text-xs">
                {isCentral ? '🇮🇳 Central Government' : `🗺️ State: ${stateName}`} · Logged in as: {adminInfo.username}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => router.push('/home')}
              className="text-xs bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-2 rounded-lg transition-colors hidden sm:block">
              🌐 Public Site
            </button>
            <button onClick={onLogout}
              className="text-xs bg-red-500/30 hover:bg-red-500/50 border border-red-400/30 text-white px-3 py-2 rounded-lg transition-colors">
              🔓 Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {successMsg && (
          <div className="bg-green-50 border border-green-300 rounded-2xl p-4 mb-6 flex items-center gap-3 text-green-800 font-semibold text-sm shadow-sm">
            <span className="text-xl">🎉</span>
            {successMsg}
          </div>
        )}

        {view === 'officials' && (
          <div>
            <button onClick={() => setView('home')}
              className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl mb-5 font-semibold transition-colors">
              ← Back to Dashboard
            </button>
            <DistrictRolesManager adminInfo={adminInfo} />
          </div>
        )}

        {view === 'add-scheme' && (
          <FormBuilder type="scheme" stateId={stateId} stateName={stateName} onBack={() => { setView('home'); setEditingItem(null); }} onPublished={handlePublished} editItem={editingItem?.type === 'scheme' ? editingItem.item : null} />
        )}
        {view === 'add-exam' && (
          <FormBuilder type="exam" stateId={stateId} stateName={stateName} onBack={() => { setView('home'); setEditingItem(null); }} onPublished={handlePublished} editItem={editingItem?.type === 'exam' ? editingItem.item : null} />
        )}
        {view === 'add-scholarship' && (
          <FormBuilder type="scholarship" stateId={stateId} stateName={stateName} onBack={() => { setView('home'); setEditingItem(null); }} onPublished={handlePublished} editItem={editingItem?.type === 'scholarship' ? editingItem.item : null} />
        )}
        {view === 'add-tender' && (
          <FormBuilder type="tender" stateId={stateId} stateName={stateName} onBack={() => { setView('home'); setEditingItem(null); }} onPublished={handlePublished} editItem={editingItem?.type === 'tender' ? editingItem.item : null} />
        )}

        {/* HOME VIEW */}
        {view === 'home' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
              {[
                { icon: '📋', label: 'Schemes',      value: publishedSchemes.length,      color: 'bg-orange-50 border-orange-200' },
                { icon: '📝', label: 'Exams',        value: publishedExams.length,        color: 'bg-blue-50 border-blue-200' },
                { icon: '🎓', label: 'Scholarships', value: publishedScholarships.length, color: 'bg-indigo-50 border-indigo-200' },
                { icon: '📋', label: 'Tenders',      value: publishedTenders.length,      color: 'bg-amber-50 border-amber-200' },
                { icon: '📊', label: 'Total',        value: totalPublished,               color: 'bg-green-50 border-green-200' },
                { icon: '🏛️', label: 'Employees',   value: '98+',                        color: 'bg-purple-50 border-purple-200' },
              ].map(s => (
                <div key={s.label} className={`${s.color} border rounded-2xl p-4 text-center`}>
                  <div className="text-3xl mb-1">{s.icon}</div>
                  <div className="text-2xl font-extrabold text-gray-800">{s.value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            <h2 className="text-lg font-bold text-gray-700 mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-3 gap-5 mb-10">

              <div onClick={() => setView('add-scheme')}
                className="card-hover bg-gradient-to-br from-orange-500 to-orange-700 text-white rounded-3xl p-7 cursor-pointer shadow-lg">
                <div className="text-5xl mb-4">🏛️</div>
                <h3 className="text-2xl font-extrabold mb-2">Add New Scheme</h3>
                <p className="text-orange-100 text-sm mb-4">Create a new government welfare scheme or prokolpo. Set eligibility, benefit, and build the application form.</p>
                <div className="bg-white/20 hover:bg-white/30 transition-colors rounded-xl py-3 text-center font-bold text-sm">
                  ➕ Create Scheme / Prokolpo →
                </div>
              </div>

              <div onClick={() => setView('add-exam')}
                className="card-hover bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-7 cursor-pointer shadow-lg">
                <div className="text-5xl mb-4">📝</div>
                <h3 className="text-2xl font-extrabold mb-2">Add New Exam</h3>
                <p className="text-blue-100 text-sm mb-4">Post a new recruitment exam or job notification. Add exam date, fee, posts and build the application form.</p>
                <div className="bg-white/20 hover:bg-white/30 transition-colors rounded-xl py-3 text-center font-bold text-sm">
                  ➕ Create Job / Exam →
                </div>
              </div>

              <div onClick={() => setView('add-scholarship')}
                className="card-hover bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-7 cursor-pointer shadow-lg">
                <div className="text-5xl mb-4">🎓</div>
                <h3 className="text-2xl font-extrabold mb-2">Add Scholarship</h3>
                <p className="text-blue-100 text-sm mb-4">Create a new scholarship scheme for students. Set marks criteria, income limit and build the application form.</p>
                <div className="bg-white/20 hover:bg-white/30 transition-colors rounded-xl py-3 text-center font-bold text-sm">
                  ➕ Create Scholarship →
                </div>
              </div>

              <div onClick={() => setView('add-tender')}
                className="card-hover bg-gradient-to-br from-amber-600 to-orange-700 text-white rounded-3xl p-7 cursor-pointer shadow-lg">
                <div className="text-5xl mb-4">📋</div>
                <h3 className="text-2xl font-extrabold mb-2">Add Tender</h3>
                <p className="text-amber-100 text-sm mb-4">Post a new government tender — road, building, water supply, electrical etc. with bid details and form.</p>
                <div className="bg-white/20 hover:bg-white/30 transition-colors rounded-xl py-3 text-center font-bold text-sm">
                  ➕ Create Tender →
                </div>
              </div>

              <div onClick={() => router.push('/admin/applications')}
                className="card-hover bg-gradient-to-br from-green-600 to-emerald-800 text-white rounded-3xl p-7 cursor-pointer shadow-lg relative">
                {pendingApps > 0 && (
                  <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-extrabold w-7 h-7 rounded-full flex items-center justify-center animate-pulse">
                    {pendingApps}
                  </span>
                )}
                <div className="text-5xl mb-4">📋</div>
                <h3 className="text-2xl font-extrabold mb-2">Applications</h3>
                <p className="text-green-100 text-sm mb-4">Review & approve/reject scheme applications. Organized by scheme → district → city → pincode.</p>
                <div className="bg-white/20 hover:bg-white/30 transition-colors rounded-xl py-3 text-center font-bold text-sm">
                  📋 Manage Applications →
                </div>
              </div>

              <div onClick={() => setView('officials')}
                className="card-hover bg-gradient-to-br from-purple-600 to-indigo-800 text-white rounded-3xl p-7 cursor-pointer shadow-lg">
                <div className="text-5xl mb-4">👥</div>
                <h3 className="text-2xl font-extrabold mb-2">District Officials</h3>
                <p className="text-purple-100 text-sm mb-4">Create & manage Co-Admin, Member and Elder credentials for each district.</p>
                <div className="bg-white/20 hover:bg-white/30 transition-colors rounded-xl py-3 text-center font-bold text-sm">
                  👑 Manage Credentials →
                </div>
              </div>

              <div onClick={() => router.push('/job-directory')}
                className="card-hover bg-gradient-to-br from-slate-600 to-slate-800 text-white rounded-3xl p-7 cursor-pointer shadow-lg">
                <div className="text-5xl mb-4">👔</div>
                <h3 className="text-2xl font-extrabold mb-2">Employee Directory</h3>
                <p className="text-slate-300 text-sm mb-4">View state-wise and sector-wise government employee listings with full details.</p>
                <div className="bg-white/20 hover:bg-white/30 transition-colors rounded-xl py-3 text-center font-bold text-sm">
                  👥 Open Directory →
                </div>
              </div>
            </div>

            {/* Published Items */}
            {totalPublished > 0 && (
              <div className="space-y-8">
                {[
                  { label: '🏛️ Schemes',      items: publishedSchemes,      type: 'scheme',      bg: 'bg-orange-100 text-orange-700' },
                  { label: '📝 Exams',         items: publishedExams,        type: 'exam',        bg: 'bg-blue-100 text-blue-700' },
                  { label: '🎓 Scholarships',  items: publishedScholarships, type: 'scholarship', bg: 'bg-indigo-100 text-indigo-700' },
                  { label: '📋 Tenders',       items: publishedTenders,      type: 'tender',      bg: 'bg-amber-100 text-amber-700' },
                ].map(({ label, items, type, bg }) => {
                  const visible = items.slice(0, 3);
                  const hasMore = items.length > 3;
                  return items.length > 0 && (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                          {label}
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${bg}`}>{items.length}</span>
                        </h2>
                        {hasMore && (
                          <button
                            onClick={() => router.push(`/admin/all/${stateId}/${type}`)}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
                          >
                            View All {items.length} →
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {visible.map(item => {
                          const isCustom = !!item.isCustom;
                          return (
                            <div key={item.id} className={`bg-white rounded-2xl border-2 ${item.color || 'bg-gray-100 border-gray-200'} p-4 shadow-sm relative`}>
                              <div className="absolute top-2 right-2">
                                {isCustom
                                  ? <span className="bg-blue-100 text-blue-700 text-xs font-bold px-1.5 py-0.5 rounded-full">Custom</span>
                                  : <span className="bg-gray-100 text-gray-500 text-xs font-bold px-1.5 py-0.5 rounded-full">Built-in</span>
                                }
                              </div>

                              <div className="flex items-start gap-2 mb-2">
                                <span className="text-2xl">{item.icon}</span>
                                <div className="min-w-0 pr-12">
                                  <p className="font-bold text-gray-800 text-sm leading-tight truncate">{item.name}</p>
                                  {(item.nameBengali || item.nameHindi) && (
                                    <p className="text-xs text-gray-400 truncate">{item.nameBengali || item.nameHindi}</p>
                                  )}
                                </div>
                              </div>

                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-gray-100 text-gray-600'}`}>
                                {item.category || item.subcategory}
                              </span>

                              <div className="mt-2 space-y-0.5">
                                {item.benefit        && <p className="text-xs text-green-700 font-semibold">✓ {item.benefit}</p>}
                                {item.estimatedValue && <p className="text-xs text-green-700 font-semibold">💰 {item.estimatedValue}</p>}
                                {item.eligibility    && <p className="text-xs text-gray-500 truncate">👥 {item.eligibility}</p>}
                                {item.nextExam       && <p className="text-xs text-blue-600">📅 {item.nextExam}</p>}
                                {item.bidDeadline    && <p className="text-xs text-red-500">⏰ Deadline: {item.bidDeadline}</p>}
                                <p className="text-xs text-gray-400">
                                  {item.formFields?.length ? `📋 ${item.formFields.length} fields` : ''}
                                  {item.publishedAt ? ` · ${item.publishedAt}` : ''}
                                </p>
                              </div>

                              <div className="mt-3 flex gap-2">
                                <span className="flex-1 bg-green-100 text-green-700 text-xs text-center py-1.5 rounded-lg font-semibold">🟢 Live</span>
                                <button onClick={() => handleEdit(item, type)}
                                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs py-1.5 rounded-lg font-semibold transition-colors">
                                  ✏️ Edit
                                </button>
                                <button onClick={() => deleteItem(type, item.id, !isCustom)}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-colors">
                                  🗑
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {hasMore && (
                        <div className="mt-3 text-center">
                          <button
                            onClick={() => router.push(`/admin/all/${stateId}/${type}`)}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-6 py-2 rounded-xl transition-colors"
                          >
                            View All {items.length} {label.split(' ').slice(1).join(' ')} →
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {totalPublished === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
                <div className="text-5xl mb-3">📋</div>
                <p className="font-medium text-gray-600">No schemes or exams published yet.</p>
                <p className="text-sm mt-1">Use the cards above to create and publish your first one.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
