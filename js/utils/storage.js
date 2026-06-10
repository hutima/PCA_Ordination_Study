// Storage utilities

export function getStorage() {
  try {
    return window.localStorage;
  } catch (err) {
    return null;
  }
}

export function isLikelyIOS() {
  const ua = window.navigator.userAgent || '';
  const platform = window.navigator.platform || '';
  return /iPad|iPhone|iPod/.test(ua) || (platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
}
