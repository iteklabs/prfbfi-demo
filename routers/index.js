const express = require("express");
const app = express();
const router = express.Router();
const auth = require("../middleware/auth");
const { profile, sales, sales_return, purchases, purchases_return, categories, product, suppliers, customer, master_shop, transfers, adjustment, purchases_finished, sales_finished, adjustment_finished, transfers_finished } = require("../models/all_models");
const users = require("../public/language/languages.json");


router.get("/index", auth, async(req, res) => {
    try {
        
        const {username, email, role} = req.user
        const role_data = req.user
        var cnt;
        if(role_data.warehouse_category == "Raw Materials"){
            const prod = await product.find({ product_category: "Raw Materials" });
            cnt = prod.length
        }else if(role_data.warehouse_category == "Finished Goods") {
            const prod = await product.find({ product_category: "Finished Goods" });
            cnt = prod.length
        }else{
            const prod = await product.find();
            cnt = prod.length
        }
        // res.json(role_data);
        // return
        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        
        const sale_data = await sales.aggregate([
            {
                $group: {
                    _id: null,
                    total_price: {$sum: "$total_price"},
                }
            }
        ])
        
        const sale_data_QTY = await sales.aggregate([
           {
            $unwind: "$sale_product" 
          },
          {
            $group: {
              _id: null,
              totalQuantity: { $sum: "$sale_product.quantity" } // Sum the quantities
            }
          }
        ])
        
           
        // console.log("11111", sale_data);

        const sales_return_data = await sales_return.aggregate([
            {
                $group: {
                    _id: null,
                    total: {$sum: "$total_amount"},
                }
            }
        ])
        
        
        const sales_return_data_QTY = await sales_return.aggregate([
           {
            $unwind: "$return_sale" 
          },
          {
            $group: {
              _id: null,
              totalQuantity: { $sum: "$return_sale.sale_qty" } // Sum the quantities
            }
          }
        ])
// res.status(200).send(sales_return_data_QTY)
        const purchases_data = await purchases.aggregate([
            {
                $group: {
                    _id: null,
                    total_amount: {$sum: "$total_amount"},
                }
            }
        ])

        const purchases_return_data = await purchases_return.aggregate([
            {
                $group: {
                    _id: null,
                    total: {$sum: "$total_amount"},
                }
            }
        ])
        
        
        const purchases_return_data_QTY = await purchases_return.aggregate([
           {
            $unwind: "$return_product" 
          },
          {
            $group: {
              _id: null,
              totalQuantity: { $sum: "$return_product.return_qty" } // Sum the quantities
            }
          }
        ])
        
        const purchases_data_QTY = await purchases.aggregate([
           {
            $unwind: "$product" 
          },
          {
            $group: {
              _id: null,
              totalQuantity: { $sum: "$product.quantity" } // Sum the quantities
            }
          }
        ])


        const purchases_table_data = await purchases.aggregate([
            {
                $sort: {
                    'invoice':-1
                }
            },
            { $limit : 5 },
            {
                $sort: {
                    'invoice':1
                }
            },
        ])


        const sales_table_data = await sales.aggregate([
            {
                $sort: {
                    'invoice':-1
                }
            },
            { $limit : 5 },
            {
                $sort: {
                    'invoice':1
                }
            },
        ])
        
        
        
        const transfer_table_data = await transfers.aggregate([
            {
                $unwind: "$product"
            },
            {
                $group: {
                  _id: "$product.product_name",
                  fromWarehouse: { "$first" : "$from_warehouse" },
                  toWareHouse: { "$first" : "$to_warehouse" },
                  FromtotalQuantity: { $sum : '$product.from_quantity' },
                  TototalQuantity: { $sum : '$product.to_quantity' },
                  
                }
            }
            
        ])
// res.status(200).json(transfer_table_data)
        const categories_data = await categories.find()

        const product_data = await product.find()
        
        const suppliers_data = await suppliers.find()
        
        const customer_data = await customer.find()


        
         
        //  const checkdata = await purchases.find({"date" : "2023-12-28" });
        //  res.json(purchases_line_graph_data);
        //  return
       

        if (master[0].language == "English (US)") {
            var lan_data = users.English
            // console.log(lan_data);
        } else if(master[0].language == "Hindi") {
            var lan_data = users.Hindi

        }else if(master[0].language == "German") {
            var lan_data = users.German
        
        }else if(master[0].language == "Spanish") {
            var lan_data = users.Spanish
        
        }else if(master[0].language == "French") {
            var lan_data = users.French
        
        }else if(master[0].language == "Portuguese (BR)") {
            var lan_data = users.Portuguese
        
        }else if(master[0].language == "Chinese") {
            var lan_data = users.Chinese
        
        }else if(master[0].language == "Arabic (ae)") {
            var lan_data = users.Arabic
        }
         
        res.render("index", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            sale: sale_data[0],
            sales_return: sales_return_data[0],
            purchases: purchases_data[0],
            purchases_return: purchases_return_data[0],
            purchases_table: purchases_table_data,
            sales_table: sales_table_data,
            categories: categories_data.length,
            product: product_data.length,
            suppliers: suppliers_data.length,
            customer: customer_data.length,
            master_shop : master,
            language : lan_data,
            sale_QTY: sale_data_QTY[0],
            purchases_QTY: purchases_data_QTY[0],
            sales_return_QTY: sales_return_data_QTY[0],
            purchases_return_QTY: purchases_return_data_QTY[0],
            transfer_table: transfer_table_data,
            product_cnt : cnt,
        })
    } catch (error) {
        console.log(error);
    }
})


