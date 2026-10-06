import axios from 'axios'
import * as cheerio from 'cheerio'
import { parsePrice, formatBRL } from '../utils/currencyHelper.js'
import { getBrowserHeaders } from '../utils/userAgents.js'

const BASE_URL = 'https://www.estantevirtual.com.br'

/**
 * Scraper para a Estante Virtual
 * @param {Object} book - { isbn, title, author }
 */
export async function scrapeEstanteVirtual({ isbn, title, author }) {
  const searchTerm = isbn || `${title || ''} ${author || ''}`.trim()
  if (!searchTerm) return null

  const searchUrl = `${BASE_URL}/busca?q=${encodeURIComponent(searchTerm)}`

  try {
    const response = await axios.get(searchUrl, {
      headers: getBrowserHeaders({
        'Host': 'www.estantevirtual.com.br',
        'Referer': 'https://www.estantevirtual.com.br/'
      }),
      timeout: 8000,
    })

    if (!response.data) return null

    const $ = cheerio.load(response.data)
    const firstItem = $('.product-item').first()

    if (!firstItem || firstItem.length === 0) {
      // Nenhum resultado direto encontrado, retorna link de busca
      return {
        store: 'Estante Virtual',
        storeIcon: 'storefront',
        price: null,
        priceFormatted: 'Consultar no site',
        condition: 'Novos e Usados',
        title: title || 'Buscar na Estante Virtual',
        url: searchUrl,
        available: false,
        note: 'Nenhum resultado direto com preço raspado'
      }
    }

    // Extrai o preço
    const priceText = firstItem.find('[data-auto="price"], .product-item__sale-price').text().trim()
    const price = parsePrice(priceText)

    // Extrai contagens de novos e usados
    let conditionText = 'Novos e Usados'
    const variations = []
    firstItem.find('.product-item__variations__item').each((_, el) => {
      const text = $(el).text().trim()
      if (text) variations.push(text)
    })
    if (variations.length > 0) {
      conditionText = variations.join(' / ')
    }

    // Extrai o link
    let itemUrl = firstItem.find('a.product-item__button, a[href*="/livro/"]').first().attr('href')
    if (itemUrl && !itemUrl.startsWith('http')) {
      itemUrl = `${BASE_URL}${itemUrl.startsWith('/') ? '' : '/'}${itemUrl}`
    } else if (!itemUrl) {
      itemUrl = searchUrl
    }

    // Extrai título e imagem
    const itemTitle = firstItem.find('.product-item__title, .product-item__cover img').attr('alt') || title || 'Livro'
    const cover = firstItem.find('.product-item__cover img').attr('src') || ''

    if (price !== null) {
      return {
        store: 'Estante Virtual',
        storeIcon: 'menu_book',
        price: price,
        priceFormatted: formatBRL(price),
        condition: conditionText,
        title: itemTitle.replace(/^Livro\s+/i, '').trim(),
        url: itemUrl,
        coverUrl: cover && !cover.includes('loading') ? cover : null,
        available: true,
        note: 'Maior acervo de novos e usados do Brasil'
      }
    }

    return {
      store: 'Estante Virtual',
      storeIcon: 'menu_book',
      price: null,
      priceFormatted: 'Ver ofertas',
      condition: conditionText,
      title: itemTitle,
      url: itemUrl,
      available: true
    }
  } catch (error) {
    console.warn(`[EstanteVirtual] Falha ao raspar "${searchTerm}":`, error.message)
    return {
      store: 'Estante Virtual',
      storeIcon: 'menu_book',
      price: null,
      priceFormatted: 'Consultar no site',
      condition: 'Novos e Usados',
      title: title || 'Estante Virtual',
      url: searchUrl,
      available: false,
      error: error.message
    }
  }
}
