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
      alert('Your browser does not support desktop notifications.');
      return false;
    }

    console.log('Current notification permission:', Notification.permission);

    if (Notification.permission === 'granted') {
      this.hasPermission = true;
      console.log('Notification permission already granted');
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Notification permission denied');
      alert('Notifications are blocked. Please enable them in your browser settings:\n\nChrome: Settings → Privacy → Site Settings → Notifications\nFirefox: Preferences → Privacy → Permissions → Notifications');
      return false;
    }

    try {
      console.log('Requesting notification permission...');
      const permission = await Notification.requestPermission();
      console.log('Permission result:', permission);
      this.hasPermission = permission === 'granted';
      
      if (permission === 'denied') {
        alert('Notification permission was denied. You can change this in your browser settings.');
      }
      
      return this.hasPermission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  /**
   * Show a notification
   */
  static async show(title: string, options?: NotificationOptions): Promise<void> {
    console.log('NotificationService.show called:', title, options);
    
    // Check permission status
    if (Notification.permission !== 'granted') {
      console.warn('Cannot show notification: permission not granted. Current status:', Notification.permission);
      const granted = await this.requestPermission();
      if (!granted) {
        console.log('Notification permission denied or not granted');
        return;
      }
    }

    try {
      console.log('Creating notification:', title);
      const notification = new Notification(title, {
        icon: '/logo.jpg',
        badge: '/logo.jpg',
        ...options,
      });

      console.log('Notification created successfully:', notification);

      // Auto-close after 8 seconds
      setTimeout(() => {
        console.log('Auto-closing notification');
        notification.close();
      }, 8000);

      // Add click handler to focus the window
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return;
    } catch (error) {
      console.error('Error showing notification:', error);
      alert(`Notification error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

