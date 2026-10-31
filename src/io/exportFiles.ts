import { saveBytes, saveFilesInFolder, saveText, type ExportFile } from './writers';

/**
 * Save one export request. Several files (for example CSV + SPSS syntax) use a
 * single folder picker in the desktop app; the browser keeps its download
 * behaviour. Returns false when the user cancels or a write fails.
 */
export const saveExportFiles = async (files: ExportFile[]): Promise<boolean> => {
  let saved = true;
  if (files.length > 1) {
    const batch = await saveFilesInFolder(
      files.map(file => ({
        name: file.fileName,
        bytes: file.bytes ?? new TextEncoder().encode(file.content ?? ''),
      })),
      'LazStats export'
    );
    if (batch) {
      if (batch.canceled) return false;
      return batch.saved === files.length;
    }
  }
  for (const file of files) {
    const result = file.bytes
      ? await saveBytes(file.bytes, file.fileName, file.mime)
      : await saveText(file.content ?? '', file.fileName, file.mime);
    if (result.canceled) saved = false;
  }
  return saved;
};
