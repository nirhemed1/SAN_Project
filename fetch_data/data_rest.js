const mongoose = require('mongoose');
const fs = require('fs');

// Fetch and save products to MongoDB
async function fetchAndTransformData() {
  try {
    const response = await fetch('https://fakestoreapi.in/api/products');
    const result = await response.json();
    const products = result.products;
    console.log(products);
    const transformedProducts = products.map(product => ({
      name: product.title,
      slug: generateSlug(product.title),
      category: product.category.toLowerCase(),
      image: product.image,
      price: parseFloat(product.price),
      countInStock: Math.floor(Math.random() * 10) + 1,
      brand: product.brand.toLowerCase(),
      rating: parseFloat((Math.random() * 1 + 4).toFixed(1)), // Generate rating between 4 and 5
      numReviews: Math.floor(Math.random() * 100) + 1,
      description: product.description
    }));

    // Convert JavaScript object to JSON string
    const jsonContent = JSON.stringify(transformedProducts, null, 2);

    // Write JSON string to a file
    fs.writeFileSync('transformed-products.json', jsonContent);

    console.log('Data has been written to transformed-products.json');

  } catch (error) {
    console.error('Error fetching or transforming data:', error);
  }
}

// Function to generate slug (basic version)
function generateSlug(title) {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
}

fetchAndTransformData();
