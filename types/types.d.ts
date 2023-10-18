declare module 'express-session' {
    interface SessionData {
      githubToken: string;
      // you can add more custom session properties if needed
    }
  }
  