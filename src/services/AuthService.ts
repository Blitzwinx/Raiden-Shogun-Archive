export const authService = {
  // Simple password verification for dashboard access
  async verifyDashboardPassword(inputPassword: string): Promise<boolean> {
    try {
      const storedPassword = import.meta.env.VITE_DASHBOARD_PASSWORD;
      
      if (!storedPassword) {
        console.error('Dashboard password not configured in environment variables');
        return false;
      }
      
      // Simple string comparison
      return inputPassword === storedPassword;
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }
};