router.get("/raw_line", auth, async(req, res) => {
    try {
        const purchases_line_graph_data = await purchases.aggregate([
            {
                $unwind: "$product" 
            },
            {
                $group: {
                
                _id: "$date",
                totalQuantity: { $sum: "$product.quantity" },
                date: { $first: "$date" },
                
                }
            },
            {
                $sort: { date: 1 } // Sort by date in ascending order
            }
        ])
        res.json(purchases_line_graph_data);

    } catch (error) {
        res.json(error);
    }
})

router.get("/raw_out_line", auth, async(req, res) => {
    try {
        const purchases_line_graph_data = await sales.aggregate([
            {
                $match : {
                    "finalize" : "True"
                }
            },
            {
                $unwind: "$sale_product" 
            },
            {
                $group: {
                
                _id: "$date",
                totalQuantity: { $sum: "$sale_product.quantity" },
                date: { $first: "$date" },
                
                }
            },
            {
                $sort: { date: 1 } // Sort by date in ascending order
            }
        ])
        res.json(purchases_line_graph_data);

    } catch (error) {
        res.json(error);
    }
})
router.get("/raw_adj_line", auth, async(req, res) => {
    try {
        const purchases_line_graph_data = await adjustment.aggregate([
            {
                $match : {
                    "finalize" : "True"
                }
            },
            {
                $unwind: "$product" 
            },
            {
                $group: {
                
                _id: "$date",
                totalQuantity: { $sum: "$product.adjust_qty" },
                date: { $first: "$date" },
                
                }
            },
            {
                $sort: { date: 1 } // Sort by date in ascending order
            }
        ])
        res.json(purchases_line_graph_data);

    } catch (error) {
        res.json(error);
    }
})

router.get("/raw_trf_line", auth, async(req, res) => {
    try {
        const purchases_line_graph_data = await transfers.aggregate([
            {
                $match : {
                    "finalize" : "True"
                }
            },            
            {
                $unwind: "$product" 
            },
            {
                $group: {
                
                _id: "$date",
                totalQuantity: { $sum: "$product.to_quantity" },
                date: { $first: "$date" },
                
                }
            },
            {
                $sort: { date: 1 } // Sort by date in ascending order
            }
        ])
        res.json(purchases_line_graph_data);

    } catch (error) {
        res.json(error);
    }
})


router.get("/fg_line", auth, async(req, res) => {
    try {
        const purchases_line_graph_data = await purchases_finished.aggregate([
            {
                $unwind: "$product" 
            },
            {
                $group: {
                
                _id: "$date",
                totalQuantity: { $sum: "$product.quantity" },
                date: { $first: "$date" },
                
                }
            },
            {
                $sort: { date: 1 } // Sort by date in ascending order
            }
        ])
        res.json(purchases_line_graph_data);

    } catch (error) {
        res.json(error);
    }
})


