import React from "react";
import { useNavigate } from "react-router-dom";
import { BrainCircuit, BookOpen, Trash2, FileText, Clock } from "lucide-react";
import moment from "moment";

//Helper function to format file size

const formatFileSize = (bytes) => {
  if (bytes === undefined || bytes === null) return "N/A";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const DocumentCard = ({ document, onDelete }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/documents/${document._id}`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(document);
  };

  return (
    <div
      className="group relative flex flex-col justify-between cursor-pointer rounded-2xl border border-slate-200/60 bg-white/80 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-slate-300/60 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50"
      onClick={handleNavigate}
    >
      {/* Header Section*/}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex shrink-0 h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-blue-500/25 transition-transform duration-300 group-hover:scale-110">
            <FileText className="h-6 w-6 text-white" strokeWidth={2} />
          </div>
          <button
            onClick={handleDelete}
            className="flex h-8 w-8 items-center justify-center opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
            aria-label="Delete document"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        {/* Title*/}
        <h3
          className="text-base font-semibold text-slate-900 truncate mb-2"
          title={document.title}
        >
          {document.title}
        </h3>

        {/* Document Info*/}
        <div className="mb-3 flex items-center gap-3 text-xs text-slate-500">
          {document.fileSize !== undefined && (
            <>
              <span className="font-medium">
                {formatFileSize(document.fileSize)}
              </span>
            </>
          )}
        </div>
        {/* Stats Section*/}
        <div className="flex items-center gap-3">
          {document.flashcardCount !== undefined && (
            <div className="flex items-center gap-1.5 rounded-lg bg-purple-50 px-2.5 py-1.5">
              <BookOpen
                className="h-3.5 w-3.5 text-purple-600"
                strokeWidth={2}
              />
              <span className="text-xs font-semibold text-purple-700">
                {document.flashcardCount} Flashcards
              </span>
            </div>
          )}
          {document.quizCount !== undefined && (
            <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5">
              <BrainCircuit
                className="h-3.5 w-3.5 text-emerald-600"
                strokeWidth={2}
              />
              <span className="text-xs font-semibold text-emerald-700">
                {document.quizCount} Quizzes
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Section*/}
      <div className="mt-5 pt-4 flex border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock className="h-3.5 w-3.5" strokeWidth={2} />
          <span className="whitespace-nowrap">
            Uploaded {moment(document.createdAt).fromNow()}
          </span>
        </div>
      </div>

      {/* Hover Indicator*/}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/0 to-teal-500/0 transition-all duration-300 group-hover:from-emerald-500/5 group-hover:to-teal-500/5" />
    </div>
  );
};

export default DocumentCard;
