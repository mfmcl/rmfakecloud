import apiservice from "../services/api.service";

export async function uploadFilesInBatches(files, uploadFolder, batchSize = 100) {
  const totalFiles = files.length;
  let uploadedCount = 0;

  while (uploadedCount < totalFiles) {
    const batch = files.slice(uploadedCount, uploadedCount + batchSize);
    try {
      await apiservice.upload(uploadFolder, batch);
      uploadedCount += batchSize;
    } catch (e) {
      if (e.status === 409 && e.docId) {
        if (window.confirm(`${e.message}\n\nOverwrite?`)) {
          await apiservice.deleteDocument(e.docId);
          await apiservice.upload(uploadFolder, batch);
          uploadedCount += batchSize;
          continue;
        }
        return;
      }
      throw e;
    }
  }
}
