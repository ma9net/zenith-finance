import Big from 'big.js';

export class MathUtils {
  /**
   * Sanitizes and converts any string/number into a Big.js object.
   * Handles European commas, currency symbols, and stray characters.
   */
  static toSafeBig(input: string | number | null | undefined): Big {
    if (input === null || input === undefined || input === '') {
      return new Big(0);
    }

    const strInput = String(input);

    // FIX: Global replace for commas. "1,000,000" becomes "1.000.000"
    // then we strip all but the LAST dot later if needed, 
    // but Big.js handles "123.45" perfectly.
    const normalized = strInput.replace(/,/g, '.');

    // Remove everything except numbers and the decimal dot
    const sanitized = normalized.replace(/[^0-9.]/g, '');

    // Handle edge cases like "..." or multiple dots
    const parts = sanitized.split('.');
    const finalCleanString = parts.length > 1 
      ? `${parts[0]}.${parts.slice(1).join('')}` 
      : parts[0];

    try {
      return finalCleanString ? new Big(finalCleanString) : new Big(0);
    } catch (e) {
      console.error('MathUtils: Conversion failed for', input);
      return new Big(0);
    }
  }
}