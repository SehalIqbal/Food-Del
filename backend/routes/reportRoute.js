import express from 'express';
import PDFDocument from 'pdfkit';
import moment from 'moment';
import Order from '../models/orderModel.js';  // Assuming your Order model is in the models directory
const router = express.Router();

router.get('/total-overview', async (req, res) => {
    try {
        const totalOrdersData = await Order.aggregate([
            { $match: { status: 'Delivered' } },

            // Calculate discount lost per order
            {
                $addFields: {
                    discountLost: {
                        $multiply: [
                            '$amount',
                            { $divide: ['$discount', 100] }
                        ]
                    }
                }
            },

            // Check values per order
            {
                $project: {
                    amount: 1,
                    discount: 1,
                    discountLost: 1,
                    'items.quantity': 1,
                    payment: 1
                }
            }
        ]);

        console.log('--- Individual Order Discount Debug ---');
        totalOrdersData.forEach((order, idx) => {
            console.log(`Order #${idx + 1}`);
            console.log(`Amount: $${order.amount}`);
            console.log(`Discount (%): ${order.discount}`);
            console.log(`Calculated Discount Lost: $${order.discountLost}`);
            console.log(`Items Sold:`, order.items.map(i => i.quantity));
            console.log(`Payment:`, order.payment);
            console.log('---------------------------------------');
        });

        // Now reduce it to final totals
        const overview = totalOrdersData.reduce((acc, order) => {
            acc.totalOrders += 1;
            acc.totalSales += order.amount;
            acc.totalItemsSold += order.items.reduce((sum, i) => sum + i.quantity, 0);
            acc.totalDiscountRevenue += order.discountLost;
            acc.totalDiscountLost += order.discountLost;

            if (order.payment === 'cod') acc.salesByPaymentMethod.cod += order.amount;
            else if (order.payment === 'stripe') acc.salesByPaymentMethod.stripe += order.amount;

            return acc;
        }, {
            totalOrders: 0,
            totalSales: 0,
            totalItemsSold: 0,
            totalDiscountRevenue: 0,
            totalDiscountLost: 0,
            salesByPaymentMethod: { cod: 0, stripe: 0 }
        });

        // Add delivery charges collected
        overview.deliveryChargesCollected = overview.totalOrders * 5;

        console.log('\n--- Final Overview Totals ---');
        console.log(JSON.stringify(overview, null, 2));

        res.json(overview);
    } catch (error) {
        console.error('Aggregation Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});


router.get('/item-wise-sales', async (req, res) => {
    try {
      const itemWiseSales = await Order.aggregate([
        { $match: { status: 'Delivered' } },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'foods',
            localField: 'items.foodId',
            foreignField: '_id',
            as: 'foodDetails'
          }
        },
        { $unwind: '$foodDetails' },
        {
          $group: {
            _id: '$foodDetails.name',
            quantitySold: { $sum: '$items.quantity' },
            totalRevenue: {
              $sum: {
                $multiply: ['$items.quantity', '$items.price']
              }
            }
          }
        },
        {
          $project: {
            _id: 1,
            quantitySold: 1,
            totalRevenue: { $round: ['$totalRevenue', 2] }
          }
        },
        { $sort: { quantitySold: -1 } }
      ]);
  
      res.json(itemWiseSales);
    } catch (error) {
      console.error('Error fetching item-wise sales:', error);
      res.status(500).json({ message: 'Server Error' });
    }
  });

  


  router.get('/generate-pdf', async (req, res) => {
    try {
      // === Fetch Total Overview ===
      const totalOverview = await Order.aggregate([
        { $match: { status: 'Delivered' } },
        {
          $addFields: {
            discountLost: {
              $multiply: ['$amount', { $divide: ['$discount', 100] }]
            }
          }
        },
        {
          $project: {
            amount: 1,
            discount: 1,
            discountLost: 1,
            'items.quantity': 1,
            payment: 1
          }
        }
      ]);
  
      const overview = totalOverview.reduce((acc, order) => {
        acc.totalOrders += 1;
        acc.totalSales += order.amount;
        acc.totalItemsSold += order.items.reduce((sum, i) => sum + i.quantity, 0);
        acc.totalDiscountRevenue += order.discountLost;
        acc.totalDiscountLost += order.discountLost;
  
        if (order.payment === 'cod') acc.salesByPaymentMethod.cod += order.amount;
        else if (order.payment === 'stripe') acc.salesByPaymentMethod.stripe += order.amount;
  
        return acc;
      }, {
        totalOrders: 0,
        totalSales: 0,
        totalItemsSold: 0,
        totalDiscountRevenue: 0,
        totalDiscountLost: 0,
        salesByPaymentMethod: { cod: 0, stripe: 0 }
      });
  
      overview.deliveryChargesCollected = overview.totalOrders * 5;
  
      // === Fetch Item-wise Sales ===
      const itemWiseSales = await Order.aggregate([
        { $match: { status: 'Delivered' } },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'foods',
            localField: 'items.foodId',
            foreignField: '_id',
            as: 'foodDetails'
          }
        },
        { $unwind: '$foodDetails' },
        {
          $group: {
            _id: '$foodDetails.name',
            quantitySold: { $sum: '$items.quantity' },
            totalRevenue: {
              $sum: {
                $multiply: ['$items.quantity', '$items.price']
              }
            }
          }
        },
        {
          $project: {
            _id: 1,
            quantitySold: 1,
            totalRevenue: { $round: ['$totalRevenue', 2] }
          }
        },
        { $sort: { quantitySold: -1 } }
      ]);
  
      // === Generate PDF ===
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=sales-report.pdf');
      doc.pipe(res);
  
      // === HEADER ===
      doc
        .fontSize(20)
        .fillColor('#333333')
        .text('Monthly Sales Report', { align: 'center' });
  
      doc
        .fontSize(10)
        .fillColor('#666666')
        .text(`Generated on: ${moment().format('MMMM Do YYYY, h:mm:ss a')}`, {
          align: 'center'
        });
  
      doc.moveDown(1.5);
  
      // === SECTION HEADER ===
      const sectionHeader = (label) => {
        doc
          .moveDown(0.8)
          .fontSize(14)
          .fillColor('#ffffff')
          .rect(40, doc.y, 520, 24)
          .fill('#1f3b4d')
          .fillColor('#ffffff')
          .text(`  ${label}`, 45, doc.y + 6, { align: 'center' })
          .fillColor('#000000')
          .moveDown(1);
      };
  
      sectionHeader('Summary Overview');
  
      // === Summary Table ===
      const summary = [
        ['Total Orders', overview.totalOrders],
        ['Total Sales', `$${overview.totalSales.toFixed(2)}`],
        ['Total Items Sold', overview.totalItemsSold],
        ['Total Discount Given', `$${overview.totalDiscountRevenue.toFixed(2)}`],
        ['Delivery Charges Collected', `$${overview.deliveryChargesCollected.toFixed(2)}`],
        ['Sales by COD', `$${overview.salesByPaymentMethod.cod.toFixed(2)}`],
        ['Sales by Stripe', `$${overview.salesByPaymentMethod.stripe.toFixed(2)}`]
      ];
  
      const labelX = 50;
const valueX = 500;
const rowHeight = 20;

summary.forEach(([label, value], i) => {
  const y = doc.y;

  // Alternate row color
  if (i % 2 === 0) {
    doc.rect(40, y, 520, rowHeight).fill('#f2f2f2');
    doc.fillColor('#000000');
  }

  // Draw text with fixed positions
  doc
    .fontSize(11)
    .fillColor('#000000')
    .text(label, labelX, y + 5)
    .text(String(value), valueX, y + 5, { align: 'right' });

  doc.moveDown(0.2);
});

  
      doc.moveDown(2);
  
      // === Item-wise Sales Section ===
      sectionHeader('Item-wise Sales');
  
      // Table Header
      doc
        .fontSize(12)
        .fillColor('#1f3b4d')
        .text('Item', 50, doc.y, { continued: true })
        .text('Quantity Sold', 250, doc.y, { continued: true })
        .text('Revenue ($)', 400, doc.y)
        .moveDown(0.3);
      doc.moveTo(40, doc.y).lineTo(560, doc.y).stroke();
      doc.fillColor('#000000');
  
     // Table column positions
        const colItemX = 50;
        const colQtyX = 280;
        const colRevX = 500;
        const rowHeightiws = 20;

itemWiseSales.forEach((item, i) => {
  const y = doc.y;

  // Alternate row background
  if (i % 2 === 0) {
    doc.rect(40, y, 520, rowHeightiws).fill('#f9f9f9');
    doc.fillColor('#000000');
  }

  // Text content with fixed positions
  doc
    .fontSize(11)
    .fillColor('#000000')
    .text(item._id, colItemX, y + 5)
    .text(`${item.quantitySold}`, colQtyX, y + 5)
    .text(`$${item.totalRevenue.toFixed(2)}`, colRevX, y + 5, { align: 'right' });

  doc.moveDown(0.2);
});

  
      doc.end();
    } catch (error) {
      console.error('PDF Generation Error:', error);
      res.status(500).json({ message: 'Failed to generate PDF report' });
    }
  });
  
  
export default router;
