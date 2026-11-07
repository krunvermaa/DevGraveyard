export type AnalyticsEventName =
  | 'page_view'
  | 'grave_buried'
  | 'respect_paid'
  | 'eulogy_posted'
  | 'card_shared'
  | 'postmortem_generated';

export interface AnalyticsEventData {
  [key: string]: string | number | boolean | undefined;
}

// Dynamically inject Vercel Web Analytics in production browser environments
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  try {
    const existingScript = document.querySelector('script[src*="/_vercel/insights/script.js"]');
    if (!existingScript && !window.location.hostname.includes('localhost')) {
      const script = document.createElement('script');
      script.src = '/_vercel/insights/script.js';
      script.defer = true;
      document.head.appendChild(script);
    }
  } catch {
    // Ignore script injection errors
  }
}

export const trackEvent = (
  eventName: AnalyticsEventName,
  data?: AnalyticsEventData
): void => {
  try {
    if (import.meta.env.DEV) {
      console.log(`[Analytics: ${eventName}]`, data || {});
    }

    if (typeof window !== 'undefined' && (window as any).va) {
      (window as any).va('event', { name: eventName, data });
    }
  } catch {
    // Silently continue without disrupting user experience
  }
};

export const trackPageView = (path: string, title?: string) => {
  trackEvent('page_view', { path, title });
};

export const trackCardShared = (platform: string, metadata?: Record<string, any>) => {
  trackEvent('card_shared', { platform, ...metadata });
};

export const trackRespectPaid = (graveId: string) => {
  trackEvent('respect_paid', { grave_id: graveId });
};

export const trackGraveBuried = (causeOfDeath: string, metadata?: Record<string, any>) => {
  trackEvent('grave_buried', { cause_of_death: causeOfDeath, ...metadata });
};

export const trackAiPostMortemGenerated = (causeOfDeath?: string) => {
  trackEvent('postmortem_generated', { cause_of_death: causeOfDeath });
};
