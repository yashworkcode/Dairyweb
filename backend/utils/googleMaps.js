/**
 * Builds a Google Maps search link for a free-text address.
 * Frontend uses the same formula so the link is always reproducible.
 * @param {string} address
 * @returns {string}
 */
const buildGoogleMapLink = (address) => {
  if (!address) return "";
  const query = encodeURIComponent(address.trim());
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
};

module.exports = buildGoogleMapLink;
