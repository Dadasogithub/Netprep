import { useEffect, useMemo, useRef, useState } from "react";
import {
  FolderPlus,
  Folder,
  NotebookText,
  FileText,
  Trash2,
  UploadCloud,
  Eye,
  X,
  ExternalLink,
} from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import { Button, EmptyState } from "../components/ui";
import {
  getNoteFolders,
  createNoteFolder,
  deleteNoteFolder,
  addNoteToFolder,
  deleteNote,
} from "../services/storageService";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();

function formatBytes(bytes) {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  const size = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** size;
  return `${value.toFixed(value >= 10 || size === 0 ? 0 : 1)} ${units[size]}`;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the uploaded file."));
    reader.readAsDataURL(file);
  });
}

async function extractTextFromPdf(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => (typeof item?.str === "string" ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (text) pages.push(text);
  }

  return pages.join("\n\n");
}

async function extractTextFromFile(file) {
  const name = file.name.toLowerCase();

  if (name.endsWith(".pdf")) {
    return extractTextFromPdf(file);
  }

  if (name.endsWith(".docx")) {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value || "";
  }

  if (name.endsWith(".txt") || name.endsWith(".md") || name.endsWith(".json") || name.endsWith(".html")) {
    return file.text();
  }

  throw new Error("Only PDF, DOCX, TXT, MD, JSON, and HTML files are supported.");
}

