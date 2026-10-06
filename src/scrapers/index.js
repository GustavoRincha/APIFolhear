import { scrapeEstanteVirtual } from './estanteVirtual.js'
import { scrapeAmazon } from './amazon.js'
import { scrapeMercadoLivre } from './mercadoLivre.js'
import { scrapeGooglePlayBooks } from './googleBooks.js'

/**
 * Orquestrador principal de busca de preços em múltiplos sites
 * @param {Object} bookQuery - { isbn, title, author }
 */
export async function searchBookPrices({ isbn, title, author }) {
  const query = {
    isbn: (isbn || '').replace(/[^0-9X]/gi, ''),
    title: (title || '').trim(),
    author: (author || '').trim()
  }

  // Executa todas as buscas concorrentemente
  const tasks = [
    scrapeEstanteVirtual(query),
    scrapeAmazon(query),
    scrapeMercadoLivre(query),
    scrapeGooglePlayBooks(query)
  ]

  const rawResults = await Promise.allSettled(tasks)
  
  const results = rawResults
    .filter(r => r.status === 'fulfilled' && r.value !== null)
    .map(r => r.value)

  // Ordena os resultados:
  // 1. Lojas com preços encontrados (do menor para o maior)
  // 2. Lojas com links de busca direta
  results.sort((a, b) => {
    if (a.price !== null && b.price !== null) {
      return a.price - b.price
    }
    if (a.price !== null) return -1
    if (b.price !== null) return 1
    return 0
  })

  // Marca a melhor oferta (menor preço disponível)
  const lowestPricedItem = results.find(item => item.price !== null && item.price > 0)
  if (lowestPricedItem) {
    lowestPricedItem.bestDeal = true
  }

  return {
    query,
    totalSources: results.length,
    lowestPrice: lowestPricedItem ? lowestPricedItem.price : null,
    lowestPriceFormatted: lowestPricedItem ? lowestPricedItem.priceFormatted : null,
    bestDealStore: lowestPricedItem ? lowestPricedItem.store : null,
    results,
    searchedAt: new Date().toISOString()
  }
}
