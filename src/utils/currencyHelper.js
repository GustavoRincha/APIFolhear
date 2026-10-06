/**
 * Utilitários para conversão e formatação monetária (Real Brasileiro - BRL)
 */

export function parsePrice(priceStr) {
  if (typeof priceStr === 'number') return isNaN(priceStr) ? null : priceStr
  if (!priceStr || typeof priceStr !== 'string') return null

  // Remove R$, espaços e caracteres não numéricos exceto vírgula e ponto
  let cleaned = priceStr.replace(/R\$\s?/gi, '').trim()

  // Se houver formato brasileiro (ex: 1.250,50)
  if (cleaned.includes('.') && cleaned.includes(',')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.')
  } else if (cleaned.includes(',')) {
    cleaned = cleaned.replace(',', '.')
  }

  // Pega apenas o primeiro número decimal válido
  const match = cleaned.match(/\d+(\.\d{1,2})?/)
  if (!match) return null

  const num = parseFloat(match[0])
  return isNaN(num) ? null : num
}

export function formatBRL(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return 'R$ 0,00'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount)
}
