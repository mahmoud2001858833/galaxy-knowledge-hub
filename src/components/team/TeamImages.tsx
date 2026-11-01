import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { errorMessage, signedImageUrl, uploadTeamImage } from './teamApi';

/** Shows a private team image through a short-lived signed URL. */
export const TeamImage: React.FC<{ path: string; className?: string }> = ({ path, className }) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    signedImageUrl(path).then((u) => active && setUrl(u));
    return () => {
      active = false;
    };
  }, [path]);

  if (!url) return <div className={`animate-pulse bg-muted ${className ?? ''}`} />;
  return (
    <a href={url} target="_blank" rel="noreferrer">
      <img src={url} alt="" loading="lazy" className={`object-cover ${className ?? ''}`} />
    </a>
  );
};

/** Uploads images to the team bucket and reports their storage paths. */
export const ImagePicker: React.FC<{
  value: string[];
  onChange: (paths: string[]) => void;
  label?: string;
  max?: number;
}> = ({ value, onChange, label = 'إرفاق صور', max = 10 }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const added: string[] = [];
    try {
      for (const file of Array.from(files).slice(0, max - value.length)) {
        added.push(await uploadTeamImage(file));
      }
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      onChange([...value, ...added]);
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((p) => (
          <div key={p} className="relative">
            <TeamImage path={p} className="h-20 w-20 rounded-xl border border-border" />
            <button
              type="button"
              onClick={() => onChange(value.filter((x) => x !== p))}
              className="absolute -top-2 -left-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow"
              aria-label="إزالة الصورة"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border text-xs text-muted-foreground transition hover:border-primary hover:text-primary disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
            {label}
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
    </div>
  );
};
