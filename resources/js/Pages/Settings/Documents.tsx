import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import SettingsLayout from '@/Layouts/SettingsLayout';
import { useRef, useState, useMemo, useEffect } from 'react';

/* ── Icons ── */
const IcoUpload = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
        <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);
const IcoPDF = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
        <line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="15" y2="17" /><polyline points="9 9 10 9" />
    </svg>
);
const IcoPNG = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
        <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
    </svg>
);
const IcoDoc = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-avaa-teal">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
);
const IcoEye = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
);
const IcoDownload = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);
const IcoTrash = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
        <path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
    </svg>
);

/* ── Types ── */
export interface DocumentItem {
    id: number;
    file_name: string;
    file_type: string;
    file_size_kb: number;
    document_type: string;
    uploaded_at: string;
}

interface Props {
    documents: DocumentItem[];
}

/* ── Filter tabs config ── */
const FILTERS = [
    { label: 'All', match: (_: string) => true },
    { label: 'PDF', match: (t: string) => t === 'PDF' },
    { label: 'Word', match: (t: string) => t === 'DOC' || t === 'DOCX' },
    { label: 'Image', match: (t: string) => ['PNG', 'JPG', 'JPEG'].includes(t) },
] as const;

/* ── Helpers ── */
function fileIcon(type: string) {
    const t = type.toUpperCase();
    if (t === 'PDF') return <IcoPDF />;
    if (t === 'PNG' || t === 'JPG' || t === 'JPEG') return <IcoPNG />;
    return <IcoDoc />;
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatSize(kb: number) {
    return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}

/* ── Delete confirm mini-modal ── */
function DeleteConfirm({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/25 z-50 flex items-center justify-center p-4" onClick={onCancel}>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
                <p className="text-sm font-semibold text-avaa-dark mb-1">Delete document?</p>
                <p className="text-xs text-avaa-muted mb-4">"{name}" will be permanently removed.</p>
                <div className="flex gap-2">
                    <button onClick={onCancel}
                        className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm}
                        className="flex-1 px-3 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════ */
export default function Documents({ documents: initialDocs }: Props) {
    const [docs, setDocs] = useState<DocumentItem[]>(initialDocs ?? []);
    const [dragging, setDragging] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
    const [deleteTarget, setDeleteTarget] = useState<DocumentItem | null>(null);
    const [activeFilter, setActiveFilter] = useState(0); // index into FILTERS
    const fileRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setDocs(initialDocs ?? []);
    }, [initialDocs]);

    /* ── Filtered list ── */
    const filtered = useMemo(() =>
        docs.filter(d => FILTERS[activeFilter].match(d.file_type)),
        [docs, activeFilter]
    );

    /* ── Upload ── */
    const handleFiles = (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const fileArray = Array.from(files);
        setUploadingFiles(fileArray.map(f => f.name));

        const fd = new FormData();
        fileArray.forEach((file, i) => {
            fd.append(`documents[${i}]`, file);
        });
        fd.append('_method', 'POST');

        router.post(route('settings.documents.store'), fd, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => setUploadingFiles([]),
        });
    };

    /* ── Delete ── */
    const handleDelete = (doc: DocumentItem) => {
        setDeleteTarget(null);
        router.delete(route('settings.documents.destroy', doc.id), {
            preserveScroll: true,
            onSuccess: () => setDocs(d => d.filter(x => x.id !== doc.id)),
        });
    };

    /* ── View (open in new tab) ── */
    const handleView = (doc: DocumentItem) => {
        window.open(route('settings.documents.download', doc.id), '_blank', 'noopener,noreferrer');
    };

    /* ── Download (force download) ── */
    const handleDownload = (doc: DocumentItem) => {
        const a = document.createElement('a');
        a.href = route('settings.documents.download', doc.id);
        a.download = doc.file_name;
        a.click();
    };

    return (
        <>
            <Head title="Documents" />
            {deleteTarget && (
                <DeleteConfirm
                    name={deleteTarget.file_name}
                    onConfirm={() => handleDelete(deleteTarget)}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}

            <AppLayout pageTitle="Settings" pageSubtitle="Manage your preferences" activeNav="Profile">
                <SettingsLayout title="Resume & Documents" subtitle="Manage your primary resume and supporting certifications for client matching.">

                    {/* ── Upload zone ── */}
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100">
                            <h3 className="text-sm font-semibold text-avaa-dark">Upload Document</h3>
                            <p className="text-xs text-avaa-muted mt-0.5">PDF, DOC, DOCX, PNG, JPG up to 25 MB</p>
                        </div>
                        <div className="p-6">
                            <div
                                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
                                onClick={() => fileRef.current?.click()}
                                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
                                    ${dragging
                                        ? 'border-avaa-primary bg-avaa-primary-light/40'
                                        : 'border-gray-200 hover:border-avaa-primary hover:bg-avaa-primary-light/20'
                                    }`}
                            >
                                {uploadingFiles.length > 0 ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <svg className="w-8 h-8 text-avaa-primary animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        <div className="text-center">
                                            <p className="text-sm font-semibold text-avaa-dark">Uploading {uploadingFiles.length} file{uploadingFiles.length !== 1 ? 's' : ''}…</p>
                                            <p className="text-xs text-avaa-muted mt-1 max-w-[200px] truncate mx-auto">
                                                {uploadingFiles.join(', ')}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-center mb-3"><IcoUpload /></div>
                                        <p className="text-sm font-medium text-gray-600">Click or drag files here to upload</p>
                                        <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, PNG, JPG up to 25 MB</p>
                                        <button type="button"
                                            className="mt-4 px-5 py-2 bg-avaa-primary hover:bg-avaa-primary-hover text-white text-sm font-semibold rounded-xl transition-colors">
                                            Select File
                                        </button>
                                    </>
                                )}
                            </div>
                            <input ref={fileRef} type="file" className="hidden"
                                multiple
                                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                onChange={e => handleFiles(e.target.files)} />
                        </div>
                    </div>

                    {/* ── Documents list ── */}
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        {/* Header + filter tabs */}
                        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-semibold text-avaa-dark">Active Documents</h3>
                                <p className="text-xs text-avaa-muted mt-0.5">{docs.length} file{docs.length !== 1 ? 's' : ''} total</p>
                            </div>

                            {/* Filter tabs */}
                            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                                {FILTERS.map((f, i) => {
                                    const count = docs.filter(d => f.match(d.file_type)).length;
                                    return (
                                        <button
                                            key={f.label}
                                            onClick={() => setActiveFilter(i)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeFilter === i
                                                    ? 'bg-white text-avaa-dark shadow-sm'
                                                    : 'text-gray-500 hover:text-avaa-dark'
                                                }`}
                                        >
                                            {f.label}
                                            {count > 0 && (
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeFilter === i
                                                        ? 'bg-avaa-primary-light text-avaa-teal'
                                                        : 'bg-gray-200 text-gray-500'
                                                    }`}>
                                                    {count}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {filtered.length > 0 ? (
                            <>
                                {/* Table header */}
                                <div className="hidden sm:grid grid-cols-[1fr_80px_70px_110px_110px] gap-4 px-6 py-2.5 border-b border-gray-50 bg-gray-50/60">
                                    {['File Name', 'Type', 'Size', 'Date', 'Actions'].map(h => (
                                        <p key={h} className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{h}</p>
                                    ))}
                                </div>

                                {/* Rows */}
                                <div className="divide-y divide-gray-50">
                                    {filtered.map(doc => (
                                        <div key={doc.id}
                                            className="grid grid-cols-1 sm:grid-cols-[1fr_80px_70px_110px_110px] gap-2 sm:gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors">

                                            {/* File name + type badge */}
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                                                    {fileIcon(doc.file_type)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-avaa-dark truncate">{doc.file_name}</p>
                                                    <p className="text-[11px] text-avaa-muted capitalize">{doc.document_type}</p>
                                                </div>
                                            </div>

                                            {/* Type */}
                                            <div className="flex items-center gap-2 sm:block">
                                                <span className="sm:hidden text-[10px] uppercase tracking-wide text-gray-400 w-14">Type</span>
                                                <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md ${doc.file_type === 'PDF' ? 'bg-red-50 text-red-500' :
                                                        ['DOC', 'DOCX'].includes(doc.file_type) ? 'bg-blue-50 text-blue-500' :
                                                            'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {doc.file_type}
                                                </span>
                                            </div>

                                            {/* Size */}
                                            <div className="flex items-center gap-2 sm:block">
                                                <span className="sm:hidden text-[10px] uppercase tracking-wide text-gray-400 w-14">Size</span>
                                                <span className="text-sm text-avaa-dark">{formatSize(doc.file_size_kb)}</span>
                                            </div>

                                            {/* Date */}
                                            <div className="flex items-center gap-2 sm:block">
                                                <span className="sm:hidden text-[10px] uppercase tracking-wide text-gray-400 w-14">Date</span>
                                                <span className="text-sm text-avaa-dark">{formatDate(doc.uploaded_at)}</span>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    onClick={() => handleView(doc)}
                                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-500 hover:border-avaa-primary hover:text-avaa-teal transition-all"
                                                    title="View in browser">
                                                    <IcoEye /> View
                                                </button>
                                                <button
                                                    onClick={() => handleDownload(doc)}
                                                    className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-avaa-primary hover:text-avaa-teal transition-all"
                                                    title="Download">
                                                    <IcoDownload />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteTarget(doc)}
                                                    className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-red-200 hover:text-red-500 transition-all"
                                                    title="Delete">
                                                    <IcoTrash />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            /* Empty state */
                            <div className="p-10 text-center">
                                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                                    <IcoDoc />
                                </div>
                                {docs.length === 0 ? (
                                    <>
                                        <p className="text-sm font-medium text-avaa-dark">No documents yet</p>
                                        <p className="text-xs text-avaa-muted mt-1">Upload your resume or certifications above.</p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm font-medium text-avaa-dark">No {FILTERS[activeFilter].label} files</p>
                                        <p className="text-xs text-avaa-muted mt-1">Try a different filter or upload a {FILTERS[activeFilter].label} file.</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                </SettingsLayout>
            </AppLayout>
        </>
    );
}