import express from 'express';
import Product from '../models/productModel.js';

const productRouter = express.Router();

// Route to get all products
productRouter.get('/', async (req, res) => {
  try {
    console.log('Fetching all products...');
    const products = await Product.find();
    console.log('Products fetched:', products);
    res.send(products);
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).send({ message: error.message });
  }
});

const PAGE_SIZE = 6;

// Route to search for products
productRouter.get('/search', async (req, res) => {
  try {
    const { query } = req;
    const pageSize = query.pageSize || PAGE_SIZE;
    const page = query.page || 1;
    const category = query.category || '';
    const price = query.price || '';
    const rating = query.rating || '';
    const order = query.order || '';
    const searchQuery = query.query || '';

    const queryFilter =
      searchQuery && searchQuery !== 'all'
        ? {
            name: {
              $regex: searchQuery,
              $options: 'i',
            },
          }
        : {};
    const categoryFilter = category && category !== 'all' ? { category } : {};
    const ratingFilter =
      rating && rating !== 'all'
        ? {
            rating: {
              $gte: Number(rating),
            },
          }
        : {};
    const priceFilter =
      price && price !== 'all'
        ? {
            // 1-50
            price: {
              $gte: Number(price.split('-')[0]),
              $lte: Number(price.split('-')[1]),
            },
          }
        : {};
    const sortOrder =
      order === 'featured'
        ? { featured: -1 }
        : order === 'lowest'
        ? { price: 1 }
        : order === 'highest'
        ? { price: -1 }
        : order === 'toprated'
        ? { rating: -1 }
        : order === 'newest'
        ? { createdAt: -1 }
        : { _id: -1 };

    console.log('Searching for products with filters:', {
      queryFilter,
      categoryFilter,
      priceFilter,
      ratingFilter,
      sortOrder,
      pageSize,
      page
    });

    const products = await Product.find({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    })
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countProducts = await Product.countDocuments({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    });

    console.log('Products found:', products);
    console.log('Total products count:', countProducts);

    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  } catch (error) {
    console.error('Error searching products:', error.message);
    res.status(500).send({ message: error.message });
  }
});

// Route to get product categories
productRouter.get('/categories', async (req, res) => {
  try {
    console.log('Fetching product categories...');
    const categories = await Product.find().distinct('category');
    console.log('Categories fetched:', categories);
    res.send(categories);
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    res.status(500).send({ message: error.message });
  }
});

// Route to get a product by slug
productRouter.get('/slug/:slug', async (req, res) => {
  try {
    console.log('Fetching product with slug:', req.params.slug);
    const product = await Product.findOne({ slug: req.params.slug });
    if (product) {
      console.log('Product fetched:', product);
      res.send(product);
    } else {
      console.log('Product not found:', req.params.slug);
      res.status(404).send({ message: 'Product Not Found' });
    }
  } catch (error) {
    console.error('Error fetching product by slug:', error.message);
    res.status(500).send({ message: error.message });
  }
});

// Route to get a product by ID
productRouter.get('/:id', async (req, res) => {
  try {
    console.log('Fetching product with ID:', req.params.id);
    const product = await Product.findById(req.params.id);
    if (product) {
      console.log('Product fetched:', product);
      res.send(product);
    } else {
      console.log('Product not found:', req.params.id);
      res.status(404).send({ message: 'Product Not Found' });
    }
  } catch (error) {
    console.error('Error fetching product by ID:', error.message);
    res.status(500).send({ message: error.message });
  }
});

export default productRouter;
