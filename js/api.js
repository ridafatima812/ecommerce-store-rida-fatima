/**
 * API module for fetching data from the Fake Store API.
 */

const API_URL = 'https://fakestoreapi.com/products';

/**
 * Fetches all products from the Fake Store API.
 * @returns {Promise<Array>} List of products
 */
const fetchAllProducts = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};
