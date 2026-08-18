/**
 * Utility functions for Saree SKU and Product ID sanitization and formatting.
 */

export function sanitizeSku(rawSku, rawId) {
  const rawIdStr = String(rawId || '').replace(/\D/g, '');
  const numId = rawIdStr ? parseInt(rawIdStr, 10) : 1;
  const padId = numId ? String(numId).padStart(4, '0') : '0001';
  const formattedProductId = numId >= 1000000 ? `NSY${numId}` : `NSY${padId}`;

  let rawSellerSku = typeof rawSku === 'string' ? rawSku.trim() : '';

  // Strip catalog prefix like "M5||", old NSY tags, and leading dashes
  let cleanSellerSku = rawSellerSku
    .replace(/^[A-Z0-9]+\|\|/i, '')
    .replace(/\s*-\s*NSY\d+/ig, '')
    .replace(/^NSY\d+/ig, '')
    .replace(/^[\s\-\|]+/, '')
    .trim();

  // Return clean SKU with clean NSY suffix
  if (cleanSellerSku) {
    return cleanSellerSku.includes(formattedProductId)
      ? cleanSellerSku
      : `${cleanSellerSku} - ${formattedProductId}`;
  }

  return formattedProductId;
}
