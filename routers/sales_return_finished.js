const express = require("express");
const app = express();
const router = express.Router();
const { profile, master_shop, categories, brands, units, product, warehouse, staff, customer, suppliers, purchases, purchases_return, sales, sales_return, customer_payment, c_payment_data, sales_return_finished } = require("../models/all_models");
const auth = require("../middleware/auth");
const users = require("../public/language/languages.json");


router.get("/view", auth, async (req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user
        
        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()

        const all_data = await sales_return_finished.aggregate([
            {
                $lookup:
                {
                    from: "customers",
                    localField: "customer",
                    foreignField: "name",
                    as: "customer_docs"
                }
            },
            {
                $unwind: "$customer_docs"
            }
        ])

        if (master[0].language == "English (US)") {
            var lan_data = users.English
            console.log(lan_data);
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

        res.render("sales_return_finished", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            master_shop : master,
            user : all_data,
            language : lan_data
        })
    } catch (error) {
        console.log(error);
    }
})


router.get("/view/:id", auth, async (req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user
        
        const profile_data = await profile.findOne({email : role_data.email})


        const master = await master_shop.find()
        console.log("master" , master);

        const _id = req.params.id
        console.log(_id);
        // const warehouse_data = await warehouse.findOne({ name: "Return Goods" });
        var rooms = ["Return Rooms"]
        const user_id = await sales_return_finished.findById(_id);
        // res.json(user_id)

        
        const stock_data = await warehouse.aggregate([
            {
                $match: { 
                    "name": user_id.ToWarehouse,
                    "room": user_id.ToRoom 
                }
            },
            {
                $unwind: "$product_details"
            },
            {
                $group: {
                    _id: "$product_details._id",
                    name: { $first: "$product_details.product_name"},
                    product_stock: { $first: "$product_details.product_stock" },
                    bay: { $first: "$product_details.bay" },
                    bin: { $first: "$product_details.bin" },
                    type: { $first: "$product_details.type" },
                    floorlevel: { $first: "$product_details.floorlevel" },
                    primary_code: { $first: "$product_details.primary_code" },
                    secondary_code: { $first: "$product_details.secondary_code" },
                    product_code: { $first: "$product_details.product_code" },
                    storage: { $first: "$product_details.storage" },
                    rack: { $first: "$product_details.rack" },
                }
            },
        ])
        console.log(stock_data);


        const warehouse_data = await warehouse.aggregate([
            {
                $match: { 
                    "status": 'Enabled',
                    // "name": "Return Goods",
                    "warehouse_category" : "Finished Goods"
                }
            },
            {
                $group: {
                    _id: "$name",
                    name: { $first: "$name" }
                }
            },
            {
                $sort: {
                    name: 1 // 1 for ascending order, -1 for descending order
                }
            }
        ]);


        const warehouse_data_QA = await warehouse.aggregate([
            {
                $match: { 
                    "status": 'Enabled',
                    "name": "QA Warehouse",
                }
            },
            {
                $group: {
                    _id: "$name",
                    name: { $first: "$name" }
                }
            },
            {
                $sort: {
                    name: 1 // 1 for ascending order, -1 for descending order
                }
            }
        ]);


        const product_data = await product.find({})

        if (master[0].language == "English (US)") {
            var lan_data = users.English
            console.log(lan_data);
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

        res.render("return_sale_edit_finished", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            master_shop : master,
            user: user_id,
            stock: stock_data,
            unit: product_data,
            language : lan_data,
            warehouses: warehouse_data,
            rooms: rooms,
            warehouse_QA : warehouse_data_QA
        })
    } catch (error) {
        console.log(error);
    }
})

