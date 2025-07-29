// Type definitions for react-native-onesignal v5.x
declare module 'react-native-onesignal' {
  export interface NotificationClickEvent {
    notification: {
      notificationId: string;
      additionalData?: object;
    };
  }

  export interface NotificationWillDisplayEvent {
    notification: {
      notificationId: string;
      additionalData?: object;
      display(): void;
    };
    preventDefault(): void;
  }

  export interface SubscriptionChangeEvent {
    to: {
      optedIn: boolean;
      userId?: string;
    };
  }

  export class OneSignal {
    static initialize(appId: string): void;
    static setConsentGiven(consent: boolean): void;
    static login(externalId: string): void;
    static logout(): void;

    static Debug: {
      setLogLevel(level: number): void;
    };

    static User: {
      getOnesignalId(): Promise<string>;
      addTags(tags: Record<string, string>): void;
      getTags(): Record<string, string>;
      pushSubscription: {
        optIn(): void;
        optOut(): void;
        getOptedIn(): boolean;
        getPushSubscriptionToken(): Promise<string>;
        addEventListener(event: 'change', callback: (event: SubscriptionChangeEvent) => void): void;
      };
    };

    static Notifications: {
      requestPermission(fallbackToSettings?: boolean): Promise<boolean>;
      getPermissionAsync(): Promise<boolean>;
      addEventListener(event: 'foregroundWillDisplay', callback: (event: NotificationWillDisplayEvent) => void): void;
      addEventListener(event: 'click', callback: (event: NotificationClickEvent) => void): void;
    };
  }
}
