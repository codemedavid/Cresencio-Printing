// Browser Notification Service
// Handles browser push notifications with permission management

export class NotificationService {
  private static hasPermission = false;

  /**
   * Request browser notification permission
   */
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      this.hasPermission = true;
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.hasPermission = permission === 'granted';
      return this.hasPermission;
    }

    return false;
  }

  /**
   * Show a notification
   */
  static async show(title: string, options?: NotificationOptions): Promise<void> {
    // Request permission if not already granted
    if (!this.hasPermission) {
      const granted = await this.requestPermission();
      if (!granted) {
        console.log('Notification permission denied');
        return;
      }
    }

    try {
      const notification = new Notification(title, {
        icon: '/logo.jpg',
        badge: '/logo.jpg',
        ...options,
      });

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);

      return;
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  /**
   * Show order status update notification
   */
  static async notifyOrderStatusChange(
    orderNumber: string,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    const statusEmojis: Record<string, string> = {
      pending: '⏳',
      in_progress: '🔄',
      ready: '✅',
      completed: '🎉',
    };

    await this.show(`Order ${orderNumber} Updated`, {
      body: `Status changed: ${oldStatus} → ${newStatus} ${statusEmojis[newStatus] || ''}`,
      tag: `order-${orderNumber}`,
      requireInteraction: false,
    });
  }

  /**
   * Show new order notification (for admin)
   */
  static async notifyNewOrder(orderNumber: string, customerName: string): Promise<void> {
    await this.show('New Order Received', {
      body: `${customerName} submitted order ${orderNumber}`,
      tag: 'new-order',
      requireInteraction: true,
    });
  }

  /**
   * Show new VIP registration notification (for admin)
   */
  static async notifyNewRegistration(vipId: string, fullName: string): Promise<void> {
    await this.show('New VIP Registration', {
      body: `${fullName} registered with ID ${vipId}`,
      tag: 'new-registration',
      requireInteraction: true,
    });
  }

  /**
   * Show order amount set notification (for customer)
   */
  static async notifyOrderAmountSet(orderNumber: string, amount: number): Promise<void> {
    await this.show(`Order ${orderNumber} - Amount Set`, {
      body: `Total amount to pay: ₱${amount.toFixed(2)}`,
      tag: `amount-${orderNumber}`,
      requireInteraction: false,
    });
  }

  /**
   * Check if notifications are supported
   */
  static isSupported(): boolean {
    return 'Notification' in window;
  }

  /**
   * Get current permission status
   */
  static getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }
}

