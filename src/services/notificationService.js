// Simple notification service placeholder
// In real app, replace with API/websocket or integrate with your backend notification system.

export const notifyHR = ({ type, title, message, payload }) => {
  // eslint-disable-next-line no-console
  console.log("[Notify HR]", { type, title, message, payload });
  // Optionally integrate a UI toast library here
  try {
    if (typeof window !== "undefined") {
      // Basic browser notification as a placeholder
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification(title || "Thông báo", { body: message });
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission();
        }
      }
    }
  } catch (e) {
    // ignore
  }
};

export default { notifyHR };
