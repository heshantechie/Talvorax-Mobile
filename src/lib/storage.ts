import * as FileSystem from 'expo-file-system';
import { supabase } from './supabase';

/**
 * Upload a file to Supabase Storage.
 * Handles conversion of mobile file:// URIs to proper format.
 */
export async function uploadFile(
  bucket: string,
  path: string,
  fileUri: string,
  contentType: string = 'application/pdf'
) {
  // Read the file as base64
  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Convert base64 to ArrayBuffer
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, bytes.buffer, {
      contentType,
      upsert: true,
    });

  if (error) throw error;
  return data;
}

/**
 * Get a public URL for a stored file.
 */
export function getFileUrl(bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Download a file and save it locally.
 */
export async function downloadFile(url: string, localPath: string) {
  const downloadResult = await FileSystem.downloadAsync(
    url,
    `${FileSystem.documentDirectory}${localPath}`
  );
  return downloadResult;
}

/**
 * Delete a file from Supabase Storage.
 */
export async function deleteFile(bucket: string, path: string) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

/**
 * List files in a storage bucket path.
 */
export async function listFiles(bucket: string, path: string) {
  const { data, error } = await supabase.storage.from(bucket).list(path);
  if (error) throw error;
  return data;
}
