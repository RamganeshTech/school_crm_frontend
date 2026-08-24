// ArchiveDataViewer.tsx
import { useState } from "react";

const NOISE_KEYS = new Set(["__v", "_id", "schoolId"]);
const DATE_KEY_HINT = /(At|Date)$/;

function isISODateString(v: unknown): v is string {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v);
}

function formatPrimitive(key: string, value: any): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (isISODateString(value) || DATE_KEY_HINT.test(key)) {
    const d = new Date(value);
    return isNaN(d.getTime()) ? String(value) : d.toLocaleString();
  }
  return String(value);
}

function humanizeKey(key: string): string {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()).trim();
}

function ArchiveNode({ label, value, depth = 0 }: { label: string; value: any; depth?: number }) {
  const [open, setOpen] = useState(depth < 1); // auto-expand only the first level

  if (value === null || value === undefined || typeof value !== "object") {
    return (
      <div className="flex justify-between gap-4 py-1.5 border-b border-border/50 text-sm">
        <span className="text-muted-foreground">{humanizeKey(label)}</span>
        <span className="text-foreground font-medium text-right">{formatPrimitive(label, value)}</span>
      </div>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <div className="flex justify-between py-1.5 border-b border-border/50 text-sm">
          <span className="text-muted-foreground">{humanizeKey(label)}</span>
          <span className="text-muted-foreground">None</span>
        </div>
      );
    }
    const allPrimitive = value.every((v) => typeof v !== "object" || v === null);
    if (allPrimitive) {
      return (
        <div className="flex justify-between gap-4 py-1.5 border-b border-border/50 text-sm">
          <span className="text-muted-foreground">{humanizeKey(label)}</span>
          <span className="text-foreground font-medium text-right">{value.map((v) => formatPrimitive(label, v)).join(", ")}</span>
        </div>
      );
    }
    return (
      <div className="py-1.5 border-b border-border/50">
        <button onClick={() => setOpen((o) => !o)} className="flex justify-between w-full text-sm text-left">
          <span className="text-muted-foreground">{humanizeKey(label)}</span>
          <span className="text-primary text-xs">{open ? "Hide" : `${value.length} item${value.length > 1 ? "s" : ""}`}</span>
        </button>
        {open && (
          <div className="pl-3 mt-1 border-l border-border space-y-1">
            {value.map((item, i) => (
              <div key={i} className="pl-2">
                <div className="text-xs text-muted-foreground mb-0.5">#{i + 1}</div>
                <ArchiveNode label="" value={item} depth={depth + 1} />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // plain object
  const entries = Object.entries(value).filter(([k]) => !NOISE_KEYS.has(k));
  if (entries.length === 0) return null;

  const body = (
    <div className={depth > 0 ? "pl-3 border-l border-border space-y-0.5 mt-1" : "space-y-0.5"}>
      {entries.map(([k, v]) => (
        <ArchiveNode key={k} label={k} value={v} depth={depth + 1} />
      ))}
    </div>
  );

  if (!label) return body; // top-level or array item — no header needed

  return (
    <div className="py-1.5 border-b border-border/50">
      <button onClick={() => setOpen((o) => !o)} className="flex justify-between w-full text-sm text-left">
        <span className="text-muted-foreground">{humanizeKey(label)}</span>
        <span className="text-primary text-xs">{open ? "Hide" : "View"}</span>
      </button>
      {open && body}
    </div>
  );
}

export function ArchiveDataViewer({ deletedData }: { deletedData: Record<string, any> }) {
  return <ArchiveNode label="" value={deletedData} depth={0} />;
}


const HEADLINE_KEYS = ["name", "title", "className", "sectionName", "clubName", "subject", "label", "fullName"];

export function getArchiveHeadline(category: string, deletedData: Record<string, any>): string {
  for (const key of HEADLINE_KEYS) {
    if (deletedData?.[key]) return String(deletedData[key]);
  }
  return `${category} record`;
}