import axios from 'axios'
import * as cheerio from 'cheerio'
import { parsePrice, formatBRL } from '../utils/currencyHelper.js'
import { getBrowserHeaders } from '../utils/userAgents.js'

const BASE_URL = 'https://www.amazon.com.br'

/**
 * Scraper / Integrador para Amazon Brasil
 * @param {Object} book - { isbn, title, author }
 */
export async function scrapeAmazon({ isbn, title, author }) {
  const searchTerm = isbn || `${title || ''} ${author || ''}`.trim()
  if (!searchTerm) return null

  const searchUrl = `${BASE_URL}/s?k=${encodeURIComponent(searchTerm)}&i=stripbooks`

  try {
    const response = await axios.get(searchUrl, {
      headers: getBrowserHeaders({
        'Host': 'www.amazon.com.br',
        'Referer': 'https://www.google.com.br/'
      }),
      timeout: 7000,
      validateStatus: status => status < 500
    })

    if (response.status === 200 && response.data) {
      const $ = cheerio.load(response.data)
      
      // Procura primeiro resultado que tenha preço
      let foundPrice = null
      let foundTitle = null
      let foundUrl = null
      let foundFormat = 'Livro Físico'

      $('[data-component-type="s-search-result"]').each((_, el) => {
        if (foundPrice !== null) return // Já encontrou o primeiro

        const $item = $(el)
        
        // Pega preço (.a-price .a-offscreen ou .a-price-whole)
        const offscreenPrice = $item.find('.a-price .a-offscreen').first().text().trim()
        const wholePrice = $item.find('.a-price-whole').first().text().trim()
        const fractionPrice = $item.find('.a-price-fraction').first().text().trim()

        let rawPriceText = offscreenPrice
        if (!rawPriceText && wholePrice) {
          rawPriceText = `${wholePrice},${fractionPrice || '00'}`
        }

        const price = parsePrice(rawPriceText)
        if (price !== null && price > 0) {
          foundPrice = price
          foundTitle = $item.find('h2 a span').first().text().trim() || title
          
          const relativeUrl = $item.find('h2 a').first().attr('href') || ''
          if (relativeUrl.startsWith('http')) {
            foundUrl = relativeUrl
          } else if (relativeUrl) {
            foundUrl = `${BASE_URL}${relativeUrl}`
          }

          // Identifica se é Capa Comum, eBook Kindle ou Capa Dura
          const formatText = $item.find('a:contains("Capa Comum"), a:contains("Capa Dura"), a:contains("Kindle")').first().text().trim()
          if (formatText) {
            foundFormat = formatText
          }
        }
      })

      if (foundPrice !== null) {
        return {
          store: 'Amazon Brasil',
          storeIcon: 'shopping_bag',
          price: foundPrice,
          priceFormatted: formatBRL(foundPrice),
          condition: foundFormat,
          title: foundTitle,
          url: foundUrl || searchUrl,
          available: true,
          note: 'Amazon Prime / Entrega rápida'
        }
      }
    }

    // Caso a Amazon bloqueie ou não tenha o seletor exato, retorna link direto de busca
    return {
      store: 'Amazon Brasil',
      storeIcon: 'shopping_bag',
      price: null,
      priceFormatted: 'Verificar na Amazon',
      condition: 'Novo / Kindle',
      title: title || 'Buscar na Amazon',
      url: searchUrl,
      available: false,
      note: 'Clique para conferir a oferta ao vivo'
    }
  } catch (error) {
    console.warn(`[Amazon] Consulta falhou para "${searchTerm}":`, error.message)
    return {
      store: 'Amazon Brasil',
      storeIcon: 'shopping_bag',
      price: null,
      priceFormatted: 'Verificar na Amazon',
      condition: 'Novo / Kindle',
      title: title || 'Buscar na Amazon',
      url: searchUrl,
      available: false,
      note: 'Clique para conferir a oferta ao vivo'
    }
  }
}
