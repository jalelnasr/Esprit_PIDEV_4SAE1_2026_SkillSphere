import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { defer, Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly isBrowser =
    typeof window !== 'undefined' &&
    typeof crypto !== 'undefined';

  private readonly allowedMimeTypes = new Set([
    'audio/mpeg',
    'audio/wav',
    'audio/webm',
    'audio/mp4',
    'audio/ogg'
  ]);
  private readonly maxVoiceSizeBytes = environment.supabase.maxVoiceSizeBytes;
  private readonly bucket = environment.supabase.voiceMessagesBucket;
  private readonly client: SupabaseClient | null = this.isBrowser
    ? createClient(environment.supabase.url, environment.supabase.publishableKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      })
    : null;

  uploadVoiceMessage(blob: Blob): Observable<string> {
    return defer(async () => {
      if (!this.client) {
        throw new Error('Voice upload is only available in browser context.');
      }

      const mimeType = this.resolveMimeType(blob.type);
      this.validateBlob(blob, mimeType);

      const extension = this.resolveExtension(mimeType);
      const fileName = `${Date.now()}-${this.generateId()}.${extension}`;
      const contentType = this.resolveUploadContentType(blob.type, mimeType);

      const { error } = await this.client.storage
        .from(this.bucket)
        .upload(fileName, blob, {
          upsert: false,
          contentType
        });

      if (error) {
        throw new Error(`Supabase upload failed: ${error.message}`);
      }

      const { data } = this.client.storage
        .from(this.bucket)
        .getPublicUrl(fileName);

      if (!data?.publicUrl) {
        throw new Error('Supabase did not return a public URL for uploaded voice message.');
      }

      return data.publicUrl;
    }).pipe(
      catchError((error: unknown) =>
        throwError(() => new Error(this.normalizeUploadErrorMessage(error)))
      )
    );
  }

  isSupabaseVoiceUrl(content: string): boolean {
    if (!content) {
      return false;
    }

    const normalized = content.trim();
    if (!/^https?:\/\//i.test(normalized)) {
      return false;
    }

    try {
      const parsed = new URL(normalized);
      const projectHost = new URL(environment.supabase.url).host;

      return (
        parsed.host === projectHost &&
        parsed.pathname.includes(`/storage/v1/object/public/${this.bucket}/`)
      );
    } catch {
      return false;
    }
  }

  private validateBlob(blob: Blob, mimeType: string): void {
    if (!this.allowedMimeTypes.has(mimeType)) {
      throw new Error('Unsupported audio format. Allowed formats: MP3, WAV, WEBM, MP4, OGG.');
    }

    if (blob.size > this.maxVoiceSizeBytes) {
      throw new Error('Audio file is too large. Maximum size is 5MB.');
    }
  }

  private resolveMimeType(rawMimeType: string): string {
    const baseMimeType = rawMimeType.trim().toLowerCase().split(';')[0].trim();

    if (!baseMimeType) {
      return 'audio/webm';
    }

    if (baseMimeType === 'audio/mp3') {
      return 'audio/mpeg';
    }

    if (
      baseMimeType === 'audio/x-wav' ||
      baseMimeType === 'audio/wave' ||
      baseMimeType === 'audio/x-pn-wav'
    ) {
      return 'audio/wav';
    }

    return baseMimeType;
  }

  private resolveExtension(mimeType: string): string {
    if (mimeType === 'audio/mpeg') {
      return 'mp3';
    }

    if (mimeType === 'audio/wav') {
      return 'wav';
    }

    if (mimeType === 'audio/mp4') {
      return 'mp4';
    }

    if (mimeType === 'audio/ogg') {
      return 'ogg';
    }

    return 'webm';
  }

  private resolveUploadContentType(rawMimeType: string, fallbackMimeType: string): string {
    const normalized = rawMimeType.trim().toLowerCase();
    if (!normalized) {
      return fallbackMimeType;
    }

    const parts = normalized.split(';').map((part) => part.trim()).filter((part) => part.length > 0);
    if (parts.length === 0) {
      return fallbackMimeType;
    }

    let [baseType, ...params] = parts;

    if (baseType === 'audio/mp3') {
      baseType = 'audio/mpeg';
    }

    if (baseType === 'audio/x-wav' || baseType === 'audio/wave' || baseType === 'audio/x-pn-wav') {
      baseType = 'audio/wav';
    }

    return [baseType, ...params].join(';');
  }

  private generateId(): string {
    if (this.isBrowser && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    return Math.random().toString(36).slice(2, 12);
  }

  private normalizeUploadErrorMessage(error: unknown): string {
    const rawMessage =
      error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message?: unknown }).message ?? '')
          : String(error ?? '');

    if (rawMessage.toLowerCase().includes('row-level security policy')) {
      return `Upload blocked by Supabase policy. Allow INSERT on storage.objects for bucket '${this.bucket}' (role: anon).`;
    }

    return rawMessage || 'Voice upload failed.';
  }
}
