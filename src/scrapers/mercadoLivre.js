import axios from 'axios'
import * as cheerio from 'cheerio'
import { parsePrice, formatBRL } from '../utils/currencyHelper.js'
import { getBrowserHeaders } from '../utils/userAgents.js'

const BASE_URL = 'https://lista.mercadolivre.com.br'

/**
 * Scraper / Integrador para Mercado Livre Brasil
 * @param {Object} book - { isbn, title, author }
 */
export async function scrapeMercadoLivre({ isbn, title, author }) {
  const searchTerm = isbn || `${title || ''} ${author || ''}`.trim()
  if (!searchTerm) return null

  const searchUrl = `${BASE_URL}/${encodeURIComponent('livro ' + searchTerm)}`

  try {
    const response = await axios.get(searchUrl, {
      headers: getBrowserHeaders({
        'Host': 'lista.mercadolivre.com.br',
        'Referer': 'https://www.mercadolivre.com.br/'
      }),
      timeout: 7000,
      validateStatus: status => status < 500
    })

    if (response.status === 200 && response.data) {
      const $ = cheerio.load(response.data)
      let foundItem = null

      $('.ui-search-result, .ui-search-layout__item').each((_, el) => {
        if (foundItem) return

        const $el = $(el)
        const priceFraction = $el.find('.andes-money-amount__fraction').first().text().trim()
        const priceCents = $el.find('.andes-money-amount__cents').first().text().trim() || '00'
        const itemTitle = $el.find('.ui-search-item__title').first().text().trim()
        const itemUrl = $el.find('a.ui-search-link, a.poly-component__title').first().attr('href')

        if (priceFraction) {
          const price = parsePrice(`${priceFraction},${priceCents}`)
          if (price !== null && price > 0) {
            foundItem = {
              store: 'Mercado Livre',
              storeIcon: 'local_shipping',
              price: price,
              priceFormatted: formatBRL(price),
              condition: 'Novo ou Usado',
              title: itemTitle || title,
              url: itemUrl || searchUrl,
              available: true,
              note: 'Envio Full / Vendedores diversos'
            }
          }
        }
      })

      if (foundItem) return foundItem
    }

    return {
      store: 'Mercado Livre',
      storeIcon: 'local_shipping',
      price: null,
      priceFormatted: 'Ver no Mercado Livre',
      condition: 'Novo ou Usado',
      title: title || 'Buscar no Mercado Livre',
      url: searchUrl,
      available: false,
      note: 'Clique para conferir anúncios'
    }
  } catch (error) {
    console.warn(`[MercadoLivre] Falha na busca de "${searchTerm}":`, error.message)
    return {
      store: 'Mercado Livre',
      storeIcon: 'local_shipping',
      price: null,
      priceFormatted: 'Ver no Mercado Livre',
      condition: 'Novo ou Usado',
      title: title || 'Buscar no Mercado Livre',
      url: searchUrl,
      available: false,
      note: 'Clique para conferir anúncios'
    }
  }
}
