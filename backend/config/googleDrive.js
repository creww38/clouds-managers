import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_DRIVE_CLIENT_ID,
  process.env.GOOGLE_DRIVE_CLIENT_SECRET,
  process.env.GOOGLE_DRIVE_REDIRECT_URI
);

// Set refresh token jika ada
if (process.env.GOOGLE_DRIVE_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN
  });
}

const drive = google.drive({ version: 'v3', auth: oauth2Client });

// Upload file ke Google Drive
export async function uploadToGoogleDrive(fileBuffer, fileName, mimeType) {
  try {
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: mimeType,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID]
      },
      media: {
        mimeType: mimeType,
        body: fileBuffer
      },
      fields: 'id, webViewLink, webContentLink'
    });

    return {
      fileId: response.data.id,
      webViewLink: response.data.webViewLink,
      webContentLink: response.data.webContentLink
    };
  } catch (error) {
    console.error('Google Drive upload error:', error);
    throw new Error('Failed to upload to Google Drive');
  }
}

// Download file dari Google Drive
export async function downloadFromGoogleDrive(fileId) {
  try {
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );
    return response.data;
  } catch (error) {
    console.error('Google Drive download error:', error);
    throw new Error('Failed to download from Google Drive');
  }
}

// Delete file dari Google Drive
export async function deleteFromGoogleDrive(fileId) {
  try {
    await drive.files.delete({ fileId });
    return true;
  } catch (error) {
    console.error('Google Drive delete error:', error);
    throw new Error('Failed to delete from Google Drive');
  }
}

// Generate public URL
export async function makeFilePublic(fileId) {
  try {
    await drive.permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });
    
    const result = await drive.files.get({
      fileId,
      fields: 'webViewLink, webContentLink'
    });
    
    return result.data;
  } catch (error) {
    console.error('Google Drive permission error:', error);
    throw new Error('Failed to make file public');
  }
}

export { drive, oauth2Client };
