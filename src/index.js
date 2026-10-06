import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { pricesRouter } from './routes/prices.js'

const app = express()
const PORT = process.env.PORT || 3001
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*'

// Middlewares
app.use(cors({
  origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN,
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

// Logs de requisição simples
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`)
  })
  next()
})

// Rota de saúde / boas-vindas
app.get('/', (req, res) => {
  res.json({
    service: 'APIFolhear',
    status: 'online',
    version: '1.0.0',
    description: 'API de Web Crawler e Comparação de Preços de Livros',
    endpoints: {
      prices: '/api/prices?isbn=9788535914849&title=1984',
      health: '/health'
    }
  })
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Rotas da API
app.use('/api/prices', pricesRouter)

// Tratamento de rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' })
})

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`===========================================`)
  console.log(`🚀 APIFolhear rodando com sucesso!`)
  console.log(`📍 URL: http://localhost:${PORT}`)
  console.log(`🔍 Teste: http://localhost:${PORT}/api/prices?isbn=9788535914849`)
  console.log(`===========================================`)
})
