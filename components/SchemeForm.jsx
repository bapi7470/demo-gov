import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import DocumentUpload from './DocumentUpload';

export default function SchemeForm({ scheme, onSuccess }) {
  const { isPanEmployed, registerSchemeBeneficiary } = useApp();
  const { user, getAutoFill, checkEligibility } = useAuth();

  const eligibility = checkEligibility(scheme.id);
  const autoFill = getAutoFill();

  const [formData, setFormData] = useState(autoFill);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [panStatus, setPanStatus] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState({});

  const validatePAN = (pan) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase());

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    if (name === 'pan' && scheme.hasPanLogic && value.length === 10) {
      checkPanStatus(value.toUpperCase());
    }
  };

  const checkPanStatus = (pan) => {
    if (!validatePAN(pan)) {
      setPanStatus('invalid');
      return;
    }
    // Check context (real-time employment status from company portals)
    if (isPanEmployed(pan)) {
      setPanStatus('employed');
    } else {
      setPanStatus('eligible');
    }
  };

  const validate = () => {
    const newErrors = {};
    scheme.formFields.forEach((field) => {
      if (field.required) {
        const val = formData[field.name];
        if (field.type === 'checkbox' && !val) {
          newErrors[field.name] = 'This confirmation is required';
        } else if (!val || val === '') {
          newErrors[field.name] = `${field.label} is required`;
        }
      }
    });

    if (scheme.hasPanLogic && panStatus === 'employed') {
      newErrors['pan'] = 'You are currently employed — Jubo Shakti benefit is not applicable';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstError = document.querySelector('.border-red-400');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setSubmitting(true);

    try {
      // POST application to Next.js API route instead of IndexedDB
      const refNo = `GOV${Date.now().toString().slice(-8)}`;
      const payload = {
        schemeId: scheme.id,
        schemeName: scheme.name,
        formData,
        refNo,
        status: 'Application Received',
      };

      await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // Register in global context so company portals can detect it
      if (formData.pan && scheme.hasPanLogic) {
        registerSchemeBeneficiary(
          formData.pan.toUpperCase(),
          formData.fullName || '',
          formData.mobile || '',
          { id: scheme.id, name: scheme.name, stateId: 'central', benefit: scheme.benefit }
        );
      }

      setSubmitting(false);
      onSuccess({ formData, refNo });
    } catch (err) {
      setSubmitting(false);
      console.error('Failed to submit application:', err);
    }
  };

  if (!eligibility.eligible) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <div className="text-5xl mb-3">🚫</div>
        <h3 className="font-bold text-red-800 text-lg mb-2">You are not eligible for this scheme</h3>
        <p className="text-red-700 text-sm">{eligibility.reason}</p>
        <p className="text-gray-500 text-xs mt-3">Based on your profile and scheme terms & conditions, you do not qualify for this scheme.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-1">
      {user && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 flex items-center gap-2">
          <span className="text-green-600">✅</span>
          <p className="text-xs text-green-700 font-medium">Your profile data has been auto-filled. You may edit if needed.</p>
        </div>
      )}
      {scheme.hasPanLogic && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <p className="font-semibold text-blue-800 text-sm">{scheme.panLogicNote}</p>
              <p className="text-xs text-blue-600 mt-1">
                Your PAN number is verified against the government employment database in real-time.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scheme.formFields.map((field) => (
          <div
            key={field.name}
            className={`form-group ${field.type === 'textarea' || field.type === 'checkbox' ? 'md:col-span-2' : ''}`}
          >
            {field.type === 'checkbox' ? (
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name={field.name}
                  checked={formData[field.name] || false}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                />
                <span className={`text-sm ${errors[field.name] ? 'text-red-600' : 'text-gray-700'}`}>
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </span>
              </label>
            ) : (
              <>
                <label className="form-label">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>

                {field.type === 'select' ? (
                  <select
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    className={`form-input ${errors[field.name] ? 'border-red-400 bg-red-50' : ''}`}
                  >
                    <option value="">-- Select --</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    rows={3}
                    placeholder={field.placeholder}
                    className={`form-input resize-none ${errors[field.name] ? 'border-red-400 bg-red-50' : ''}`}
                  />
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className={`form-input ${errors[field.name] ? 'border-red-400 bg-red-50' : ''}`}
                  />
                )}
              </>
            )}

            {errors[field.name] && (
              <p className="text-red-500 text-xs mt-1">⚠ {errors[field.name]}</p>
            )}

            {field.name === 'pan' && scheme.hasPanLogic && panStatus && (
              <div className={`mt-1.5 text-xs font-medium flex items-center gap-1.5 ${
                panStatus === 'eligible' ? 'text-green-600' :
                panStatus === 'employed' ? 'text-red-600' :
                'text-gray-500'
              }`}>
                {panStatus === 'eligible' && '✅ PAN verified — Eligible for Jubo Shakti'}
                {panStatus === 'employed' && '❌ PAN linked to active employment — Benefits deactivated'}
                {panStatus === 'invalid' && '⚠️ Invalid PAN format (e.g. ABCDE1234F)'}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Document Upload Section */}
      {scheme.documents && scheme.documents.length > 0 && (
        <DocumentUpload
          documents={scheme.documents}
          uploadedFiles={uploadedFiles}
          onFilesChange={setUploadedFiles}
        />
      )}

      <div className="pt-4 border-t border-gray-200 mt-6">
        <div className="bg-gray-50 rounded-xl p-4 mb-4 text-xs text-gray-600">
          <p className="font-semibold mb-1">📋 Declaration</p>
          <p>I hereby declare that all the information provided above is true and correct to the best of my knowledge. I understand that providing false information may lead to cancellation of benefits and legal action.</p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-3 rounded-xl font-bold text-white text-base transition-all duration-200 flex items-center justify-center gap-2 ${
            submitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 shadow-lg hover:shadow-xl'
          }`}
        >
          {submitting ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Submitting Application...
            </>
          ) : (
            <>
              📤 Submit Application
              {Object.keys(uploadedFiles).length > 0 && (
                <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full ml-1">
                  {Object.keys(uploadedFiles).length} docs attached
                </span>
              )}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
