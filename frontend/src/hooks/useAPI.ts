import { useCallback } from "react";

const urlBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function useAPI() {
  const buildUrl = (path: string) =>
    `${urlBase}${path.startsWith("/") ? path : "/" + path}`;

  const httpGet = useCallback(async <T>(path: string): Promise<T> => {
    const res = await fetch(buildUrl(path));
    const data = await res.json();
    if (!res.ok) throw data;
    return data as T;
  }, []);

  const httpPost = useCallback(
    async (path: string, body?: unknown) => {
      const res = await fetch(buildUrl(path), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : null,
      });
      const data = await res.json();
      if (!res.ok) throw data;
      return data;
    },
    []
  );

  const httpPut = useCallback(async (path: string, body?: unknown) => {
    const res = await fetch(buildUrl(path), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : null,
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  }, []);

  const httpDelete = useCallback(async (path: string) => {
    const res = await fetch(buildUrl(path), { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  }, []);

  const createWebSocket = useCallback(
    (
      wsUrl: string,
      {
        onOpen,
        onMessage,
        onError,
        onClose,
      }: {
        onOpen?: (event: Event) => void;
        onMessage?: (data: unknown, event: MessageEvent) => void;
        onError?: (error: Event) => void;
        onClose?: (event: CloseEvent) => void;
      } = {}
    ) => {
      const ws = new WebSocket(wsUrl);

      ws.onopen = (event) => {
        if (onOpen) {
          onOpen(event);
        } else {
          console.log("Conectado ao WebSocket");
        }
      };

      ws.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data);
          if (onMessage) {
            onMessage(parsedData, event);
          } else {
            console.log("Mensagem recebida:", parsedData);
          }
        } catch (error) {
          console.error("Erro ao processar mensagem:", error);
        }
      };

      ws.onerror = (event) => {
        if (onError) {
          onError(event);
        } else {
          console.error("Erro no WebSocket:", event);
        }
      };

      ws.onclose = (event) => {
        if (onClose) {
          onClose(event);
        } else {
          console.log("WebSocket fechado");
        }
      };

      return ws;
    },
    []
  );

  return { httpGet, httpPost, httpPut, httpDelete, createWebSocket };
}
