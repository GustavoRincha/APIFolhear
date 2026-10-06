import axios from 'axios'
import { formatBRL } from '../utils/currencyHelper.js'

const GOOGLE_BOOKS_BASE_URL = 'https://www.googleapis.com/books/v1/volumes'

/**
 * Consulta Google Books / Google Play Livros para preço oficial de Ebook
 * @param {Object} book - { isbn, title, author }
 */
export async function scrapeGooglePlayBooks({ isbn, title, author }) {
  const query = isbn ? `isbn:${isbn}` : (title ? `intitle:${title}` : '')
  if (!query) return null

  try {
    const response = await axios.get(GOOGLE_BOOKS_BASE_URL, {
      params: {
        q: query,
        country: 'BR',
        maxResults: 3
      },
      timeout: 5000
    })

    if (response.data && Array.isArray(response.data.items)) {
      for (const item of response.data.items) {
        const saleInfo = item.saleInfo
        if (saleInfo && (saleInfo.saleability === 'FOR_SALE' || saleInfo.saleability === 'FOR_SALE_AND_RENTAL')) {
          const priceObj = saleInfo.retailPrice || saleInfo.listPrice
          if (priceObj && priceObj.amount > 0) {
            return {
              store: 'Google Play Livros',
              storeIcon: 'play_arrow',
              price: priceObj.amount,
              priceFormatted: formatBRL(priceObj.amount),
              condition: 'eBook Digital',
              title: item.volumeInfo?.title || title,
              url: saleInfo.buyLink || `https://play.google.com/store/books/details?id=${item.id}`,
              available: true,
              note: 'Leitura no celular, tablet e web'
            }
          }
        }
      }
    }

    return null
  } catch (error) {
    console.warn('[GooglePlayBooks] Falha na consulta de preço:', error.message)
    return null
  }
}
