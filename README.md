# 📚 APIFolhear - Web Crawler & Comparador de Preços de Livros

<p align="center">
  <strong>Microserviço em Node.js e Express para rastreamento, scraping e comparação de preços de livros em tempo real no Brasil.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-4.19-000000?style=flat-square&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/Cheerio-1.0-e88c1f?style=flat-square" alt="Cheerio" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="Licença MIT" />
</p>

---

> 🔗 **Projeto Full-Stack:** Este repositório é a **API Backend & Web Crawler** do ecossistema. Ele foi desenvolvido para alimentar a aplicação cliente [**Folhear (Front-End & Estante 3D)**](https://github.com/GustavoRincha/Folhear).

---

## 🎯 Sobre o Projeto

O **APIFolhear** é o serviço backend responsável por consultar, extrair e ranquear preços de livros em tempo real nas principais plataformas brasileiras:
- 📖 **Estante Virtual** (Maior acervo de livros novos e usados do Brasil)
- 📦 **Amazon Brasil** (Livros físicos, capa comum, capa dura e eBooks Kindle)
- 🚚 **Mercado Livre** (Anúncios e vendedores diversos)
- ▶️ **Google Play Livros** (Preços oficiais de edições digitais/eBooks)

Este microserviço foi desenhado para alimentar o radar de ofertas e lista de desejos da aplicação [**Folhear (Front-End)**](https://github.com/GustavoRincha/Folhear).

---

## 🚀 Tecnologias Utilizadas

- **Node.js** (v18+)
- **Express 4** (Servidor HTTP minimalista)
- **Cheerio** (Parsing ultrarrápido de HTML/DOM para web scraping)
- **Axios** (Requisições HTTP com headers customizados e rotação de User-Agents)
- **CORS** (Integração segura com a aplicação cliente)
- **Dotenv** (Gerenciamento de variáveis de ambiente)

---

## 📦 Instalação e Execução

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18 ou superior
- Gerenciador de pacotes `npm`

### Passo a passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/GustavoRincha/APIFolhear.git
   cd APIFolhear
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Copie o arquivo de exemplo:
   ```bash
   cp .env.example .env
   ```

4. **Inicie o servidor:**
   * **Modo de desenvolvimento (com auto-reload):**
     ```bash
     npm run dev
     ```
   * **Modo de produção:**
     ```bash
     npm start
     ```

O servidor iniciará por padrão em: **`http://localhost:3001`**

---

## 🔌 Endpoints da API

### 1. Consultar Preços de um Livro
Realiza scraping simultâneo com `Promise.allSettled` em todas as lojas suportadas, ordena da menor para a maior oferta e identifica a melhor oportunidade.

* **Método:** `GET`
* **Rota:** `/api/prices`
* **Query Params:**
  * `isbn` *(Recomendado)*: ISBN-10 ou ISBN-13 do livro (apenas dígitos).
  * `title` *(Opcional)*: Título da obra.
  * `author` *(Opcional)*: Nome do autor.

#### Exemplo de Requisição:
```http
GET http://localhost:3001/api/prices?isbn=9788535914849&title=1984
```

#### Exemplo de Resposta (JSON):
```json
{
  "query": {
    "isbn": "9788535914849",
    "title": "1984",
    "author": ""
  },
  "totalSources": 4,
  "lowestPrice": 15.00,
  "lowestPriceFormatted": "R$ 15,00",
  "bestDealStore": "Estante Virtual",
  "results": [
    {
      "store": "Estante Virtual",
      "storeIcon": "menu_book",
      "price": 15.00,
      "priceFormatted": "R$ 15,00",
      "condition": "227 usados / 70 novos",
      "title": "1984",
      "url": "https://www.estantevirtual.com.br/livro/1984-...",
      "available": true,
      "bestDeal": true,
      "note": "Maior acervo de novos e usados do Brasil"
    },
    {
      "store": "Amazon Brasil",
      "storeIcon": "shopping_bag",
      "price": 42.50,
      "priceFormatted": "R$ 42,50",
      "condition": "Capa Comum",
      "title": "1984 - George Orwell",
      "url": "https://www.amazon.com.br/...",
      "available": true,
      "note": "Amazon Prime / Entrega rápida"
    }
  ],
  "searchedAt": "2026-09-02T20:45:00.000Z"
}
```

### 2. Status de Saúde
* **Método:** `GET`
* **Rota:** `/health`
```json
{
  "status": "ok",
  "timestamp": "2026-10-05T22:00:00.000Z"
}
```

---

## ⚙️ Variáveis de Ambiente (`.env`)

| Variável | Padrão | Descrição |
| :--- | :--- | :--- |
| `PORT` | `3001` | Porta do servidor HTTP |
| `CORS_ORIGIN` | `*` | Origens autorizadas para requisições cross-origin |

---

## 🛡️ Resiliência & Fallback

O serviço utiliza rotação de `User-Agent` simulando navegadores desktop reais para reduzir bloqueios de bot. Caso alguma loja aplique rate-limit ou captcha temporário, o scraper retorna um link direto pré-formatado para que o usuário final ainda consiga pesquisar a oferta no site original sem quebrar a requisição.

---

## 📄 Licença

Este projeto é de código aberto sob a licença [MIT](./LICENSE).
