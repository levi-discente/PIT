import { useCallback } from "react";
import { useUser } from "@/contexts/UserContext";

const urlBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function useAPI() {
  const { token } = useUser();

  // Recupera o token do contexto ou do localStorage, se disponível.
  const getToken = () => {
    return token || localStorage.getItem("token") || "";
  };

  const buildUrl = (path: string) =>
    `${urlBase}${path.startsWith("/") ? path : "/" + path}`;

  // Helper para construir os headers, incluindo o token se disponível.
  const getHeaders = () => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const currentToken = getToken();
    if (currentToken) {
      headers["Authorization"] = `Bearer ${currentToken}`;
    }
    return headers;
  };

  const httpGet = useCallback(async <T>(path: string): Promise<T> => {
    const res = await fetch(buildUrl(path), {
      method: "GET",
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data as T;
  }, [token]);

  const httpPost = useCallback(
    async (path: string, body?: unknown) => {
      const res = await fetch(buildUrl(path), {
        method: "POST",
        headers: getHeaders(),
        body: body ? JSON.stringify(body) : null,
      });
      const data = await res.json();
      if (!res.ok) throw data;
      return data;
    },
    [token]
  );

  const httpPut = useCallback(async (path: string, body?: unknown) => {
    const res = await fetch(buildUrl(path), {
      method: "PUT",
      headers: getHeaders(),
      body: body ? JSON.stringify(body) : null,
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  }, [token]);

  const httpDelete = useCallback(async (path: string) => {
    const res = await fetch(buildUrl(path), {
      method: "DELETE",
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return data;
  }, [token]);

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
      // Se o token estiver disponível, adiciona-o como parâmetro de query na URL do WebSocket.
      const currentToken = getToken();
      const finalWsUrl = currentToken
        ? `${wsUrl}?token=${encodeURIComponent(currentToken)}`
        : wsUrl;
      const ws = new WebSocket(finalWsUrl);

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
    [token]
  );

  return { httpGet, httpPost, httpPut, httpDelete, createWebSocket };
}
