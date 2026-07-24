import { Recipe } from './types';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Cloud backup configuration
 */
export interface CloudBackupConfig {
  provider: 'google-drive' | 'onedrive' | null;
  accessToken: string | null;
  refreshToken: string | null;
  folderId: string | null;
  fileId: string | null;
  lastSyncDate: number | null;
  autoSyncEnabled: boolean;
}

const CLOUD_CONFIG_KEY = 'makanplan_cloud_backup_config';

/**
 * Get current cloud backup configuration
 */
export async function getCloudBackupConfig(): Promise<CloudBackupConfig> {
  try {
    const config = await AsyncStorage.getItem(CLOUD_CONFIG_KEY);
    if (config) {
      return JSON.parse(config);
    }
    return {
      provider: null,
      accessToken: null,
      refreshToken: null,
      folderId: null,
      fileId: null,
      lastSyncDate: null,
      autoSyncEnabled: false,
    };
  } catch (error) {
    console.error('Failed to get cloud backup config:', error);
    return {
      provider: null,
      accessToken: null,
      refreshToken: null,
      folderId: null,
      fileId: null,
      lastSyncDate: null,
      autoSyncEnabled: false,
    };
  }
}

/**
 * Save cloud backup configuration
 */
export async function saveCloudBackupConfig(config: CloudBackupConfig): Promise<void> {
  try {
    await AsyncStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save cloud backup config:', error);
    throw error;
  }
}

/**
 * Upload recipes to Google Drive
 * Note: Requires OAuth2 authentication first
 */
export async function uploadToGoogleDrive(recipes: Recipe[], accessToken: string, fileId?: string): Promise<string> {
  try {
    const backup = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      recipeCount: recipes.length,
      recipes: recipes,
    };

    const fileContent = JSON.stringify(backup, null, 2);
    const fileName = `MakanPlan_Recipes_${new Date().toISOString().split('T')[0]}.json`;

    // If fileId exists, update the file; otherwise create new
    const url = fileId
      ? `https://www.googleapis.com/drive/v3/files/${fileId}?uploadType=media`
      : 'https://www.googleapis.com/drive/v3/files?uploadType=multipart';

    const method = fileId ? 'PATCH' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: fileContent,
    });

    if (!response.ok) {
      throw new Error(`Google Drive upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.id || fileId;
  } catch (error) {
    console.error('Failed to upload to Google Drive:', error);
    throw error;
  }
}

/**
 * Download recipes from Google Drive
 */
export async function downloadFromGoogleDrive(accessToken: string, fileId: string): Promise<Recipe[]> {
  try {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Google Drive download failed: ${response.statusText}`);
    }

    const backup = await response.json();

    if (!backup.recipes || !Array.isArray(backup.recipes)) {
      throw new Error('Invalid backup format from Google Drive');
    }

    return backup.recipes as Recipe[];
  } catch (error) {
    console.error('Failed to download from Google Drive:', error);
    throw error;
  }
}

/**
 * Upload recipes to OneDrive
 * Note: Requires OAuth2 authentication first
 */
export async function uploadToOneDrive(recipes: Recipe[], accessToken: string): Promise<string> {
  try {
    const backup = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      recipeCount: recipes.length,
      recipes: recipes,
    };

    const fileContent = JSON.stringify(backup, null, 2);
    const fileName = `MakanPlan_Recipes_${new Date().toISOString().split('T')[0]}.json`;

    const url = `https://graph.microsoft.com/v1.0/me/drive/root:/${fileName}:/content`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: fileContent,
    });

    if (!response.ok) {
      throw new Error(`OneDrive upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.id;
  } catch (error) {
    console.error('Failed to upload to OneDrive:', error);
    throw error;
  }
}

/**
 * Download recipes from OneDrive
 */
export async function downloadFromOneDrive(accessToken: string, fileId: string): Promise<Recipe[]> {
  try {
    const url = `https://graph.microsoft.com/v1.0/me/drive/items/${fileId}/content`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`OneDrive download failed: ${response.statusText}`);
    }

    const backup = await response.json();

    if (!backup.recipes || !Array.isArray(backup.recipes)) {
      throw new Error('Invalid backup format from OneDrive');
    }

    return backup.recipes as Recipe[];
  } catch (error) {
    console.error('Failed to download from OneDrive:', error);
    throw error;
  }
}

/**
 * Disconnect cloud backup
 */
export async function disconnectCloudBackup(): Promise<void> {
  try {
    const emptyConfig: CloudBackupConfig = {
      provider: null,
      accessToken: null,
      refreshToken: null,
      folderId: null,
      fileId: null,
      lastSyncDate: null,
      autoSyncEnabled: false,
    };
    await saveCloudBackupConfig(emptyConfig);
  } catch (error) {
    console.error('Failed to disconnect cloud backup:', error);
    throw error;
  }
}
