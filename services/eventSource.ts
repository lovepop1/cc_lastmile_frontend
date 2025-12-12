export function connectToNotificationStream(
  userId: string,
  onMessage: (message: string) => void,
  onError: (error: Error) => void
): () => void {
  try {
    const url = `${process.env.EXPO_PUBLIC_API_URL || "http://10.44.232.190:8000"}/notifications/stream/${userId}`;
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      onMessage(event.data);
    };

    eventSource.onerror = () => {
      eventSource.close();
      onError(new Error("EventSource connection closed"));
    };

    return () => {
      eventSource.close();
    };
  } catch (error) {
    onError(error instanceof Error ? error : new Error("Failed to connect to notification stream"));
    return () => {};
  }
}
