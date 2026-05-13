/**
 * HAGUMI Analytics Library
 * Handles event tracking, user identification, and funnel analysis.
 */

type AnalyticsEvent = 'session_start' | 'purchase' | 'gacha_pull' | 'pet_interaction' | 'page_view';

interface EventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  public init() {
    if (this.isInitialized) return;
    console.log('[Analytics] Initialized tracking service');
    // Initialize Mixpanel or other providers here
    this.isInitialized = true;
  }

  public identify(userId: string, traits?: object) {
    console.log(`[Analytics] Identifying user: ${userId}`, traits);
    // mixpanel.identify(userId);
  }

  public track(event: AnalyticsEvent, properties?: EventProperties) {
    const timestamp = new Date().toISOString();
    console.log(`[Analytics] Event: ${event}`, { ...properties, timestamp });
    
    // In production, send to backend or external provider
    /*
    fetch('/api/analytics/track', {
      method: 'POST',
      body: JSON.stringify({ event, properties, timestamp }),
    });
    */
  }

  public trackPageView(page: string) {
    this.track('page_view', { page });
  }
}

export const analytics = AnalyticsService.getInstance();
