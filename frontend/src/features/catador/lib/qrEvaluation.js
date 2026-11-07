const MAX_QR_VALUE_LENGTH = 500;

/** Obtiene el código de sesión de un QR de ConexCoffee o de una URL compartida. */
export function extractEvaluationCode(rawValue) {
  const value = String(rawValue ?? '').trim();
  if (!value || value.length > MAX_QR_VALUE_LENGTH) return null;

  try {
    const parsed = JSON.parse(value);
    if (parsed?.tipo === 'CONEXCOFFEE_EVALUACION' && typeof parsed.codigo === 'string') {
      return parsed.codigo.trim() || null;
    }
  } catch {
    // No todos los QR contienen JSON; continuar con URL o código plano.
  }

  try {
    const url = new URL(value);
    const code = url.searchParams.get('qr') || url.searchParams.get('codigo');
    return code?.trim() || null;
  } catch {
    return value;
  }
}

export function buildEvaluationQrPayload(codigo) {
  return JSON.stringify({ tipo: 'CONEXCOFFEE_EVALUACION', codigo });
}
