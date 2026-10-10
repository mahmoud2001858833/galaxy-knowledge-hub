import { useState, useRef, useCallback, useEffect } from 'react';
import { resilientStreamingService, type ChatMessage } from '@/services/resilientStreamingService';

export interface UseResilientAIStreamOptions {
  systemInstruction?: string;
  onChunk?: (delta: string, fullText: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
  throttleMs?: number; // default 25ms (approx 40-60 FPS) to prevent React jank
}

export interface StreamPayload {
  prompt: string;
  chatHistory?: ChatMessage[];
  imageBase64?: string;
  mimeType?: string;
}

export function useResilientAIStream(options: UseResilientAIStreamOptions = {}) {
  const {
    systemInstruction,
    onChunk,
    onComplete,
    onError,
    throttleMs = 25,
  } = options;

  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [modelUsed, setModelUsed] = useState<string>('');

  const abortControllerRef = useRef<AbortController | null>(null);
  const pendingBufferRef = useRef<string>('');
  const throttleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fullTextRef = useRef<string>('');

  // Flush buffer to React state in a throttled animation frame
  const flushBuffer = useCallback(() => {
    if (pendingBufferRef.current) {
      setStreamedText(fullTextRef.current);
      pendingBufferRef.current = '';
    }
    throttleTimerRef.current = null;
  }, []);

  const scheduleFlush = useCallback(() => {
    if (!throttleTimerRef.current) {
      throttleTimerRef.current = setTimeout(flushBuffer, throttleMs);
    }
  }, [flushBuffer, throttleMs]);

  const streamMessage = useCallback(async (payload: StreamPayload) => {
    // Abort any prior stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsStreaming(true);
    setStreamedText('');
    setError(null);
    pendingBufferRef.current = '';
    fullTextRef.current = '';

    try {
      const result = await resilientStreamingService.streamAI({
        prompt: payload.prompt,
        systemInstruction,
        chatHistory: payload.chatHistory,
        imageBase64: payload.imageBase64,
        mimeType: payload.mimeType,
        signal: abortController.signal,
        onChunk: (delta, accumulated) => {
          fullTextRef.current = accumulated;
          pendingBufferRef.current += delta;
          scheduleFlush();
          onChunk?.(delta, accumulated);
        },
        onComplete: (completedText) => {
          // Final immediate flush
          if (throttleTimerRef.current) {
            clearTimeout(throttleTimerRef.current);
            throttleTimerRef.current = null;
          }
          setStreamedText(completedText);
          onComplete?.(completedText);
        },
        onError: (err) => {
          setError(err);
          onError?.(err);
        },
      });

      setModelUsed(result.modelUsed);
      return result;
    } catch (err: any) {
      if (!abortController.signal.aborted) {
        setError(err);
      }
      throw err;
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [systemInstruction, scheduleFlush, onChunk, onComplete, onError]);

  const stopStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
    };
  }, []);

  return {
    streamMessage,
    stopStream,
    isStreaming,
    streamedText,
    error,
    modelUsed,
  };
}
