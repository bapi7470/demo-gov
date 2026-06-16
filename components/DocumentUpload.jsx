import { useState, useRef } from 'react';

const ACCEPTED = '.pdf,.jpg,.jpeg,.png,.heic';
const MAX_SIZE_MB = 5;

const FILE_ICONS = {
  'application/pdf': '📄',
  'image/jpeg':      '🖼️',
  'image/jpg':       '🖼️',
  'image/png':       '🖼️',
  'image/heic':      '🖼️',
};

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function FileRow({ docName, required, file, onSelect, onRemove }) {
  const inputRef = useRef();

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      alert(`File too large. Max ${MAX_SIZE_MB}MB allowed.`);
      return;
    }
    onSelect(docName, f);
    e.target.value = '';
  };

  const isUploaded = !!file;
  const icon = isUploaded ? FILE_ICONS[file.type] || '📎' : null;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
      isUploaded
        ? 'border-green-300 bg-green-50'
        : required
        ? 'border-dashed border-red-200 bg-red-50/30'
        : 'border-dashed border-gray-200 bg-gray-50'
    }`}>
      {/* Status icon */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${
        isUploaded ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
      }`}>
        {isUploaded ? '✓' : required ? '!' : '○'}
      </div>

      {/* Doc name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-700 truncate">
          {docName}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </p>
        {isUploaded ? (
          <p className="text-xs text-green-600 truncate flex items-center gap-1">
            {icon} {file.name} <span className="text-gray-400">({formatSize(file.size)})</span>
          </p>
        ) : (
          <p className="text-xs text-gray-400">
            {required ? 'Required · ' : 'Optional · '}PDF, JPG, PNG · Max {MAX_SIZE_MB}MB
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-1.5 flex-shrink-0">
        {isUploaded ? (
          <button
            type="button"
            onClick={() => onRemove(docName)}
            className="text-xs text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
          >
            ✕ Remove
          </button>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors font-medium border border-blue-200"
          >
            📎 Upload
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          onChange={handleFile}
          className="hidden"
        />
      </div>
    </div>
  );
}

export default function DocumentUpload({ documents = [], uploadedFiles, onFilesChange }) {
  // documents: string[] — list of required + optional documents
  // uploadedFiles: { [docName]: File }
  // onFilesChange: (files) => void

  if (!documents || documents.length === 0) return null;

  const handleSelect = (docName, file) => {
    onFilesChange({ ...uploadedFiles, [docName]: file });
  };

  const handleRemove = (docName) => {
    const updated = { ...uploadedFiles };
    delete updated[docName];
    onFilesChange(updated);
  };

  const uploadedCount  = Object.keys(uploadedFiles || {}).length;
  const requiredDocs   = documents; // treat all as required
  const allUploaded    = requiredDocs.every(d => uploadedFiles?.[d]);

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
          📎 Upload Documents
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            allUploaded
              ? 'bg-green-100 text-green-700'
              : uploadedCount > 0
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-500'
          }`}>
            {uploadedCount}/{documents.length} uploaded
          </span>
        </h3>
        {allUploaded && (
          <span className="text-xs text-green-600 font-semibold">✅ All documents uploaded</span>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 flex gap-2">
        <span className="text-amber-500 flex-shrink-0">ℹ️</span>
        <p className="text-xs text-amber-700">
          Upload clear scanned copies or photos. Accepted formats: PDF, JPG, PNG. Max size: {MAX_SIZE_MB}MB per file.
          Documents marked with <span className="text-red-500 font-bold">*</span> are mandatory.
        </p>
      </div>

      <div className="space-y-2">
        {documents.map((doc) => (
          <FileRow
            key={doc}
            docName={doc}
            required={true}
            file={uploadedFiles?.[doc] || null}
            onSelect={handleSelect}
            onRemove={handleRemove}
          />
        ))}
      </div>

      {!allUploaded && uploadedCount > 0 && (
        <p className="text-xs text-amber-600 mt-2 font-medium">
          ⚠️ {documents.length - uploadedCount} document(s) still pending
        </p>
      )}
    </div>
  );
}
