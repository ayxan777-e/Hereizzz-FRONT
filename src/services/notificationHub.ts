import * as signalR from "@microsoft/signalr";
import { getAccessToken } from "../utils/token";

let connection: signalR.HubConnection | null = null;

const apiBaseUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  (import.meta.env.VITEAPIBASEURL as string | undefined) ||
  "https://localhost:7216/api";

const apiOrigin = apiBaseUrl.replace(/\/api\/?$/, "");

export function startNotificationConnection(
  userId: string,
  onReceive: () => void
) {
  if (connection) return connection;

  connection = new signalR.HubConnectionBuilder()
    .withUrl(`${apiOrigin}/hubs/notifications`, {
      accessTokenFactory: () => getAccessToken() || ""
    })
    .withAutomaticReconnect()
    .build();

  connection.on("ReceiveNotification", onReceive);

  connection
    .start()
    .then(() => connection?.invoke("JoinUserGroup", userId))
    .catch(console.error);

  return connection;
}

export async function stopNotificationConnection() {
  if (!connection) return;

  await connection.stop();
  connection = null;
}