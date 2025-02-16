    FROM golang:1.23.5-alpine AS builder

    # Instala dependências necessárias (git para dependências do Go)
    RUN apk add --no-cache git

    # Define o diretório de trabalho
    WORKDIR /app

    # Copia os arquivos do projeto
    COPY go.mod go.sum ./
    RUN go mod download

    # Copia o código-fonte
    COPY . .

    # Compila a aplicação
    RUN go build -o backend cmd/main.go

    # Etapa final para reduzir o tamanho da imagem
    FROM alpine:latest

    # Define o diretório de trabalho
    WORKDIR /app

    # Copia o binário gerado na etapa anterior
    COPY --from=builder /app/backend .

    # Copia arquivos de configuração
    COPY config /app/config

    # Define as variáveis de ambiente (pode ser substituído por um .env)
    ENV CONFIG_PATH=/app/.env

    # Copia o arquivo .env para a imagem
    COPY .env /app/.env

    # Define o comando de execução
    ENTRYPOINT ["/app/backend"]