router.get("/fg_out_line", auth, async(req, res) => {
    try {
        const purchases_line_graph_data = await sales_finished.aggregate([
            {
                $match : {
                    "finalize" : "True"
                }
            },
            {
                $unwind: "$sale_product" 
            },
            {
                $group: {
                
                _id: "$date",
                totalQuantity: { $sum: "$sale_product.quantity" },
                date: { $first: "$date" },
                
                }
            },
            {
                $sort: { date: 1 } // Sort by date in ascending order
            }
        ])
        res.json(purchases_line_graph_data);

    } catch (error) {
        res.json(error);
    }
})

router.get("/fg_adj_line", auth, async(req, res) => {
    try {
        const purchases_line_graph_data = await adjustment_finished.aggregate([
            {
                $match : {
                    "finalize" : "True"
                }
            },
            {
                $unwind: "$product" 
            },
            {
                $group: {
                
                _id: "$date",
                totalQuantity: { $sum: "$product.adjust_qty" },
                date: { $first: "$date" },
                
                }
            },
            {
                $sort: { date: 1 } // Sort by date in ascending order
            }
        ])
        res.json(purchases_line_graph_data);

    } catch (error) {
        res.json(error);
    }
})


router.get("/fg_trf_line", auth, async(req, res) => {
    try {
        const purchases_line_graph_data = await transfers_finished.aggregate([
            {
                $match : {
                    "finalize" : "True"
                }
            },
            {
                $unwind: "$product" 
            },
            {
                $group: {
                
                _id: "$date",
                totalQuantity: { $sum: "$product.to_quantity" },
                date: { $first: "$date" },
                
                }
            },
            {
                $sort: { date: 1 } // Sort by date in ascending order
            }
        ])
        res.json(purchases_line_graph_data);

    } catch (error) {
        res.json(error);
    }
})


router.get("/rm_chart", auth, async(req, res) => {
    try {
        const purchases_line_graph_data = await purchases.aggregate([
            {
                $unwind: "$product" 
            },
            {
                $group: {
                
                _id: "$date",
                totalQuantity: { $sum: "$product.quantity" },
                date: { $first: "$date" },
                
                }
            },
            {
                $sort: { date: 1 } // Sort by date in ascending order
            }
        ])
        const sales_line_graph_data = await sales.aggregate([
            {
                $match : {
                    "finalize" : "True"
                }
            },
            {
                $unwind: "$sale_product" 
            },
            {
                $group: {
                
                _id: "$date",
                totalQuantity: { $sum: "$sale_product.quantity" },
                date: { $first: "$date" },
                
                }
            },
            {
                $sort: { date: 1 } // Sort by date in ascending order
            }
        ])

        const adjustment_line_graph_data = await adjustment.aggregate([
            {
                $match : {
                    "finalize" : "True"
                }
            },
            {
                $unwind: "$product" 
            },
            {
                $group: {
                
                _id: "$date",
                totalQuantity: { $sum: "$product.adjust_qty" },
                date: { $first: "$date" },
                
                }
            },
            {
                $sort: { date: 1 } // Sort by date in ascending order
            }
        ])

        const transfer_line_graph_data = await transfers.aggregate([
            {
                $match : {
                    "finalize" : "True"
                }
            },            
            {
                $unwind: "$product" 
            },
            {
                $group: {
                
                _id: "$date",
                totalQuantity: { $sum: "$product.to_quantity" },
                date: { $first: "$date" },
                
                }
            },
            {
                $sort: { date: 1 } // Sort by date in ascending order
            }
        ])


        res.json({purchases: purchases_line_graph_data, sales: sales_line_graph_data, adjustment : adjustment_line_graph_data, transfer: transfer_line_graph_data })
    } catch (error) {
        res.json(error);
    }
})


router.get("/fg_chart", auth, async(req, res) => {
    try {
        const prod = await product.find({ product_category: "Finished Goods" })
        res.json({count: prod.length})
    } catch (error) {
        res.json(error);
    }
})

module.exports = router;