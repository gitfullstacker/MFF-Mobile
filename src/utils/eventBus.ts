type Listener = (...args: any[]) => void;

class EventBus {
  private events: { [key: string]: Listener[] } = {};

  on(event: string, callback: Listener): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event: string, callback: Listener): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return;
    this.events[event].forEach(cb => cb(...args));
  }
}

export const eventBus = new EventBus();
