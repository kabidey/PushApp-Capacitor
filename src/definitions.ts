// Example: In your plugin's definitions.ts or index.d.ts file

export interface PlaceholderRegisterOptions {
  placeholderId: string;
  /** HTML element id; defaults to `placeholderId`. Must exist in the page DOM. */
  elementId?: string;
  /** CSS selector for fixed top chrome; bottom edge is used as `clipTop`. Defaults to `ion-header`. */
  clipTopSelector?: string;
}

export interface UIOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Viewport Y (px) below fixed header/chrome; inline content is clipped/hidden above this line. Set automatically when using registerPlaceholder on native. */
  clipTop?: number;
}

export interface PushAppPlugin {
  // Existing Core Methods
  /**
   * Initialize the SDK.
   *
   * - `appId` — channel id (e.g. `demo_1763369170735`). Tenant subdomain is the prefix before the first `_`.
   * - `pushAppId` — optional PushApp API App Id (e.g. `pa_…`), sent as `x-app-id` when provided.
   * - `appSecretKey` — optional PushApp App Secret Key (e.g. `pas_…`), sent as `x-app-key` when provided.
   *
   * Use `identifier` only for backward compatibility; it is the same value as `appId`.
   *
   * `debugMode` enables verbose native logs in debug builds only (tokens/PII are redacted).
   * `slackWebhookUrl` opts in to posting API request/response logs to your Slack webhook (development only).
   */
  initialize(
    options:
      | {
          appId: string;
          pushAppId?: string;
          appSecretKey?: string;
          sandbox?: boolean;
          debugMode?: boolean;
          slackWebhookUrl?: string;
        }
      | {
          identifier: string;
          pushAppId?: string;
          appSecretKey?: string;
          sandbox?: boolean;
          debugMode?: boolean;
          slackWebhookUrl?: string;
        },
  ): Promise<{ status: string }>;
  /**
   * Register this device for push messaging after `initialize`.
   *
   * Safe to call on every app launch. The SDK avoids duplicate registration for the
   * same token and updates the stored token automatically if it changes later.
   *
   * - Android: provide `fcmToken`, or pass an empty string to use the native cached token.
   * - iOS: provide `apnsToken` and optional `fcmToken`, or use native cached tokens.
   * - Legacy fallback: `token` is accepted as alias for the platform primary token.
   */
  register(options: {
    apnsToken?: string;
    fcmToken?: string;
    token?: string;
  }): Promise<{ status: string; success: boolean }>;
  /** Links device to userId. Resolves only after `/device/link` succeeds (deviceLinkCompleted). */
  login(options: { userId: string }): Promise<{ status: string }>;
  /** Delink the device from the current user. Clears local session; calls server delink when a user was logged in. */
  logout(): Promise<{ status: string }>;
  /** Create or update customer profile (PUT). Call after login with code = userId. */
  saveUserData(options: {
    code: string;
    additionalInfo: Record<string, unknown>;
    cohorts: Record<string, unknown>;
  }): Promise<{ status: string; success: boolean }>;
  getDeviceHeaders(): Promise<{ [key: string]: string }>;
  sendEvent(options: { eventName: string; eventData: { [key: string]: any } }): Promise<{ status: string }>;
  setPageName(options: { pageName: string }): Promise<{ status: string }>;

  // Inline Placeholder Methods
  /**
   * Register an inline placeholder. On native platforms the SDK tracks DOM position
   * (scroll, resize, fixed headers) automatically — pass `placeholderId` only.
   * The HTML element id should match `placeholderId` unless `elementId` is set.
   */
  registerPlaceholder(options: PlaceholderRegisterOptions): Promise<{ status: string }>;
  /** @internal Used by the SDK to reposition inline placeholders during scroll sync. */
  updatePlaceholder(options: { placeholderId: string } & UIOptions): Promise<{ status: string }>;
  unregisterPlaceholder(options: { placeholderId: string }): Promise<{ status: string }>;

  // ⭐️ NEW: Tooltip Target Methods
  /** Registers a UI element as an anchor target for native tooltips/popovers. */
  registerTooltipTarget(options: { targetId: string } & UIOptions): Promise<{ status: string }>;
  /** Unregisters a tooltip anchor target. */
  unregisterTooltipTarget(options: { targetId: string }): Promise<{ status: string }>;

  /** Tracks a push notification event (e.g. "opened" or "cta"). Use when user opens a notification or taps a CTA. */
  trackPushNotificationEvent(options: { token: string; event: string; ctaId?: string }): Promise<{ success: boolean }>;

  /**
   * Forward a push payload into the SDK (tray / in-app routing).
   * Use when the host app owns FCM via `@capacitor/push-notifications` (or another
   * FirebaseMessagingService) and the SDK's native service does not receive messages.
   */
  handlePushNotification(options: {
    title?: string;
    body?: string;
    data?: Record<string, unknown>;
  }): Promise<{ status: string }>;
}
