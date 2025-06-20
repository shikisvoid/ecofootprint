// Google Drive API Integration for EcoCloudApp
class GoogleDriveService {
  private readonly DRIVE_API_KEY = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY || 'demo_key';
  private accessToken: string | null = null;

  // Initialize Google Drive API
  async initialize() {
    try {
      // Load Google API script
      if (!window.gapi) {
        await this.loadGoogleAPI();
      }

      await new Promise((resolve) => {
        window.gapi.load('auth2:client:drive', resolve);
      });

      await window.gapi.client.init({
        apiKey: this.DRIVE_API_KEY,
        clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
        scope: 'https://www.googleapis.com/auth/drive.file'
      });

      console.log('✅ Google Drive API initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Google Drive API:', error);
      return false;
    }
  }

  // Load Google API script
  private loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.head.appendChild(script);
    });
  }

  // Authenticate user
  async authenticate(): Promise<boolean> {
    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      
      if (!authInstance.isSignedIn.get()) {
        await authInstance.signIn();
      }

      const user = authInstance.currentUser.get();
      this.accessToken = user.getAuthResponse().access_token;
      
      console.log('✅ Google Drive authentication successful');
      return true;
    } catch (error) {
      console.error('❌ Google Drive authentication failed:', error);
      return false;
    }
  }

  // Save carbon footprint report to Google Drive
  async saveReportToDrive(reportData: any, fileName: string): Promise<string | null> {
    try {
      if (!this.accessToken) {
        const authenticated = await this.authenticate();
        if (!authenticated) return null;
      }

      // Create report content
      const reportContent = this.generateReportContent(reportData);
      
      // Create file metadata
      const metadata = {
        name: `${fileName}_${new Date().toISOString().split('T')[0]}.json`,
        parents: [await this.getOrCreateEcoFolder()],
        description: 'EcoCloudApp Carbon Footprint Report'
      };

      // Upload file
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([JSON.stringify(reportContent, null, 2)], { type: 'application/json' }));

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: form
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Report saved to Google Drive:', result.id);
        return result.id;
      } else {
        throw new Error(`Upload failed: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Failed to save report to Google Drive:', error);
      return null;
    }
  }

  // Get or create EcoCloudApp folder
  private async getOrCreateEcoFolder(): Promise<string> {
    try {
      // Search for existing folder
      const response = await window.gapi.client.drive.files.list({
        q: "name='EcoCloudApp Reports' and mimeType='application/vnd.google-apps.folder'",
        spaces: 'drive'
      });

      if (response.result.files && response.result.files.length > 0) {
        return response.result.files[0].id;
      }

      // Create new folder
      const folderResponse = await window.gapi.client.drive.files.create({
        resource: {
          name: 'EcoCloudApp Reports',
          mimeType: 'application/vnd.google-apps.folder'
        }
      });

      return folderResponse.result.id;
    } catch (error) {
      console.error('❌ Failed to get/create folder:', error);
      return 'root'; // Fallback to root folder
    }
  }

  // Generate report content
  private generateReportContent(reportData: any) {
    return {
      appName: 'EcoCloudApp',
      reportType: 'Carbon Footprint Report',
      generatedAt: new Date().toISOString(),
      user: {
        id: reportData.userId,
        email: reportData.userEmail
      },
      period: reportData.period,
      summary: {
        totalEmissions: reportData.totalEmissions,
        categories: reportData.categories,
        topCategory: reportData.topCategory,
        improvement: reportData.improvement
      },
      details: reportData.entries,
      achievements: reportData.achievements,
      suggestions: reportData.suggestions,
      metadata: {
        version: '1.0',
        format: 'json',
        exportedBy: 'EcoCloudApp'
      }
    };
  }

  // List user's saved reports
  async listSavedReports(): Promise<any[]> {
    try {
      if (!this.accessToken) {
        const authenticated = await this.authenticate();
        if (!authenticated) return [];
      }

      const response = await window.gapi.client.drive.files.list({
        q: "name contains 'EcoCloudApp' and mimeType='application/json'",
        orderBy: 'modifiedTime desc',
        pageSize: 20
      });

      return response.result.files || [];
    } catch (error) {
      console.error('❌ Failed to list saved reports:', error);
      return [];
    }
  }

  // Download report from Google Drive
  async downloadReport(fileId: string): Promise<any | null> {
    try {
      if (!this.accessToken) {
        const authenticated = await this.authenticate();
        if (!authenticated) return null;
      }

      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (response.ok) {
        const content = await response.text();
        return JSON.parse(content);
      } else {
        throw new Error(`Download failed: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Failed to download report:', error);
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  // Sign out
  async signOut() {
    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      this.accessToken = null;
      console.log('✅ Signed out from Google Drive');
    } catch (error) {
      console.error('❌ Failed to sign out:', error);
    }
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gapi: any;
  }
}

export const googleDriveService = new GoogleDriveService();