router.post("/view/:id", auth, async (req, res) => {

    if(req.body.for_categorize == "QA"){
        try {
            const _id = req.params.id
            const old_data = await sales_return.findOne({invoice : req.body.invoice})    
    
            const old_warehouse_data = await warehouse.findOne({ name: old_data.ToWarehouse, room: old_data.ToRoom });
        
            const { invoice, customer, date, warehouse_name, product_name, primary_code, secondary_code, product_code, sales_quantity, stocks, return_qty, note,to_warehouse_name_QA, to_Room_name_QA } = req.body
    
            if(typeof product_name_QA == "string"){
                var product_name_array = [req.body.product_name_QA]
                var primary_code_array = [req.body.primary_code_QA]
                var secondary_code_array = [req.body.secondary_code_QA]
                var product_code_array = [req.body.product_code_QA]
                var purchase_quantity_array = [req.body.sales_quantity_QA]
                var stocks_array = [req.body.stocks_QA]
                var return_qty_array = [req.body.return_qty_QA]
                
            }else{
                var product_name_array = [...req.body.product_name_QA]
                var primary_code_array = [...req.body.primary_code_QA]
                var secondary_code_array = [...req.body.secondary_code_QA]
                var product_code_array = [...req.body.product_code_QA]
                var purchase_quantity_array = [...req.body.sales_quantity_QA]
                var stocks_array = [...req.body.stocks_QA]
                var return_qty_array = [...req.body.return_qty_QA]
    
            } 
            
            const newproduct = product_name_array.map((value)=>{
                
                return  value  = {
                            product_name : value,
                        }   
            })
            
            primary_code_array.forEach((value, i) => {
                newproduct[i].primary_code = value
            })
            
    
            secondary_code_array.forEach((value, i) => {
                newproduct[i].secondary_code = value
            })
    
            product_code_array.forEach((value, i) => {
                newproduct[i].product_code = value
            })
    
            purchase_quantity_array.forEach((value, i) => {
                newproduct[i].sale_qty = value
            })
    
            stocks_array.forEach((value, i) => {
                newproduct[i].stock = value
            })
    
            return_qty_array.forEach((value, i) => {
                newproduct[i].return_qty = value
            })

        
            // var error = 0
            // newproduct.forEach(data => {
            //     console.log("foreach newproduct", data);
            //     if (parseInt(data.sale_qty) < parseInt(data.return_qty) || (parseInt(data.stock) < parseInt(data.return_qty) && parseInt(data.sale_qty) > parseInt(data.return_qty)) || parseInt(data.return_qty) == 0 ) {
                    
            //         error++
            //     }
            // })
            // if (error != 0) {
                
            //     req.flash("errors", `Must not be greater than sale Qty`)
            //     return res.redirect("back")
            // }
    
    

            old_data.return_sale_QA.forEach(product_details => {
                // console.log("if product_details", product_details);
    
    
    
                const match_data = old_warehouse_data.product_details.map((data) => {
                    // console.log("map", data);
    
                    if (data.product_name == product_details.product_name) {
                        data.product_stock = parseInt(data.product_stock) + parseInt(product_details.return_qty)
                        
                    }
    
                })
            })
            await old_warehouse_data.save()
    
    
    
    
            old_data.invoice = invoice
            old_data.customer = customer
            old_data.date = date
            old_data.warehouse_name = warehouse_name
            old_data.return_sale_QA = newproduct
            old_data.note = note
            old_data.ToWarehouse = to_warehouse_name_QA
            old_data.ToRoom = to_Room_name_QA
            
            
            const new_data = await old_data.save() 
    
    
            // -------- supplier payment ------- //
    
            const c_payment = await c_payment_data.findOne({invoice : req.body.invoice , reason : "Sale Return"})
    
            c_payment.suppliers = req.body.suppliers
            c_payment.date = req.body.date
    
    
            await c_payment.save()
    
            // -------- supplier payment end ------- //
    
    
    
            req.flash("success", `purchase return successfully`)
            res.redirect("/sales_return_finished/view")
        } catch (error) {
            console.log(error);
            res.status(200).json({ message: error.message })
        } 
    }else{
        try {
            const _id = req.params.id
            console.log(_id);
    
            const old_data = await sales_return.findOne({invoice : req.body.invoice})
            console.log("old_data" , old_data);
    
    
            const old_warehouse_data = await warehouse.findOne({ name: old_data.ToWarehouse, room: old_data.ToRoom });
            console.log("old_warehouse_data", old_warehouse_data);
    
    
            
    
    
    
            const { invoice, customer, date, warehouse_name, product_name, primary_code, secondary_code, product_code, sales_quantity, stocks, return_qty, note,to_warehouse_name, to_Room_name } = req.body
            console.log(req.body);
    
            if(typeof product_name == "string"){
                var product_name_array = [req.body.product_name]
                var primary_code_array = [req.body.primary_code]
                var secondary_code_array = [req.body.secondary_code]
                var product_code_array = [req.body.product_code]
                var purchase_quantity_array = [req.body.sales_quantity]
                var stocks_array = [req.body.stocks]
                var return_qty_array = [req.body.return_qty]
                var level_array = [req.body.bay]
                var isle_array = [req.body.bin]
                var pallet_array = [req.body.types]
                var floorlevel_array = [req.body.floorlevel]
                
                // console.log("if");
            }else{
                var product_name_array = [...req.body.product_name]
                var primary_code_array = [...req.body.primary_code]
                var secondary_code_array = [...req.body.secondary_code]
                var product_code_array = [...req.body.product_code]
                var purchase_quantity_array = [...req.body.sales_quantity]
                var stocks_array = [...req.body.stocks]
                var return_qty_array = [...req.body.return_qty]
                var level_array = [...req.body.bay]
                var isle_array = [...req.body.bin]
                var pallet_array = [...req.body.types]
                var floorlevel_array = [...req.body.floorlevel]
    
                // console.log("else", product_name_array);
            } 
            
            const newproduct = product_name_array.map((value)=>{
                
                return  value  = {
                            product_name : value,
                        }   
            })
            
            primary_code_array.forEach((value, i) => {
                newproduct[i].primary_code = value
            })
            
    
            secondary_code_array.forEach((value, i) => {
                newproduct[i].secondary_code = value
            })
    
            product_code_array.forEach((value, i) => {
                newproduct[i].product_code = value
            })
    
            purchase_quantity_array.forEach((value, i) => {
                newproduct[i].sale_qty = value
            })
    
            stocks_array.forEach((value, i) => {
                newproduct[i].stock = value
            })
    
            return_qty_array.forEach((value, i) => {
                newproduct[i].return_qty = value
            })
    
            level_array.forEach((value, i) => {
                newproduct[i].bay = value
            })
    
            isle_array.forEach((value, i) => {
                newproduct[i].bin = value
            })
    
            pallet_array.forEach((value, i) => {
                newproduct[i].type = value
            })
    
            floorlevel_array.forEach((value, i) => {
                newproduct[i].floorlevel = value
            })
            
    
    
    
            
            var error = 0
            newproduct.forEach(data => {
                console.log("foreach newproduct", data);
                if (parseInt(data.sale_qty) < parseInt(data.return_qty) || (parseInt(data.stock) < parseInt(data.return_qty) && parseInt(data.sale_qty) > parseInt(data.return_qty)) || parseInt(data.return_qty) == 0 ) {
                    
                    error++
                }
            })
            if (error != 0) {
                
                req.flash("errors", `Must not be greater than sale Qty`)
                return res.redirect("back")
            }
    
    
    
    
            old_data.return_sale.forEach(product_details => {
                // console.log("if product_details", product_details);
    
    
    
                const match_data = old_warehouse_data.product_details.map((data) => {
                    // console.log("map", data);
    
                    if (data.product_name == product_details.product_name && data.floorlevel == product_details.floorlevel && data.type == product_details.type && data.bin == product_details.bin && data.bay == product_details.bay) {
                        data.product_stock = parseInt(data.product_stock) + parseInt(product_details.return_qty)
                        
                    }
    
                })
            })
            console.log("old_warehouse_data", old_warehouse_data);
            await old_warehouse_data.save()
    
    
    
    
            old_data.invoice = invoice
            old_data.customer = customer
            old_data.date = date
            old_data.warehouse_name = warehouse_name
            old_data.return_sale = newproduct
            old_data.note = note
            old_data.ToWarehouse = to_warehouse_name
            old_data.ToRoom = to_Room_name
            // old_data.payable_to_customer = payable_to_customer
            
            
            const new_data = await old_data.save()
            console.log("new new_data", new_data);
    
    
    
            // -------- supplier payment ------- //
    
            const c_payment = await c_payment_data.findOne({invoice : req.body.invoice , reason : "Sale Return"})
    
            c_payment.suppliers = req.body.suppliers
            c_payment.date = req.body.date
    
    
            await c_payment.save()
    
            // -------- supplier payment end ------- //
    
    
    
            req.flash("success", `purchase return successfully`)
            res.redirect("/sales_return/view")
        } catch (error) {
            console.log(error);
            res.status(200).json({ message: error.message })
        }
    }
    
})

