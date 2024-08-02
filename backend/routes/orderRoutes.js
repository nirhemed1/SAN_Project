import express from 'express';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import { isAuth, isAdmin } from '../utils.js';

const orderRouter = express.Router();

// Route to create a new order
orderRouter.post('/', isAuth, async (req, res) => {
  try {
    console.log('Creating a new order...');
    const newOrder = new Order({
      orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      itemsPrice: req.body.itemsPrice,
      shippingPrice: req.body.shippingPrice,
      taxPrice: req.body.taxPrice,
      totalPrice: req.body.totalPrice,
      user: req.user._id,
    });

    const order = await newOrder.save();
    console.log('New order created:', order);
    res.status(201).send({ message: 'New Order Created', order });
  } catch (error) {
    console.error('Error creating order:', error.message);
    res.status(500).send({ message: error.message });
  }
});

// Route to get order summary
orderRouter.get('/summary', isAuth, isAdmin, async (req, res) => {
  try {
    console.log('Fetching order summary...');
    const orders = await Order.aggregate([
      {
        $group: {
          _id: null,
          numOrders: { $sum: 1 },
          totalSales: { $sum: '$totalPrice' },
        },
      },
    ]);
    const users = await User.aggregate([
      {
        $group: {
          _id: null,
          numUsers: { $sum: 1 },
        },
      },
    ]);
    const dailyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          sales: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    const productCategories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);
    console.log('Order summary fetched:', { users, orders, dailyOrders, productCategories });
    res.send({ users, orders, dailyOrders, productCategories });
  } catch (error) {
    console.error('Error fetching order summary:', error.message);
    res.status(500).send({ message: error.message });
  }
});

// Route to get orders for the authenticated user
orderRouter.get('/mine', isAuth, async (req, res) => {
  try {
    console.log('Fetching orders for user:', req.user._id);
    const orders = await Order.find({ user: req.user._id });
    console.log('Orders for user fetched:', orders);
    res.send(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error.message);
    res.status(500).send({ message: error.message });
  }
});

// Route to get a single order by ID
orderRouter.get('/:id', isAuth, async (req, res) => {
  try {
    console.log('Fetching order with ID:', req.params.id);
    const order = await Order.findById(req.params.id);
    if (order) {
      console.log('Order fetched:', order);
      res.send(order);
    } else {
      console.log('Order not found:', req.params.id);
      res.status(404).send({ message: 'Order Not Found' });
    }
  } catch (error) {
    console.error('Error fetching order by ID:', error.message);
    res.status(500).send({ message: error.message });
  }
});

// Route to update the payment status of an order
orderRouter.put('/:id/pay', isAuth, async (req, res) => {
  try {
    console.log('Updating payment for order ID:', req.params.id);
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };

      const updatedOrder = await order.save();
      console.log('Order payment updated:', updatedOrder);
      res.send({ message: 'Order Paid', order: updatedOrder });
    } else {
      console.log('Order not found:', req.params.id);
      res.status(404).send({ message: 'Order Not Found' });
    }
  } catch (error) {
    console.error('Error updating order payment:', error.message);
    res.status(500).send({ message: error.message });
  }
});

// Route to get a list of all orders (for admin)
orderRouter.get('/orderlist', isAuth, isAdmin, async (req, res) => {
  try {
    console.log('Fetching all orders...');
    const orders = await Order.find({});
    console.log('All orders fetched:', orders);
    res.send(orders);
  } catch (error) {
    console.error('Error fetching all orders:', error.message);
    res.status(500).send({ message: error.message });
  }
});

export default orderRouter;
