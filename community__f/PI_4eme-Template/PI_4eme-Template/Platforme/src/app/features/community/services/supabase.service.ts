import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { defer, Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';

type MessageMediaKind = 'image' | 'video';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly isBrowser =
    typeof window !== 'undefined' &&
    typeof crypto !== 'undefined';

  private readonly allowedVoiceMimeTypes = new Set([
    'audio/mpeg',
    'audio/wav',
    'audio/webm',
    'audio/mp4',
    'audio/ogg'
  ]);
  private readonly allowedImageMimeTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ]);
  private readonly allowedVideoMimeTypes = new Set([
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]);
  private readonly audioExtensions = new Set(['mp3', 'wav', 'webm', 'ogg', 'm4a', 'aac', 'flac', 'mp4']);
  private readonly imageExtensions = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp']);
  private readonly videoExtensions = new Set(['mp4', 'webm', 'mov', 'm4v']);

  private readonly maxVoiceSizeBytes = environment.supabase.maxVoiceSizeBytes;
  private readonly maxImageSizeBytes = environment.supabase.maxImageSizeBytes;
  private readonly maxVideoSizeBytes = environment.supabase.maxVideoSizeBytes;

  private readonly voiceBucket = environment.supabase.voiceMessagesBucket;
  private readonly mediaBucket = environment.supabase.messageMediaBucket || this.voiceBucket;

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

      const mimeType = this.resolveVoiceMimeType(blob.type);
      this.validateVoiceBlob(blob, mimeType);

      const extension = this.resolveVoiceExtension(mimeType);
      const filePath = `voice/${Date.now()}-${this.generateId()}.${extension}`;
      const contentType = this.resolveUploadContentType(blob.type, mimeType);

      return await this.uploadToBucket(this.voiceBucket, filePath, blob, contentType, 'voice message');
    }).pipe(
      catchError((error: unknown) =>
        throwError(() => new Error(this.normalizeUploadErrorMessage(error)))
      )
    );
  }

  uploadMessageImage(file: File): Observable<string> {
    return this.uploadMessageMedia(file, 'image');
  }

  uploadMessageVideo(file: File): Observable<string> {
    return this.uploadMessageMedia(file, 'video');
  }

  isSupabaseVoiceUrl(content: string): boolean {
    const location = this.parseSupabaseStorageLocation(content, [this.voiceBucket, this.mediaBucket]);
    if (!location) {
      return false;
    }

    if (location.path.includes('/media/images/') || location.path.includes('/media/videos/')) {
      return false;
    }

    if (location.path.includes('/voice/')) {
      return true;
    }

    const extension = this.extractFileExtension(location.path);
    return extension !== null && this.audioExtensions.has(extension);
  }

  isSupabaseImageUrl(content: string): boolean {
    const location = this.parseSupabaseStorageLocation(content, [this.mediaBucket, this.voiceBucket]);
    if (!location) {
      return false;
    }

    if (location.path.includes('/voice/')) {
      return false;
    }

    if (location.path.includes('/media/images/')) {
      return true;
    }

    const extension = this.extractFileExtension(location.path);
    return extension !== null && this.imageExtensions.has(extension);
  }

  isSupabaseVideoUrl(content: string): boolean {
    const location = this.parseSupabaseStorageLocation(content, [this.mediaBucket, this.voiceBucket]);
    if (!location) {
      return false;
    }

    if (location.path.includes('/voice/')) {
      return false;
    }

    if (location.path.includes('/media/videos/')) {
      return true;
    }

    const extension = this.extractFileExtension(location.path);
    return extension !== null && this.videoExtensions.has(extension);
  }

  private uploadMessageMedia(file: File, kind: MessageMediaKind): Observable<string> {
    return defer(async () => {
      if (!this.client) {
        throw new Error('Media upload is only available in browser context.');
      }

      const mimeType = this.resolveMessageMediaMimeType(file.type, kind);
      this.validateMessageMediaFile(file, mimeType, kind);

      const extension = this.resolveMessageMediaExtension(mimeType, file.name, kind);
      const folder = kind === 'image' ? 'media/images' : 'media/videos';
      const filePath = `${folder}/${Date.now()}-${this.generateId()}.${extension}`;
      const contentType = this.resolveUploadContentType(file.type, mimeType);

      return await this.uploadToBucket(this.mediaBucket, filePath, file, contentType, `${kind} message`);
    }).pipe(
      catchError((error: unknown) =>
        throwError(() => new Error(this.normalizeUploadErrorMessage(error)))
      )
    );
  }

  private async uploadToBucket(
    bucket: string,
    filePath: string,
    payload: Blob,
    contentType: string,
    label: string
  ): Promise<string> {
    if (!this.client) {
      throw new Error('Supabase client is not available in this context.');
    }

    const { error } = await this.client.storage
      .from(bucket)
      .upload(filePath, payload, {
        upsert: false,
        contentType
      });

    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }

    const { data } = this.client.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      throw new Error(`Supabase did not return a public URL for uploaded ${label}.`);
    }

    return data.publicUrl;
  }

  private parseSupabaseStorageLocation(content: string, buckets: string[]): { path: string; bucket: string } | null {
    const normalized = content.trim();
    if (!normalized || !/^https?:\/\//i.test(normalized)) {
      return null;
    }

    try {
      const parsed = new URL(normalized);
      const projectHost = new URL(environment.supabase.url).host.toLowerCase();
      if (parsed.host.toLowerCase() !== projectHost) {
        return null;
      }

      const normalizedPath = decodeURIComponent(parsed.pathname || '').toLowerCase();
      const uniqueBuckets = Array.from(new Set(buckets.map((bucket) => bucket.trim()).filter((bucket) => bucket.length > 0)));

      for (const bucket of uniqueBuckets) {
        const prefix = `/storage/v1/object/public/${bucket.toLowerCase()}/`;
        if (normalizedPath.includes(prefix)) {
          return {
            path: normalizedPath,
            bucket
          };
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  private validateVoiceBlob(blob: Blob, mimeType: string): void {
    if (!this.allowedVoiceMimeTypes.has(mimeType)) {
      throw new Error('Unsupported audio format. Allowed formats: MP3, WAV, WEBM, MP4, OGG.');
    }

    if (blob.size > this.maxVoiceSizeBytes) {
      throw new Error('Audio file is too large. Maximum size is 5MB.');
    }
  }

  private validateMessageMediaFile(file: File, mimeType: string, kind: MessageMediaKind): void {
    const allowed = kind === 'image' ? this.allowedImageMimeTypes : this.allowedVideoMimeTypes;
    if (!allowed.has(mimeType)) {
      if (kind === 'image') {
        throw new Error('Unsupported image format. Allowed formats: JPG, PNG, WEBP, GIF.');
      }

      throw new Error('Unsupported video format. Allowed formats: MP4, WEBM, MOV.');
    }

    const maxBytes = kind === 'image' ? this.maxImageSizeBytes : this.maxVideoSizeBytes;
    if (file.size > maxBytes) {
      throw new Error(kind === 'image' ? 'Image file is too large. Maximum size is 10MB.' : 'Video file is too large. Maximum size is 50MB.');
    }
  }

  private resolveVoiceMimeType(rawMimeType: string): string {
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

  private resolveMessageMediaMimeType(rawMimeType: string, kind: MessageMediaKind): string {
    const baseMimeType = rawMimeType.trim().toLowerCase().split(';')[0].trim();

    if (!baseMimeType) {
      return kind === 'image' ? 'image/jpeg' : 'video/mp4';
    }

    if (baseMimeType === 'image/jpg') {
      return 'image/jpeg';
    }

    if (baseMimeType === 'video/x-m4v') {
      return 'video/mp4';
    }

    return baseMimeType;
  }

  private resolveVoiceExtension(mimeType: string): string {
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

  private resolveMessageMediaExtension(mimeType: string, fileName: string, kind: MessageMediaKind): string {
    const byMime = this.resolveMessageMediaExtensionByMime(mimeType);
    if (byMime) {
      return byMime;
    }

    const byFileName = this.extractFileExtension(fileName.toLowerCase());
    if (byFileName) {
      const allowedExtensions = kind === 'image' ? this.imageExtensions : this.videoExtensions;
      if (allowedExtensions.has(byFileName)) {
        return byFileName;
      }
    }

    return kind === 'image' ? 'jpg' : 'mp4';
  }

  private resolveMessageMediaExtensionByMime(mimeType: string): string | null {
    if (mimeType === 'image/jpeg') {
      return 'jpg';
    }

    if (mimeType === 'image/png') {
      return 'png';
    }

    if (mimeType === 'image/webp') {
      return 'webp';
    }

    if (mimeType === 'image/gif') {
      return 'gif';
    }

    if (mimeType === 'video/mp4') {
      return 'mp4';
    }

    if (mimeType === 'video/webm') {
      return 'webm';
    }

    if (mimeType === 'video/quicktime') {
      return 'mov';
    }

    return null;
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

    if (baseType === 'image/jpg') {
      baseType = 'image/jpeg';
    }

    if (baseType === 'video/x-m4v') {
      baseType = 'video/mp4';
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

    const normalizedMessage = rawMessage.toLowerCase();

    if (normalizedMessage.includes('row-level security policy')) {
      const policyBucketHint =
        this.voiceBucket === this.mediaBucket
          ? this.voiceBucket
          : `${this.voiceBucket}' and '${this.mediaBucket}`;

      return `Upload blocked by Supabase policy. Allow INSERT on storage.objects for bucket '${policyBucketHint}' (role: anon).`;
    }

    if (normalizedMessage.includes('exceeded the maximum allowed size')) {
      return `Upload blocked by Supabase bucket size limit. Increase file size limit for bucket '${this.mediaBucket}' in Storage settings, or send a smaller file.`;
    }

    return rawMessage || 'Voice upload failed.';
  }

  private extractFileExtension(pathOrFileName: string): string | null {
    const lastSegment = pathOrFileName.split('/').pop() ?? '';
    const base = lastSegment.split('?')[0].split('#')[0];
    const index = base.lastIndexOf('.');
    if (index < 0 || index === base.length - 1) {
      return null;
    }

    return base.slice(index + 1).toLowerCase();
  }
}
