import { Router } from 'express'
import { searchBookPrices } from '../scrapers/index.js'

export const pricesRouter = Router()

/**
 * GET /api/prices
 * Query params:
 *   - isbn: string (ex: 9788535914849)
 *   - title: string (ex: 1984)
 *   - author: string (ex: George Orwell)
 */
pricesRouter.get('/', async (req, res) => {
  const { isbn, title, author } = req.query

  if (!isbn && !title) {
    return res.status(400).json({
      error: 'É necessário informar ao menos o parâmetro "isbn" ou "title".'
    })
  }

  try {
    const data = await searchBookPrices({ isbn, title, author })
    return res.json(data)
  } catch (error) {
    console.error('Erro na rota /api/prices:', error)
    return res.status(500).json({
      error: 'Erro interno ao consultar preços nas lojas.',
      details: error.message
    })
  }
})
