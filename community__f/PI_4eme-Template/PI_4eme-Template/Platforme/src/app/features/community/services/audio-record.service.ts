import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AudioRecordService {
  private readonly recordingSubject = new BehaviorSubject<boolean>(false);
  readonly isRecording$ = this.recordingSubject.asObservable();

  private mediaRecorder: MediaRecorder | null = null;
  private activeStream: MediaStream | null = null;
  private chunks: BlobPart[] = [];
  private stopPromise: Promise<Blob> | null = null;
  private stopResolver: ((blob: Blob) => void) | null = null;
  private stopRejecter: ((reason?: unknown) => void) | null = null;

  get isRecording(): boolean {
    return this.recordingSubject.value;
  }

  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      typeof navigator.mediaDevices !== 'undefined' &&
      typeof navigator.mediaDevices.getUserMedia === 'function' &&
      typeof MediaRecorder !== 'undefined'
    );
  }

  async startRecording(): Promise<void> {
    if (this.isRecording) {
      throw new Error('Audio recording is already in progress.');
    }

    if (!this.isSupported()) {
      throw new Error('Audio recording is not supported in this browser.');
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = this.pickMimeType();

    this.activeStream = stream;
    this.chunks = [];
    this.mediaRecorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);

    this.stopPromise = new Promise<Blob>((resolve, reject) => {
      this.stopResolver = resolve;
      this.stopRejecter = reject;
    });

    this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data && event.data.size > 0) {
        this.chunks.push(event.data);
      }
    };

    this.mediaRecorder.onerror = () => {
      this.rejectStopPromise(new Error('An error occurred while recording audio.'));
      this.cleanupRecorder();
    };

    this.mediaRecorder.onstop = () => {
      const type = this.mediaRecorder?.mimeType || 'audio/webm';
      const blob = new Blob(this.chunks, { type });
      this.resolveStopPromise(blob);
      this.cleanupRecorder();
    };

    this.mediaRecorder.start();
    this.recordingSubject.next(true);
  }

  async stopRecording(): Promise<Blob> {
    if (!this.mediaRecorder || !this.isRecording || !this.stopPromise) {
      throw new Error('No active recording found.');
    }

    if (this.mediaRecorder.state === 'recording') {
      try {
        this.mediaRecorder.requestData();
      } catch {
        // Ignore; some browsers throw when no data chunk is ready yet.
      }
    }

    this.mediaRecorder.stop();
    return this.stopPromise;
  }

  cancelRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
    }
  }

  private cleanupRecorder(): void {
    this.recordingSubject.next(false);

    this.mediaRecorder = null;
    this.chunks = [];
    this.stopPromise = null;
    this.stopResolver = null;
    this.stopRejecter = null;

    if (this.activeStream) {
      this.activeStream.getTracks().forEach((track) => track.stop());
    }

    this.activeStream = null;
  }

  private resolveStopPromise(blob: Blob): void {
    if (this.stopResolver) {
      this.stopResolver(blob);
    }
  }

  private rejectStopPromise(error: Error): void {
    if (this.stopRejecter) {
      this.stopRejecter(error);
    }
  }

  private pickMimeType(): string | undefined {
    if (typeof MediaRecorder.isTypeSupported !== 'function') {
      return undefined;
    }

    const candidates = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      'audio/mp4',
      'audio/wav',
      'audio/mpeg'
    ];

    for (const candidate of candidates) {
      if (MediaRecorder.isTypeSupported(candidate)) {
        return candidate;
      }
    }

    return undefined;
  }
}