// // ========= Give Payment ============= //

router.post("/give_payment/:id", auth, async (req, res) => {
    try {
        const _id = req.params.id;
        const { invoice, customer, payable_to_customer, paid_amount } = req.body
        
        const data = await sales_return.findById(_id)
        console.log("data" , data);
        console.log(payable_to_customer);
        console.log(paid_amount);

        var subtract = payable_to_customer - paid_amount
        console.log("subtract" , subtract);


        data.paid_amount = parseFloat(paid_amount) + parseFloat(data.paid_amount)
        data.due_amount = subtract


        console.log(data);
        const new_data = await data.save();
        // console.log(new_data);


        // -------- c_payment ------- //
        console.log(111111);
        const c_payment = await c_payment_data.findOne({invoice : req.body.invoice , reason : "Sale Return"})
        console.log("c_payment" , c_payment);

        c_payment.amount = subtract
        await c_payment.save()

        // -------- c_payment end ------- //


        // -------- supplier payment ------- //

        let date_ob = new Date();
        let newdate = ("0" + date_ob.getDate()).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        let final_date = year + "-" + month + "-" + newdate
       
        const customer_payment_data = new customer_payment({invoice, date : year + "-" + month + "-" + newdate, customer, reason : "Returned Payment For Sale Return", amount : paid_amount})

        const new_customer_payment = await customer_payment_data.save()

        // -------- supplier payment end ------- //



        req.flash('success', `payment successfull`)
        res.redirect("/sales_return/view")
    } catch (error) {
        console.log(error);
    }
})


router.get("/invoice/:id", auth, async (req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user

        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        console.log("master" , master);

        const _id = req.params.id

        const user_id = await sales_return.findById(_id);
        console.log(user_id);
        

        const customer_data = await customer.findOne({ name : user_id.customer });
        console.log(customer_data);
        
        if (master[0].language == "English (US)") {
            var lan_data = users.English
            console.log(lan_data);
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
        res.render("sales_return_invoice", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            master_shop : master,
            customers : customer_data,
            sales : user_id,
            language : lan_data
        })
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;    