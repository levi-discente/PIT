import { useCallback } from "react";

const urlBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function useAPI() {
  const httpGet = useCallback(async function <T>(caminho: string): Promise<T> {
    if (!urlBase) {
      throw new Error("A variável de ambiente NEXT_PUBLIC_API_URL não está definida.");
    }
    const uri = caminho.startsWith("/") ? caminho : `/${caminho}`;
    const urlCompleta = `${urlBase}${uri}`;

    const resposta = await fetch(urlCompleta);
    return extrairDados(resposta) as T;
  }, []);

  const httpPost = useCallback(async function (caminho: string, body?: Record<string, unknown>) {
    const uri = caminho.startsWith("/") ? caminho : `/${caminho}`;
    const urlCompleta = `${urlBase}${uri}`;

    const resposta = await fetch(urlCompleta, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : null,
    });
    return extrairDados(resposta);
  }, []);

  async function extrairDados(reposta: Response): Promise<unknown> {
    let conteudo: Record<string, unknown>;

    try {
      conteudo = await reposta.json();
    } catch {
      if (!reposta.ok) {
        throw new Error(
          `Ocorreu um erro inesperado com status ${reposta.status}.`
        );
      }
      return null;
    }
    if (!reposta.ok) throw conteudo;
    return conteudo;
  }

  return { httpGet, httpPost };
}
