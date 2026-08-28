import { useState, useEffect, useRef } from 'react';
import api from '../lib/api';

export interface NoteStatusData {
  noteId: string;
  title: string;
  status: 'recording' | 'uploaded' | 'transcribing' | 'processing' | 'ready' | 'failed';
  progress: number;
  hasTranscript: boolean;
  hasSummary: boolean;
  hasQuiz: boolean;
  errorMessage?: string;
  isComplete: boolean;
  isFailed: boolean;
}

export function useNoteStatusPolling(noteId: string | null, intervalMs = 2500, enabled = true) {
  const [data, setData] = useState<NoteStatusData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!noteId || !enabled) {
      setIsPolling(false);
      return;
    }

    let isMounted = true;

    const poll = async () => {
      try {
        const res = await api.get(`/notes/${noteId}/status`);
        if (!isMounted) return;

        const statusData: NoteStatusData = res.data.data;
        setData(statusData);
        setError(null);

        if (statusData.isComplete || statusData.isFailed) {
          setIsPolling(false);
          return; // Stop polling when finished
        }

        timerRef.current = window.setTimeout(poll, intervalMs);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.response?.data?.error || 'Failed to fetch status.');
        timerRef.current = window.setTimeout(poll, intervalMs * 2); // Backoff on error
      }
    };

    setIsPolling(true);
    poll();

    return () => {
      isMounted = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [noteId, enabled, intervalMs]);

  return { statusData: data, error, isPolling };
}