export default function Notes() {
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [viewingNote, setViewingNote] = useState(null);
  const [status, setStatus] = useState({ type: "info", message: "" });
  const [confirmDeleteFolderId, setConfirmDeleteFolderId] = useState(null);
  const [confirmDeleteNoteId, setConfirmDeleteNoteId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const previewNote = viewingNote || null;

  useEffect(() => {
    const nextFolders = getNoteFolders();
    setFolders(nextFolders);
    if (nextFolders[0]) setSelectedFolderId(nextFolders[0].id);
  }, []);

  const selectedFolder = useMemo(
    () => folders.find((folder) => folder.id === selectedFolderId) || null,
    [folders, selectedFolderId]
  );

  const currentFolderNotes = selectedFolder?.notes || [];
  const supportedTypes = ["PDF", "DOCX", "TXT", "MD", "JSON", "HTML"];

  const createFolder = () => {
    const name = newFolderName.trim();
    if (!name) {
      setStatus({ type: "error", message: "Please enter a folder name before creating it." });
      return;
    }

    try {
      const folder = createNoteFolder(name);
      const nextFolders = getNoteFolders();
      setFolders(nextFolders);
      setSelectedFolderId(folder.id);
      setNewFolderName("");
      setStatus({ type: "success", message: `Folder "${folder.name}" is ready.` });
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Could not create folder." });
    }
  };

  const removeFolder = (folderId) => {
    if (confirmDeleteFolderId !== folderId) {
      setConfirmDeleteFolderId(folderId);
      return;
    }

    deleteNoteFolder(folderId);
    const nextFolders = getNoteFolders();
    setFolders(nextFolders);
    setSelectedFolderId(nextFolders[0]?.id || "");
    setViewingNote(null);
    setConfirmDeleteFolderId(null);
    setStatus({ type: "success", message: "Folder removed successfully." });
  };

  const uploadNotes = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    if (!selectedFolder) {
      setStatus({ type: "error", message: "Choose or create a folder before uploading a note." });
      event.target.value = "";
      return;
    }

    setUploading(true);
    try {
      let added = 0;
      for (const file of files) {
        const content = await extractTextFromFile(file);
        const fileDataUrl = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf") ? await fileToDataUrl(file) : null;
        addNoteToFolder(selectedFolder.id, {
          name: file.name,
          type: file.name.split(".").pop()?.toUpperCase() || "FILE",
          size: file.size,
          content,
          source: "upload",
          fileDataUrl,
          mimeType: file.type || (file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "application/octet-stream"),
        });
        added += 1;
      }

      const nextFolders = getNoteFolders();
      setFolders(nextFolders);
      setStatus({ type: "success", message: `${added} note${added > 1 ? "s" : ""} added to ${selectedFolder.name}.` });
      setViewingNote(null);
    } catch (error) {
      setStatus({ type: "error", message: error.message || "Could not read this file." });
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const removeNote = (folderId, noteId) => {
    if (confirmDeleteNoteId !== noteId) {
      setConfirmDeleteNoteId(noteId);
      return;
    }

    deleteNote(folderId, noteId);
    const nextFolders = getNoteFolders();
    setFolders(nextFolders);
    setViewingNote((current) => (current?.id === noteId ? null : current));
    setConfirmDeleteNoteId(null);
    setStatus({ type: "success", message: "Note deleted successfully." });
  };

  const previewText = (content) => {
    if (!content) return "No readable text was found in this file.";
    const clean = content.replace(/\s+/g, " ").trim();
    return clean.length > 2600 ? `${clean.slice(0, 2600)}...` : clean;
  };

  const modalPdfSrc = previewNote?.type === "PDF" ? previewNote.fileDataUrl : null;
  const modalTextContent = previewNote && !modalPdfSrc ? previewText(previewNote.content) : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold mb-1 flex items-center gap-2">
            <NotebookText size={22} className="text-signal-500" /> Notes
          </h1>
          <p className="text-sm text-navy-500 dark:text-mist-200/60">
            Keep PDFs, Word notes, and revision snippets in one place and revisit them anytime.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {supportedTypes.map((type) => (
            <span
              key={type}
              className="rounded-full border border-signal-500/20 bg-signal-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-signal-700 dark:text-signal-400"
            >
              {type}
            </span>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-5">
        <aside className="surface rounded-2xl p-4 space-y-4">
          <div className="flex gap-2">
            <input
              value={newFolderName}
              onChange={(event) => setNewFolderName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") createFolder();
              }}
              placeholder="New folder name"
              className="flex-1 rounded-xl border border-mist-200 dark:border-navy-700 bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-signal-500/30"
            />
            <Button onClick={createFolder} className="px-3">
              <FolderPlus size={15} />
            </Button>
          </div>

          <div className="space-y-2">
            {folders.length === 0 ? (
              <div className="rounded-xl border border-dashed border-mist-300 dark:border-navy-700 px-3 py-6 text-center text-sm text-navy-500 dark:text-mist-200/60">
                No folders yet
              </div>
            ) : (
              folders.map((folder) => (
                <div
                  key={folder.id}
                  className={`flex items-center justify-between rounded-xl border p-2.5 transition-all ${
                    selectedFolderId === folder.id
                      ? "border-signal-500 bg-signal-500/10 shadow-sm"
                      : "border-mist-200 dark:border-navy-700 hover:bg-mist-50 dark:hover:bg-navy-800/60"
                  }`}
                >
                  <button
                    onClick={() => setSelectedFolderId(folder.id)}
                    className="flex flex-1 items-center gap-2 text-left min-w-0"
                  >
                    <div className="w-8 h-8 rounded-lg bg-signal-500/10 flex items-center justify-center shrink-0">
                      <Folder size={16} className="text-signal-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-sm font-medium truncate">{folder.name}</span>
                      <span className="block text-[10px] text-navy-400 dark:text-mist-200/40">
                        {folder.notes.length} saved
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => removeFolder(folder.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 transition-colors"
                    aria-label={`Delete ${folder.name}`}
                  >
                    {confirmDeleteFolderId === folder.id ? <X size={15} /> : <Trash2 size={14} />}
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        <section className="space-y-4">
          {selectedFolder ? (
            <>
              <div className="surface rounded-2xl p-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-display text-xl font-semibold">{selectedFolder.name}</p>
                  <p className="text-xs text-navy-500 dark:text-mist-200/60">
                    {currentFolderNotes.length} note{currentFolderNotes.length !== 1 ? "s" : ""} saved in this folder.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    <UploadCloud size={15} /> {uploading ? "Uploading..." : "Upload notes"}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.txt,.md,.json,.html"
                    onChange={uploadNotes}
                    className="hidden"
                  />
                </div>
              </div>

              {status.message && (
                <div
                  className={`rounded-xl border px-3 py-2.5 text-sm ${
                    status.type === "error"
                      ? "border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      : status.type === "success"
                        ? "border-mint-500/25 bg-mint-500/10 text-mint-700 dark:text-mint-400"
                        : "border-signal-500/25 bg-signal-500/10 text-signal-700 dark:text-signal-400"
                  }`}
                >
                  {status.message}
                </div>
              )}

              {currentFolderNotes.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No notes in this folder yet"
                  description="Upload a PDF, Word file, or text note to build a quick revision stack for this topic."
                />
              ) : (
                <div className="space-y-3">
                  {currentFolderNotes.map((note) => (
                    <div
                      key={note.id}
                      className="surface rounded-2xl p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-signal-500/10 flex items-center justify-center shrink-0">
                          <FileText size={18} className="text-signal-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold truncate">{note.name}</p>
                          <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-navy-500 dark:text-mist-200/60">
                            <span className="rounded-full bg-mist-100 dark:bg-navy-800 px-2 py-0.5">{note.type}</span>
                            <span>{formatBytes(note.size || 0)}</span>
                            <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="secondary" onClick={() => setViewingNote(note)}>
                          <Eye size={14} /> View
                        </Button>
                        <Button
                          variant={confirmDeleteNoteId === note.id ? "danger" : "secondary"}
                          onClick={() => removeNote(selectedFolder.id, note.id)}
                          className="px-3"
                        >
                          {confirmDeleteNoteId === note.id ? "Confirm" : <Trash2 size={14} />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {viewingNote && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 p-3 sm:p-6 backdrop-blur-sm">
                  <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-mist-200 dark:border-navy-700 bg-white dark:bg-navy-900 shadow-2xl">
                    <div className="flex items-center justify-between gap-3 border-b border-mist-200 dark:border-navy-700 bg-mist-50 dark:bg-navy-950/80 px-4 py-3 sm:px-5">
                      <div className="min-w-0">
                        <p className="font-display font-semibold truncate">{viewingNote.name}</p>
                        <p className="text-[11px] text-navy-500 dark:text-mist-200/60">
                          {viewingNote.type} • {formatBytes(viewingNote.size || 0)}
                        </p>
                      </div>
                      <button
                        onClick={() => setViewingNote(null)}
                        className="p-2 rounded-lg hover:bg-mist-100 dark:hover:bg-navy-800 transition-colors"
                        aria-label="Close note preview"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {modalPdfSrc ? (
                      <div className="overflow-hidden bg-white">
                        <div className="flex items-center justify-between border-b border-mist-200 dark:border-navy-700 bg-mist-50 dark:bg-navy-950/80 px-3 py-2 text-[11px] text-navy-500 dark:text-mist-200/60">
                          <span>{viewingNote.type} preview</span>
                          <a href={modalPdfSrc} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-signal-600 dark:text-signal-400 font-medium">
                            Open in new tab <ExternalLink size={12} />
                          </a>
                        </div>
                        <iframe
                          title={viewingNote.name}
                          src={modalPdfSrc}
                          className="w-full h-[75vh] min-h-[420px] bg-white"
                        />
                      </div>
                    ) : (
                      <div className="max-h-[75vh] overflow-auto bg-mist-50 dark:bg-navy-950 p-4 sm:p-5 text-sm leading-7 whitespace-pre-wrap text-navy-700 dark:text-mist-100">
                        <div className="mb-3 flex items-center justify-between gap-2 border-b border-mist-200 dark:border-navy-700 pb-2 text-[11px] uppercase tracking-[0.08em] text-navy-500 dark:text-mist-200/60">
                          <span>{viewingNote.type} content</span>
                          <span>{viewingNote.content ? `${viewingNote.content.length} chars` : "empty"}</span>
                        </div>
                        {modalTextContent}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={NotebookText}
              title="No notes folder selected"
              description="Create your first folder on the left to organize your PDF and revision notes."
            />
          )}
        </section>
      </div>
    </div>
  );
}
