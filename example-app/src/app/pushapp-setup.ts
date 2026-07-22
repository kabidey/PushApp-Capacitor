import { PushApp } from 'pushapp-ionic';
import { Capacitor } from '@capacitor/core';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';

const REGISTER_RETRY_MS = 1000;
const REGISTER_MAX_ATTEMPTS = 8;

let pushListenersAttached = false;

/**
 * @capacitor-firebase/messaging owns FCM on Android (MessagingService).
 * Listen for token + received notifications and forward into the PushApp SDK.
 */
async function attachFirebaseMessagingListeners(): Promise<void> {
  if (pushListenersAttached || !Capacitor.isNativePlatform()) {
    return;
  }
  pushListenersAttached = true;
  console.log('[PushApp Example] FirebaseMessaging listeners attached');

  await FirebaseMessaging.addListener('tokenReceived', async (event) => {
    console.log('[PushApp Example] RECEIVED tokenReceived', {
      tokenPreview: event.token ? `${event.token.slice(0, 12)}…` : '(empty)',
    });
    try {
      console.log('[PushApp Example] FORWARD → PushApp.register (token refresh)');
      await registerPushAppDevice(event.token);
      console.log('[PushApp Example] FORWARD OK → PushApp.register');
    } catch (err) {
      console.warn('[PushApp Example] FORWARD FAIL → PushApp.register after tokenReceived:', err);
    }
  });

  // Foreground (and data messages in background on Android) → forward to SDK.
  await FirebaseMessaging.addListener('notificationReceived', async (event) => {
    const notification = event.notification;
    const data = (notification.data ?? {}) as Record<string, unknown>;
    console.log('[PushApp Example] RECEIVED notificationReceived', {
      title: notification.title,
      body: notification.body,
      id: notification.id,
      data,
    });
    const payload = {
      title: notification.title,
      body: notification.body,
      data,
    };
    try {
      console.log('[PushApp Example] FORWARD → PushApp.handlePushNotification', payload);
      await PushApp.handlePushNotification(payload);
      console.log('[PushApp Example] FORWARD OK → PushApp.handlePushNotification');
    } catch (err) {
      console.warn('[PushApp Example] FORWARD FAIL → PushApp.handlePushNotification:', err);
    }
  });

  await FirebaseMessaging.addListener('notificationActionPerformed', async (event) => {
    const data = (event.notification?.data ?? {}) as Record<string, unknown>;
    console.log('[PushApp Example] RECEIVED notificationActionPerformed', {
      actionId: event.actionId,
      title: event.notification?.title,
      body: event.notification?.body,
      data,
    });
    const clickToken = typeof data['click_token'] === 'string' ? data['click_token'] : undefined;
    if (!clickToken) {
      console.warn('[PushApp Example] SKIP forward — missing click_token in notification data');
      return;
    }
    const actionId = event.actionId;
    const isCta = !!actionId && actionId !== 'tap';
    const trackPayload = {
      token: clickToken,
      event: isCta ? 'cta' : 'opened',
      ctaId: isCta ? actionId : undefined,
    };
    try {
      console.log('[PushApp Example] FORWARD → PushApp.trackPushNotificationEvent', trackPayload);
      await PushApp.trackPushNotificationEvent(trackPayload);
      console.log('[PushApp Example] FORWARD OK → PushApp.trackPushNotificationEvent');
    } catch (err) {
      console.warn('[PushApp Example] FORWARD FAIL → PushApp.trackPushNotificationEvent:', err);
    }
  });
}

/**
 * Call after PushApp.initialize().
 * Native SDK skips duplicate registration and updates the stored token when it changes.
 */
export async function registerPushAppDevice(fcmToken?: string): Promise<void> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= REGISTER_MAX_ATTEMPTS; attempt++) {
    try {
      const res = await PushApp.register({ fcmToken: fcmToken ?? '' });
      console.log('PushApp register success:', res);
      return;
    } catch (err) {
      lastError = err;
      console.warn(`PushApp register attempt ${attempt}/${REGISTER_MAX_ATTEMPTS} failed:`, err);
      if (attempt < REGISTER_MAX_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, REGISTER_RETRY_MS));
      }
    }
  }

  throw lastError ?? new Error('PushApp.register() failed');
}

export async function initializeAndRegisterPushApp(options: {
  appId: string;
  pushAppId?: string;
  appSecretKey?: string;
  sandbox?: boolean;
  debugMode?: boolean;
  slackWebhookUrl?: string;
}): Promise<void> {
  await PushApp.initialize({
    debugMode: true,
    ...options,
  });

  if (!Capacitor.isNativePlatform()) {
    return;
  }

  await attachFirebaseMessagingListeners();

  const perm = await FirebaseMessaging.requestPermissions();
  if (perm.receive !== 'granted') {
    console.warn('Push notification permission not granted:', perm);
    return;
  }

  try {
    const { token } = await FirebaseMessaging.getToken();
    if (token) {
      await registerPushAppDevice(token);
      return;
    }
  } catch (err) {
    console.warn('FirebaseMessaging.getToken failed; falling back to native cached token:', err);
  }

  try {
    await registerPushAppDevice();
  } catch (err) {
    console.warn('Initial PushApp.register deferred to tokenReceived listener:', err);
  }
}
