/**
 * Analytics Utilities
 * Track user interactions and page views
 */

// Track page view
export const trackPageView = (path: string) => {
  if (import.meta.env.PROD && window.gtag) {
    window.gtag('config', import.meta.env.VITE_GA_TRACKING_ID, {
      page_path: path,
    });
  }
};

// Track custom event
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (import.meta.env.PROD && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track user action
export const trackUserAction = (action: string, details?: Record<string, any>) => {
  if (import.meta.env.DEV) {
    console.log('[Analytics]', action, details);
  }
  
  trackEvent(action, 'user_action', JSON.stringify(details));
};

// Track error
export const trackError = (error: Error, context?: string) => {
  if (import.meta.env.DEV) {
    console.error('[Analytics Error]', error, context);
  }
  
  trackEvent('error', 'application_error', `${context}: ${error.message}`);
};

// Track performance metric
export const trackPerformance = (metric: string, value: number) => {
  if (import.meta.env.DEV) {
    console.log('[Performance]', metric, value);
  }
  
  trackEvent('performance', 'timing', metric, Math.round(value));
};

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
