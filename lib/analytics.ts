type AnalyticsEventMap = {
  demo_account_click: {
    method: "demo_account";
    button_location: "login";
  };
  storage_apply_click: {
    service_type: "storage";
    button_location: "home_hero";
  };
  pickup_service_click: {
    service_type: "pickup";
    button_location: "home_quick_start";
  };
  storage_application_complete: {
    service_type: "storage";
    pickup_selected: boolean;
    station_name: string;
    storage_size: string;
    storage_period: string;
    value: number;
    currency: "KRW";
  };
  rental_list_click: {
    service_type: "rental";
    button_location: "home_hero";
  };
  rental_application_complete: {
    service_type: "rental";
    currency: "KRW";
    item_name: string;
    item_category: string;
    rental_start_date: string;
    rental_end_date: string;
    rental_days: number;
    value: number;
  };
};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function trackEvent<EventName extends keyof AnalyticsEventMap>(
  event: EventName,
  parameters: AnalyticsEventMap[EventName],
) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...parameters });
}
