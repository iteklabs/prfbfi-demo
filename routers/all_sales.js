const express = require("express");
const app = express();
const router = express.Router();
const { profile, master_shop, categories, brands, units, product, warehouse, staff, customer, suppliers, purchases, purchases_return, sales, sales_return, suppliers_payment, customer_payment, c_payment_data, email_settings, supervisor_settings } = require("../models/all_models");
const auth = require("../middleware/auth");
const nodemailer = require('nodemailer');
const users = require("../public/language/languages.json");


router.get("/view", auth, async (req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user

        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        let all_data
        if(role_data.role == "staff"){
            const staff_data = await staff.findOne({ email: role_data.email })
            // all_data = await sales.find({ warehouse_name : staff_data.warehouse});

            all_data = await sales.aggregate([
                {
                  $lookup: {
                    from: "customers",
                    localField: "customer",
                    foreignField: "name",
                    as: "customers_docs"
                  }
                },
                {
                  $unwind: "$customers_docs"
                },
                {
                  $unwind: "$sale_product"
                },
                {
                  $group: {
                    _id: "$_id",
                    invoice: { $first: "$invoice" },
                    customers: { $first: "$customer" },
                    date: { $first: "$date" },
                    warehouse_name: { $first: "$warehouse_name" },
                    sale_product: { $push: "$sale_product" },
                    note: { $first: "$note" },
                    return_data: { $first: "$return_data" },
                    customers_docs: { $first: "$customers_docs" },
                    total_saleproduct_quantity: { $sum: "$sale_product.quantity" },
                    level: { $addToSet: "$sale_product.bay" },
                    isle: { $addToSet: "$sale_product.bin" },
                    type: { $addToSet: "$sale_product.type" },
                    pallet: { $addToSet: "$sale_product.floorlevel" },
                    finalize: { $first: "$finalize" },
                    isAllowEdit: { $first: "$isAllowEdit"}
                  }
                  
                },
                {
                  $project: {
                    _id: 1,
                    invoice: 1,
                    customers: 1,
                    date: 1,
                    warehouse_name: 1,
                    sale_product: 1,
                    note: 1,
                    return_data: 1,
                    customers_docs: 1,
                    total_saleproduct_quantity: 1,
                    level: 1,
                    isle: 1,
                    type:1,
                    pallet: 1,
                    finalize: 1,
                    isAllowEdit: 1
                    
                  }
               }
            ]);

        }else{
            // all_data = await sales.find();

            all_data = await sales.aggregate([
                {
                  $lookup: {
                    from: "customers",
                    localField: "customer",
                    foreignField: "name",
                    as: "customers_docs"
                  }
                },
                {
                  $unwind: "$customers_docs"
                },
                {
                  $unwind: "$sale_product"
                },
                {
                  $group: {
                    _id: "$_id",
                    invoice: { $first: "$invoice" },
                    customers: { $first: "$customer" },
                    date: { $first: "$date" },
                    warehouse_name: { $first: "$warehouse_name" },
                    sale_product: { $push: "$sale_product" },
                    note: { $first: "$note" },
                    return_data: { $first: "$return_data" },
                    customers_docs: { $first: "$customers_docs" },
                    total_saleproduct_quantity: { $sum: "$sale_product.quantity" },
                    level: { $addToSet: "$sale_product.bay" },
                    isle: { $addToSet: "$sale_product.bin" },
                    type: { $addToSet: "$sale_product.type" },
                    pallet: { $addToSet: "$sale_product.floorlevel" },
                    finalize: { $first: "$finalize" },
                    isAllowEdit: { $first: "$isAllowEdit"}
                  }
                  
                },
                {
                  $project: {
                    _id: 1,
                    invoice: 1,
                    customers: 1,
                    date: 1,
                    warehouse_name: 1,
                    sale_product: 1,
                    note: 1,
                    return_data: 1,
                    customers_docs: 1,
                    total_saleproduct_quantity: 1,
                    level: 1,
                    isle: 1,
                    type:1,
                    pallet: 1,
                    finalize: 1,
                    isAllowEdit: 1
                    
                  }
               }
            ]);
        //   res.json(sales_data)  
            
        }
        
        console.log("sales all_data", all_data);

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

        res.render("all_sales", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            sales: all_data,
            profile : profile_data,
            role : role_data,
            master_shop : master,
            language : lan_data
        })
    } catch (error) {
        console.log(error);
    }
})
async function getRandom8DigitNumber() {
    const min = 10000000;
    const max = 99999999; 
    
    const random = Math.floor(Math.random() * (max - min + 1)) + min;
    var IDInvoice;


    const new_purchase = await sales.findOne({ invoice: "OUT-"+random });
    if (new_purchase && new_purchase.length > 0) {
        IDInvoice = "OUT-"+random;
    }else{
        IDInvoice = "OUT-"+random; 
    }
    return IDInvoice ;
}
router.get("/view/add_sales", auth, async (req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user

        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        // console.log("master" , master);

        const customer_data = await customer.find({})
        // const warehouse_data = await warehouse.find({status : "Enabled"})
        let warehouse_data
        if(role_data.role == "staff"){
            const staff_data = await staff.findOne({ email: role_data.email })
            // warehouse_data = await warehouse.find({status : 'Enabled', name: staff_data.warehouse });
            warehouse_data = await warehouse.aggregate([
                {
                    $match: { 
                        "status" : 'Enabled',
                        "name" : staff_data.warehouse,
                        "warehouse_category": "Raw Materials",
                        "name": { $ne: "Return Goods" }
                    }
                },
                {
                    $group: {
                        _id: "$name",
                        name: { $first: "$name"}
                    }
                },
                {
                    $sort: {
                        name: 1 // 1 for ascending order, -1 for descending order
                    }
                }
            ])
        }else{
            // warehouse_data = await warehouse.find({status : 'Enabled'});
            warehouse_data = await warehouse.aggregate([
                {
                    $match: { 
                        "status": 'Enabled',
                        "warehouse_category": "Raw Materials",
                        "name": { $ne: "Return Goods" }
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
            
        }
        
        const product_data = await product.find({})
        var rooms = ["Ambient","Enclosed"]

        const sales_data = await sales.find({})
        const invoice_noint = sales_data.length + 1
        const invoice_no = "OUT-" + invoice_noint.toString().padStart(5, "0")

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


        const randominv = getRandom8DigitNumber();

        randominv.then(invoicedata => {

            res.render("add_sales", {
                success: req.flash('success'),
                errors: req.flash('errors'),
                role : role_data,
                profile : profile_data,
                customer: customer_data,
                warehouse: warehouse_data,
                product: product_data,
                invoice: invoicedata,
                master_shop : master,
                language : lan_data,
                rooms_data : rooms 
            })

        }).catch(error => {
            req.flash('errors', `There's a error in this transaction`)
            res.redirect("/all_sales/view");
        })
    } catch (error) {
        console.log(error);
    }
})

// ======= product ajax router ========= //

router.get("/view/add_sales/:id", auth, async (req, res) => {
    try {
        const warehouse = req.params.id
        console.log(warehouse);
        const product_data = await product.find()

        const purchases_data = await purchases.aggregate([
            {
                $match: { "warehouse_name": warehouse }
            },
            {
                $unwind: "$product"
            },
            {
                $group: {
                    _id: "$product.product_name", 
                }
            },
        ])
        console.log("purchases_data" , purchases_data);

        res.status(200).json({ purchases_data, product_data })
    } catch (error) {
        console.log(error);
    }
})

// ======= product ajax router end ========= //


router.post("/view/add_sale/product", auth, async (req, res) => {   
    try {
        const { warehouse_data, product_data } = req.body
        console.log(req.body.product_data);;

        const master = await master_shop.find()
        console.log("master" , master);

        const new_product = await product.findOne({name : product_data})
        console.log("product", new_product);

        const stock_data = await warehouse.aggregate([
            {
                $match: { "name": warehouse_data }
            },
            {
                $unwind: "$product_details"
            },
            {
                $match: { "product_details.product_name": product_data }
            },
            {
                $group: {
                    _id: "$product_details.product_name",
                    product_stock: { $first: "$product_details.product_stock" }
                }
            },
        ])
        console.log("stock_data", stock_data);
            
        
        res.status(200).json({master, new_product, stock_data})
    } catch (error) {
        console.log(error);
    }
})


router.post("/view/add_sales", auth, async (req, res) => {
    try {
        const { invoice, date, warehouse_name, product_name, stock, quantity, note, room, primary_code, secondary_code, prod_code, level, isle, pallet, batch_code, SCRN,expiry_date } = req.body
      

        if(typeof product_name == "string"){
            var product_name_array = [req.body.product_name]
            var stock_array = [req.body.stock]
            var quantity_array = [req.body.carton]
            var primary_code_array = [req.body.primary_code]
            var secondary_code_array = [req.body.secondary_code]
            var prod_code_array = [req.body.prod_code]
            var level_array = [req.body.level]
            var unit_array = [req.body.primary_unit]
            var secondaryUnit_array = [req.body.secondary_unit]
            var batchcode_array = [req.body.batch_code]
            var expiry_date_array = [req.body.expiry_date]
            var max_per_unit_array = [req.body.max_per_unit]
            var production_date_array = [req.body.production_date]
            var requested_qty_array = [req.body.requested_qty]
            var delivery_date_array = [req.body.delivery_date]
            var delivery_code_array = [req.body.delivery_code]
            var prod_cat_array = [req.body.prod_cat]
            var quantity_notconverted_array = [req.body.quantity]
            var RoomAssigned_array = [req.body.RoomAssigned]
            var prod_invoice_array = [req.body.prod_invoice]
            var actual_qty_array = [req.body.actual_qty]
            var actual_uom_array = [req.body.actual_uom]
            var id_transact_array = [req.body.id_transact]
            
        }else{
            var product_name_array = [...req.body.product_name]
            var stock_array = [...req.body.stock]
            var quantity_array = [...req.body.carton]
            var primary_code_array = [...req.body.primary_code]
            var secondary_code_array = [...req.body.secondary_code]
            var prod_code_array = [...req.body.prod_code]
            var level_array = [...req.body.level]
            var unit_array = [...req.body.primary_unit]
            var secondaryUnit_array = [...req.body.secondary_unit]
            var batchcode_array = [...req.body.batch_code]
            var expiry_date_array = [...req.body.expiry_date]
            var max_per_unit_array = [...req.body.max_per_unit]
            var production_date_array = [...req.body.production_date]
            var requested_qty_array = [...req.body.requested_qty]
            var delivery_date_array = [...req.body.delivery_date]
            var delivery_code_array = [...req.body.delivery_code]
            var prod_cat_array = [...req.body.prod_cat]
            var quantity_notconverted_array = [...req.body.quantity]
            var RoomAssigned_array = [...req.body.RoomAssigned]
            var prod_invoice_array = [...req.body.prod_invoice]
            var actual_qty_array = [...req.body.actual_qty]
            var actual_uom_array = [...req.body.actual_uom]
            var id_transact_array = [...req.body.id_transact]

        } 
        
        const newproduct = product_name_array.map((value)=>{
            
            return  value  = {
                        product_name : value,
                    }   
            })
                    
        stock_array.forEach((value,i) => {
            newproduct[i].stock = Math.abs(value)
        });

        actual_qty_array.forEach((value, i) => {
            newproduct[i].actual_qty = Math.abs(value)
        })
        actual_uom_array.forEach((value, i) => {
            newproduct[i].actual_uom = value
        })

        id_transact_array.forEach((value, i) => {
            newproduct[i].id_transaction_from = value
        })

        quantity_array.forEach((value,i) => {
            newproduct[i].quantity = value
        });
        
        
        primary_code_array.forEach((value,i) => {
            newproduct[i].primary_code = value
        });
        
        
        secondary_code_array.forEach((value,i) => {
            newproduct[i].secondary_code = value
        });
        
        prod_code_array.forEach((value,i) => {
            newproduct[i].product_code = value
        });


        level_array.forEach((value, i) => {
            RoomAssigned_array.forEach((valueRoom, a) => {

                if(valueRoom == "Receiving Area" && i == a){

                    var resultValueFloorLevel = value.slice(3);
                    newproduct[i].storage = value[0]
                    newproduct[i].rack = value[1]
                    newproduct[i].bay = 0
                    newproduct[i].bin = 0
                    newproduct[i].type = "Floor"
                    newproduct[i].floorlevel = resultValueFloorLevel
                }else if(valueRoom == "Shelves" && i == a){
                    var resultValueFloorLevel = value.slice(3);
                    newproduct[i].storage = value[0]
                    newproduct[i].rack = value[1]
                    newproduct[i].bay = 0
                    newproduct[i].bin = 0
                    newproduct[i].type = "Floor"
                    newproduct[i].floorlevel = value[5]
                }else if(i == a){
                    var valData;
                    if(value[4] == "L"){
                        valData = "Level";
                    }else if(value[4] == "F"){
                        valData = "Floor";
                    }

                    // console.log(valueRoom + " <> " + i + " <> " + a + " <> " + value)
                    newproduct[i].storage = value[0]
                    newproduct[i].rack = value[1]
                    newproduct[i].bay = value[2]
                    newproduct[i].bin = value[3]
                    newproduct[i].type = valData
                    newproduct[i].floorlevel = value[5]
                }
    
            })
        })

        unit_array.forEach((value,i) => {
            newproduct[i].unit = value
        });

        secondaryUnit_array.forEach((value,i) => {
            newproduct[i].secondary_unit = value
        });

        batchcode_array.forEach((value,i) => {
            newproduct[i].batch_code = value
        });

        expiry_date_array.forEach((value, i) => {
            newproduct[i].expiry_date = value
        })


        max_per_unit_array.forEach((value, i) => {
            newproduct[i].maxperunit = value
        })

        production_date_array.forEach((value, i) => {
            newproduct[i].production_date = value
        })


        requested_qty_array.forEach((value, i) => {
            newproduct[i].requested_qty = value
        })

        delivery_date_array.forEach((value, i) => {
            newproduct[i].delivery_date = value
        })

        delivery_code_array.forEach((value, i) => {
            newproduct[i].delivery_code = value
        })


        prod_cat_array.forEach((value, i) =>{
            newproduct[i].prod_cat = value
        })

        quantity_notconverted_array.forEach((value, i) =>{
            newproduct[i].quantity_notConverted = value
        })

        RoomAssigned_array.forEach((value, i) =>{
            newproduct[i].room_name = value
        })

        prod_invoice_array.forEach((value, i) =>{
            newproduct[i].invoice = value
        })




        var error = 0
        newproduct.forEach(data => {
            
            if (data.stock < data.quantity_notConverted || data.quantity_notConverted == 0 ) {
                console.log("foreach newproduct", data);
                error++
            }
        })
        // if (error != 0) {
            
        //     req.flash("errors", `Must not be greater than stock Qty`)
        //     return res.redirect("back")
        // }


        const Newnewproduct = newproduct.filter(obj => obj.quantity !== "0" && obj.quantity !== "");


        const data = new sales({ invoice, customer: req.body.customer, date, warehouse_name, sale_product:Newnewproduct, note, room, primary_code, secondary_code, prod_code, SCRN })


        const purchases_data = await data.save()

        // -------- c_payment ------- //

        // const c_payment = new c_payment_data({invoice : invoice, customer : req.body.customer , reason : "Sale"})

        // await c_payment.save()

        // -------- c_payment end ------- //



        

        req.flash("success", "Sales Add successfully")
        res.redirect("/all_sales/preview/"+purchases_data._id)
    } catch (error) {
        console.log(error);
    }
})


//View Only for Pre finalize
router.get("/preview/:id", auth , async (req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user

        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        const _id = req.params.id

        const user_id = await sales.findById(_id);
       
         const stock_data = await warehouse.aggregate([
            {
                $match: { 
                    "name": user_id.warehouse_name,
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
                    expiry_date : { $first: "$product_details.expiry_date" },
                    production_date: { $first: "$product_details.production_date" },
                    invoice: { $first: "$product_details.invoice" }
                }
            },
        ])

        


        const customer_data = await customer.find({})
        // console.log("customer_data", customer_data);
        // const warehouse_data = await warehouse.find({status : 'Enabled'})
        let warehouse_data
        if(role_data.role == "staff"){
            const staff_data = await staff.findOne({ email: role_data.email })
            // warehouse_data = await warehouse.find({status : 'Enabled', name: staff_data.warehouse });
            warehouse_data = await warehouse.aggregate([
                {
                    $match: { 
                        "status" : 'Enabled', 
                        "name": staff_data.warehouse 
                    }
                },
                {
                    $group: {
                        _id: "$name",
                        name: { $first: "$name"}
                    }
                },
            ])
        }else{
            warehouse_data = await warehouse.aggregate([
                {
                    $match: { 
                        "status" : 'Enabled'
                    }
                },
                {
                    $group: {
                        _id: "$name",
                        name: { $first: "$name"}
                    }
                },
            ])
        }

        const product_data = await product.find({})

        const suppliers_data = await suppliers.find({});
      

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

        res.render("edit_sales_view", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            customer: customer_data,
            warehouse: warehouse_data,
            // product: stock_data,
            product: stock_data,
            user: user_id,
            master_shop : master,
            unit: product_data,
            language : lan_data,
            suppliers: suppliers_data,
            
            
        })
    } catch (error) {
        console.log(error);
    }
})


router.post("/preview/:id", auth , async (req, res) => {
    try {
        const _id = req.params.id

        
        const { invoice, warehouse_name, room } = req.body

        const new_sales = await sales.findOne({ invoice: invoice });

        const promises = new_sales.sale_product.map( async (product_details) => {
            var warehouse_data = await warehouse.findOne({ name: warehouse_name, room: product_details.room_name, warehouse_category: "Raw Materials"  });

            const match_data = warehouse_data.product_details.map((data) => {

                


                if (data.product_name == product_details.product_name &&
                    data.floorlevel == product_details.floorlevel && 
                    data.type == product_details.type && 
                    data.bin == product_details.bin && 
                    data.bay == product_details.bay &&
                    data.rack == product_details.rack && 
                    data.storage == product_details.storage && 
                    data.expiry_date == product_details.expiry_date && 
                    data.batch_code == product_details.batch_code &&
                    // data.invoice == product_details.invoice &&
                    data._id == product_details.id_transaction_from
                    ) {
                        data.product_stock =  Math.max(0,Math.abs(data.product_stock) - Math.abs(product_details.quantity))             
                }
            });
            return warehouse_data;
        })


        Promise.all(promises)
                .then(async (updatedWarehouseDataArray) => {
                    // Now you have the updated warehouse data for each product in updatedWarehouseDataArray.
                    // You should save each warehouse_data separately in this block.
                    try {
                        
                        for (const warehouseData of updatedWarehouseDataArray) {
                            await warehouseData.save();
                        }
                        
                        new_sales.finalize = "True";
                        const sales_data = await new_sales.save()


                        const master = await master_shop.find()
                        const email_data = await email_settings.findOne()
                        const supervisor_data = await supervisor_settings.find();


                        var product_list = new_sales.sale_product

                        var arrayItems = "";
                        var n;

                        for (n in product_list) {
                            arrayItems +=  '<tr>'+
                                                '<td style="border: 1px solid black;">' + product_list[n].product_name + '</td>' +
                                                '<td style="border: 1px solid black;">' + product_list[n].product_code + '</td>' +  
                                                '<td style="border: 1px solid black;">' + product_list[n].quantity + '</td>' +
                                                '<td style="border: 1px solid black;">' + product_list[n].unit + '</td>' +
                                                '<td style="border: 1px solid black;">' + product_list[n].secondary_unit + '</td>' +
                                                '<td style="border: 1px solid black;">' + new_sales.warehouse_name + '</td>' +
                                                '<td style="border: 1px solid black;">' + product_list[n].room_name + '</td>' +
                                                '<td style="border: 1px solid black;">' + product_list[n].storage+product_list[n].rack+product_list[n].bay+product_list[n].bin+product_list[n].type[0]+product_list[n].floorlevel+ '</td>' 
                                            '</tr>'
                        }


                        let mailTransporter = nodemailer.createTransport({
                            host: email_data.host,
                            port: Number(email_data.port),
                            secure: false,
                            auth: {
                                user: email_data.email,
                                pass: email_data.password
                            }
                        });


                        let mailDetails = {
                            from: email_data.email,
                            to: supervisor_data[0].RMSEmail,
                            subject:'Sales Mail',
                            attachments: [{
                                filename: 'Logo.png',
                                path: __dirname + '/../public' +'/upload/'+master[0].image,
                                cid: 'logo'
                           }],
                            html:'<!DOCTYPE html>'+
                                '<html><head><title></title>'+
                                '</head><body>'+
                                    '<div>'+
                                        '<div style="display: flex; align-items: center; justify-content: center;">'+
                                            '<div>'+
                                                '<img src="cid:logo" class="rounded" width="66.5px" height="66.5px"></img>'+
                                            '</div>'+
                                        
                                            '<div>'+
                                                '<h2> '+ master[0].site_title +' </h2>'+
                                            '</div>'+
                                        '</div>'+
                                        '<hr class="my-3">'+
                                        '<div>'+
                                            '<h5 style="text-align: left;">'+
                                                ' Order Number : '+ new_sales.invoice +' '+
                                                '<span style="float: right;">'+
                                                    ' Order Date : '+ new_sales.date +' '+
                                                '</span>'+
                                                
                                            '</h5>'+
                                        '</div>'+
                                        '<table style="width: 100% !important;">'+
                                            '<thead style="width: 100% !important;">'+
                                                '<tr>'+
                                                    '<th style="border: 1px solid black;"> Product Name </th>'+
                                                    '<th style="border: 1px solid black;"> Product Code </th>'+
                                                    '<th style="border: 1px solid black;"> Product Quantity </th>'+
                                                    '<th style="border: 1px solid black;"> Unit </th>'+
                                                    '<th style="border: 1px solid black;"> Secondary Unit </th>'+
                                                    '<th style="border: 1px solid black;"> Warehouse</th>'+
                                                    '<th style="border: 1px solid black;"> Room</th>'+
                                                    '<th style="border: 1px solid black;"> Location </th>'+
                                                '</tr>'+
                                            '</thead>'+
                                            '<tbody style="text-align: center;">'+
                                                ' '+ arrayItems +' '+
                                            '</tbody>'+
                                        '</table>'+
                                    
                                        '<div>'+
                                            '<strong> Regards </strong>'+
                                            '<h5>'+ master[0].site_title +'</h5>'+
                                        '</div>'+
                                    '</div>'+
                                '</body></html>'
                        };


                        mailTransporter.sendMail(mailDetails, function(err, data) {
                            if(err) {
                                console.log(err);
                                console.log('Error Occurs');
                            } else {
                                console.log('Email sent successfully');
                            }
                        });
                            
                       
                        req.flash("success", `Sales Update successfully`)
                        res.redirect("/all_sales/preview/"+_id)
                    } catch (error) {
                        console.error(error);
                        res.status(500).json({ error: 'An error occurred while saving data.' });
                    }
                })
                .catch((error) => {
                    // Handle any errors that might have occurred during the process.
                    console.error(error);
                    res.status(500).json({ error: 'An error occurred.' });
                });
        
     

    } catch (error) {
        console.log(error);
    }
})

router.get("/view/:id", auth , async (req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user

        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        // console.log("master" , master);

        const _id = req.params.id

        const user_id = await sales.findById(_id);
        
        // console.log("user_id", user_id);
         var rooms = ["Ambient","Enclosed"]
         const stock_data = await warehouse.aggregate([
            {
                $match: { 
                    "name": user_id.warehouse_name,
                    "warehouse_category": "Raw Materials"
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

        


        const customer_data = await customer.find({})
        // console.log("customer_data", customer_data);
        // const warehouse_data = await warehouse.find({status : 'Enabled'})
        let warehouse_data
        if(role_data.role == "staff"){
            const staff_data = await staff.findOne({ email: role_data.email })
            // warehouse_data = await warehouse.find({status : 'Enabled', name: staff_data.warehouse });
            warehouse_data = await warehouse.aggregate([
                {
                    $match: { 
                        "status" : 'Enabled', 
                        "name": staff_data.warehouse,
                        "warehouse_category": "Raw Materials" 
                    }
                },
                {
                    $group: {
                        _id: "$name",
                        name: { $first: "$name"}
                    }
                },
            ])
        }else{
            warehouse_data = await warehouse.aggregate([
                {
                    $match: { 
                        "status" : 'Enabled',
                        "warehouse_category": "Raw Materials"
                    }
                },
                {
                    $group: {
                        _id: "$name",
                        name: { $first: "$name"}
                    }
                },
            ])
        }

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

        res.render("edit_sales", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            customer: customer_data,
            warehouse: warehouse_data,
            product: stock_data,
            user: user_id,
            master_shop : master,
            unit: product_data,
            language : lan_data,
            
        })
    } catch (error) {
        console.log(error);
    }
})

router.post("/view/:id", auth , async (req, res) => {
    try {
        const _id = req.params.id

        const old_sales = await sales.findOne({ _id: req.params.id })

        const old_warehouse_data = await warehouse.findOne({ name: old_sales.warehouse_name, room: req.body.room });
        

        const { invoice, date, warehouse_name, product_name, stock, quantity, note, room, customer, SCRN } = req.body
      

        if(typeof product_name == "string"){
            var product_name_array = [req.body.product_name]
            var stock_array = [req.body.stock]
            var quantity_array = [req.body.carton]
            var primary_code_array = [req.body.primary_code]
            var secondary_code_array = [req.body.secondary_code]
            var prod_code_array = [req.body.prod_code]
            var level_array = [req.body.level]
            var unit_array = [req.body.primary_unit]
            var secondaryUnit_array = [req.body.secondary_unit]
            var batchcode_array = [req.body.batch_code]
            var expiry_date_array = [req.body.expiry_date]
            var max_per_unit_array = [req.body.max_per_unit]
            var production_date_array = [req.body.production_date]
            var requested_qty_array = [req.body.requested_qty]
            var delivery_date_array = [req.body.delivery_date]
            var delivery_code_array = [req.body.delivery_code]
            var prod_cat_array = [req.body.prod_cat]
            var quantity_notconverted_array = [req.body.quantity]
            var RoomAssigned_array = [req.body.RoomAssigned]
            
        }else{
            var product_name_array = [...req.body.product_name]
            var stock_array = [...req.body.stock]
            var quantity_array = [...req.body.carton]
            var primary_code_array = [...req.body.primary_code]
            var secondary_code_array = [...req.body.secondary_code]
            var prod_code_array = [...req.body.prod_code]
            var level_array = [...req.body.level]
            var unit_array = [...req.body.primary_unit]
            var secondaryUnit_array = [...req.body.secondary_unit]
            var batchcode_array = [...req.body.batch_code]
            var expiry_date_array = [...req.body.expiry_date]
            var max_per_unit_array = [...req.body.max_per_unit]
            var production_date_array = [...req.body.production_date]
            var requested_qty_array = [...req.body.requested_qty]
            var delivery_date_array = [...req.body.delivery_date]
            var delivery_code_array = [...req.body.delivery_code]
            var prod_cat_array = [...req.body.prod_cat]
            var quantity_notconverted_array = [...req.body.quantity]
            var RoomAssigned_array = [...req.body.RoomAssigned]

        } 
        
        const newproduct = product_name_array.map((value)=>{
            
            return  value  = {
                        product_name : value,
                    }   
            })
                    
        stock_array.forEach((value,i) => {
            newproduct[i].stock = Math.abs(value)
        });

        quantity_array.forEach((value,i) => {
            newproduct[i].quantity = value
        });
        
        
        primary_code_array.forEach((value,i) => {
            newproduct[i].primary_code = value
        });
        
        
        secondary_code_array.forEach((value,i) => {
            newproduct[i].secondary_code = value
        });
        
        prod_code_array.forEach((value,i) => {
            newproduct[i].product_code = value
        });


        level_array.forEach((value, i) => {
            RoomAssigned_array.forEach((valueRoom, a) => {

                if(valueRoom == "Receiving Area" && i == a){

                    var resultValueFloorLevel = value.slice(3);
                    newproduct[i].storage = value[0]
                    newproduct[i].rack = value[1]
                    newproduct[i].bay = 0
                    newproduct[i].bin = 0
                    newproduct[i].type = "Floor"
                    newproduct[i].floorlevel = resultValueFloorLevel
                }else if(valueRoom == "Shelves" && i == a){
                    var resultValueFloorLevel = value.slice(3);
                    newproduct[i].storage = value[0]
                    newproduct[i].rack = value[1]
                    newproduct[i].bay = 0
                    newproduct[i].bin = 0
                    newproduct[i].type = "Floor"
                    newproduct[i].floorlevel = value[5]
                }else if(i == a){
                    var valData;
                    if(value[4] == "L"){
                        valData = "Level";
                    }else if(value[4] == "F"){
                        valData = "Floor";
                    }

                    // console.log(valueRoom + " <> " + i + " <> " + a + " <> " + value)
                    newproduct[i].storage = value[0]
                    newproduct[i].rack = value[1]
                    newproduct[i].bay = value[2]
                    newproduct[i].bin = value[3]
                    newproduct[i].type = valData
                    newproduct[i].floorlevel = value[5]
                }
    
            })
        })

        unit_array.forEach((value,i) => {
            newproduct[i].unit = value
        });

        secondaryUnit_array.forEach((value,i) => {
            newproduct[i].secondary_unit = value
        });

        batchcode_array.forEach((value,i) => {
            newproduct[i].batch_code = value
        });

        expiry_date_array.forEach((value, i) => {
            newproduct[i].expiry_date = value
        })


        max_per_unit_array.forEach((value, i) => {
            newproduct[i].maxperunit = value
        })

        production_date_array.forEach((value, i) => {
            newproduct[i].production_date = value
        })


        requested_qty_array.forEach((value, i) => {
            newproduct[i].requested_qty = Math.abs(value)
        })

        delivery_date_array.forEach((value, i) => {
            newproduct[i].delivery_date = value
        })

        delivery_code_array.forEach((value, i) => {
            newproduct[i].delivery_code = value
        })


        prod_cat_array.forEach((value, i) =>{
            newproduct[i].prod_cat = value
        })

        quantity_notconverted_array.forEach((value, i) =>{
            newproduct[i].quantity_notConverted = value
        })

        RoomAssigned_array.forEach((value, i) =>{
            newproduct[i].room_name = value
        })

        var error = 0
        newproduct.forEach(data => {
            console.log("foreach newproduct", data);
            if (parseInt(data.stock) < parseInt(data.quantity) || parseInt(data.quantity) == 0 ) {
                
                error++
            }
        })
        if (error != 0) {
            
            req.flash("errors", `Must not be greater than stock Qty`)
            return res.redirect("back")
        }

        
        


        const Newnewproduct = newproduct.filter(obj => obj.quantity !== "0" && obj.quantity !== "");

        old_sales.invoice = invoice
        old_sales.customer = customer
        old_sales.date = date
        old_sales.warehouse_name = warehouse_name
        old_sales.sale_product = Newnewproduct
        old_sales.note = note
        old_sales.SCRN = SCRN
        old_sales.finalize = "False"
        old_sales.isAllowEdit = "False"

        const new_data = await old_sales.save()

        req.flash("success", `Sales Update successfully`)
        res.redirect("/all_sales/view")

    } catch (error) {
        console.log(error);
    }
})

// ========= Give Payment ============= //

router.post("/give_payment/:id", auth , async (req, res) => {
    try {
        const _id = req.params.id;
        const { invoice, customer, receivable_amount, received_amount } = req.body

        const data = await sales.findById(_id)
        console.log(data);

        var subtract = receivable_amount - received_amount
        console.log(received_amount);

        data.received_amount = parseFloat(received_amount) + parseFloat(data.received_amount)
        data.due_amount = subtract

        console.log(data);
        const new_data = await data.save();


        // -------- c_payment ------- //

        const c_payment = await c_payment_data.findOne({invoice : invoice})
        c_payment.amount = subtract

        await c_payment.save()

        // -------- c_payment end ------- //


        // -------- supplier payment ------- //

        let date_ob = new Date();
        let newdate = ("0" + date_ob.getDate()).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        let final_date = year + "-" + month + "-" + newdate
       
        const customer_payment_data = new customer_payment({invoice, date : year + "-" + month + "-" + newdate, customer, reason : "Received Payment For Sale", amount : received_amount})

        const new_customer_payment = await customer_payment_data.save()

        // -------- supplier payment end ------- //

        req.flash('success', `payment successfull`)
        res.redirect("/all_sales/view")
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

        const user_id = await sales.findById(_id);
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
        
        res.render("sales_invoice", {
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

// ============ return sales ============= //

router.get("/view/return_sales/:id", auth , async (req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user

        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        console.log("master" , master);

        const _id = req.params.id
        console.log(_id);

        const user_id = await sales.findById(_id);
        console.log("user_id" , user_id);
        // res.status(200).json({ message: user_id })
        const stock_data = await warehouse.aggregate([
            {
                $match: { 
                    "name": "Return Goods",
                    "room": "Return Rooms" 
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
                    level: { $first: "$product_details.level" },
                    isle: { $first: "$product_details.isle" },
                    pallet: { $first: "$product_details.pallet" },
                    primary_code: { $first: "$product_details.primary_code" },
                    secondary_code: { $first: "$product_details.secondary_code" },
                    product_code: { $first: "$product_details.product_code" },
                }
            },
        ])
        // res.status(200).json({ message: stock_data })
        console.log("stock_data", stock_data);

        const product_data = await product.find({})


        // const warehouse_data = await warehouse.findOne({ name: "Return Goods"  })
        warehouse_data = await warehouse.aggregate([
            {
                $match: { 
                    "status": 'Enabled',
                    "name": "Return Goods",
                    "warehouse_category" : "Raw Materials"
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
        var rooms = ["Return Rooms"]

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
        
        res.render("return_sale", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            user: user_id,
            stock: stock_data,
            master_shop : master,
            unit: product_data,
            language : lan_data,
            warehouses: warehouse_data,
            rooms: rooms
        })
    } catch (error) {
        console.log(error);
        res.status(200).json({ message: error.message })
    }
})

router.post("/view/return_sales/:id", auth , async (req, res) => {
    try {
        const { invoice, date, warehouse_name, product_name, primary_code, secondary_code, product_code, sales_quantity, stocks, return_qty, Room_name, to_warehouse_name, to_Roomname, to_Room_name , note, level, isle, pallet } = req.body
        // console.log(req.body);
        // res.json(req.body)

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
                // res.status(200).json({ saleqty: data.sale_qty, returnQTY: data.return_qty, stocks: data.stock })
                error++
            }
        })
        if (error != 0) {
            
            req.flash("errors", `Must not be greater than sale Qty`)
            return res.redirect("back")
        }


        const old_data = await sales.findOne({ invoice: invoice });
        console.log(old_data);

        old_data.return_data = "True"
        
        const sales_data = await old_data.save()
        
        const data = new sales_return({ invoice, customer: req.body.customer, date, warehouse_name, room: Room_name, ToWarehouse: to_warehouse_name, ToRoom: to_Room_name, return_sale:newproduct, note })
        const sale_return_data = await data.save()
        console.log(data);


        const new_sales_return = await sales_return.findOne({ invoice: invoice });

        

        const warehouse_data = await warehouse.findOne({ name: to_warehouse_name, room: to_Room_name });
        // res.status(200).json({ message: req.body, warehouseresult: warehouse_data })

        new_sales_return.return_sale.forEach(product_details1 => {
            var x = 0
            const match_data = warehouse_data.product_details.map((data) => {

                // if (data.product_name == product_details1.product_name ) {
                    if (data.product_name == product_details1.product_name && data.floorlevel == product_details1.floorlevel && data.type == product_details1.type && data.bin == product_details1.bin && data.bay == product_details1.bay) {
                    data.product_stock = parseInt(data.product_stock) + parseInt(product_details1.return_qty)
                    x++
                }

            })

            if (x == "0") {
                warehouse_data.product_details = warehouse_data.product_details.concat({ product_name: product_details1.product_name, product_stock: product_details1.return_qty, primary_code: product_details1.primary_code, secondary_code: product_details1.secondary_code, product_code: product_details1.product_code, bay: product_details1.bay, bin: product_details1.bin, type: product_details1.type, floorlevel: product_details1.floorlevel })
            }
            console.log("final", warehouse_data);
        })

        await warehouse_data.save()


        // -------- supplier payment ------- //
        console.log(req.body);
        const c_payment = new c_payment_data({invoice : invoice, customer : req.body.customer , reason : "Sale Return" })

        await c_payment.save()

        // -------- supplier payment end ------- //


        // ------------- email ------------- //
        
        const master = await master_shop.find()
        console.log("add post", master[0].image);

        const email_data = await email_settings.findOne()
      
        // res.status(200).json({email_data})
        const customer_data = await customer.findOne({name : req.body.customer})
        console.log("customer_data", customer_data);
        // res.status(200).json({ message: email_data, cutomer: customer_data, customerdata: req.body.customer })
        if (master[0].currency_placement == 1) {
            right_currency = master[0].currency
            left_currency = ""
        } else {
            right_currency = ""
            left_currency = master[0].currency
        }

        var product_list = product_name_array
        var return_qty_list = return_qty_array

        var arrayItems = "";
        var n;

        for (n in product_list) {
            arrayItems +=   '<tr>'+
                                '<td style="border: 1px solid black;">' + product_list[n] + '</td>' +
                                '<td style="border: 1px solid black;">' + return_qty_list[n] + '</td>' +
                            '</tr>'
        }
        
        console.log("product_list", arrayItems);
        

        let mailTransporter = nodemailer.createTransport({
            // host: email_data.host,
            // port: Number(email_data.port),
            // secure: false,
            service: 'gmail',
            auth: {
                user: email_data.email,
                pass: email_data.password
            }
        });

        let mailDetails = {
            from: email_data.email,
            to: customer_data.email,
            subject:'Sale Return Mail',
            attachments: [{
                filename: 'Logo.png',
                path: __dirname + '/../public' +'/upload/'+master[0].image,
                cid: 'logo'
           }],
            html:'<!DOCTYPE html>'+
                '<html><head><title></title>'+
                '</head><body>'+
                    '<div>'+
                        '<div style="display: flex; align-items: center; justify-content: center;">'+
                            '<div>'+
                                '<img src="cid:logo" class="rounded" width="66.5px" height="66.5px"></img>'+
                            '</div>'+
                        
                            '<div>'+
                                '<h2> '+ master[0].site_title +' </h2>'+
                            '</div>'+
                        '</div>'+
                        '<hr class="my-3">'+
                        '<div>'+
                            '<h5 style="text-align: left;">'+
                                ' Order Number : '+ invoice +' '+
                                '<span style="float: right;">'+
                                    ' Order Date : '+ date +' '+
                                '</span>'+
                                
                            '</h5>'+
                        '</div>'+
                        '<table style="width: 100% !important;">'+
                            '<thead style="width: 100% !important;">'+
                                '<tr>'+
                                    '<th style="border: 1px solid black;"> Product Name </th>'+
                                    '<th style="border: 1px solid black;"> Return Quantity </th>'+
                                    '<th style="border: 1px solid black;"> Price </th>'+
                                    '<th style="border: 1px solid black;"> Total </th>'+
                                '</tr>'+
                            '</thead>'+
                            '<tbody style="text-align: center;">'+
                                ' '+ arrayItems +' '+
                            '</tbody>'+
                        '</table>'+
                        '<div>'+
                            '<strong> Regards </strong>'+
                            '<h5>'+ master[0].site_title +'</h5>'+
                        '</div>'+
                    '</div>'+
                '</body></html>'
        };
        
        mailTransporter.sendMail(mailDetails, function(err, data) {
            if(err) {
                console.log(err);
                console.log('Error Occurs');
            } else {
                console.log('Email sent successfully');
            }
        });

        // ------------- email end ------------- //

        req.flash('success', `sales item return successfull`)
        res.redirect("/all_sales/view")
    } catch (error) {
        console.log(error);
        res.status(200).json({ message1: error.message })
    }
})

// =============== Barcode ================//

router.get("/barcode/:id", auth, async (req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user
        
        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        console.log("barcode Product master" , master);
        
        const _id = req.params.id
        
        const user_id = await sales.findById(_id)
        
        console.log("barcode user_id", user_id);

        if (master[0].language == "English (US)") {
            var lan_data = users.English
            
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
        
        res.render("all_sales_barcode", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            alldata: user_id,
            master_shop : master,
            language : lan_data
        })

    } catch (error) {
        console.log(error);
    }
})


// router.post("/barcode_scanner",  async (req, res) => {
//     const { product_code, warehouse_name, rooms_data } = req.body
//     //checking products if exist
//     const product_data = await product.find({ product_code: product_code });
    
//     const stock_data = await warehouse.aggregate([
//             {
//                 $match: { "name": warehouse_name, "room" : rooms_data }
//             },
//             {
//                 $unwind: "$product_details"
//             },
//             {
//                 $match: { "product_details.primary_code": product_code }
//             },
//             {
//                 $group: {
//                     _id: "$product_details._id",
//                     name: { $first: "$product_details.product_name" },
//                     product_stock: { $first: "$product_details.product_stock" },
//                     primary_code: { $first: "$product_details.primary_code" },
//                     secondary_code: {$first: "$product_details.secondary_code" },
//                     product_code: { $first: "$product_details.product_code" },
//                     level: { $first: "$product_details.bay" },
//                     isle: { $first: "$product_details.bin" },
//                     type: { $first: "$product_details.type" },
//                     pallet: { $first: "$product_details.floorlevel" },
//                     unit: { $first: "$product_details.unit" },
//                     secondary_unit: { $first: "$product_details.secondary_unit" },
//                     storage: { $first: "$product_details.storage" },
//                     rack: { $first: "$product_details.rack" },
//                     expiry_date: { $first: "$product_details.expiry_date" },
//                     maxPerUnit: { $first: "$product_details.maxPerUnit"},
//                     batch_code: { $first: "$product_details.batch_code" },
//                     production_date: { $first: "$product_details.production_date" },
//                 }
//             },
//         ])
//     res.json( stock_data )
    
// })



// router.post("/barcode_scanner",  async (req, res) => {
//     const { product_code, warehouse_name, rooms_data, Roomslist } = req.body
//     var RoomAll = Roomslist.split(",")

//     var checkData;
//     const results = [];
//     RoomAll.forEach( async (value) => {
//         const stock_data = await warehouse.aggregate([
//             {
//                 $match: { "name": warehouse_name, "room" : value }
//             },
//             {
//                 $unwind: "$product_details"
//             },
//             {
//                 $match: { "product_details.primary_code": product_code }
//             },
//             {
//                 $group: {
//                     _id: "$product_details._id",
//                     name: { $first: "$product_details.product_name" },
//                     product_stock: { $first: "$product_details.product_stock" },
//                     primary_code: { $first: "$product_details.primary_code" },
//                     secondary_code: {$first: "$product_details.secondary_code" },
//                     product_code: { $first: "$product_details.product_code" },
//                     level: { $first: "$product_details.bay" },
//                     isle: { $first: "$product_details.bin" },
//                     type: { $first: "$product_details.type" },
//                     pallet: { $first: "$product_details.floorlevel" },
//                     unit: { $first: "$product_details.unit" },
//                     secondary_unit: { $first: "$product_details.secondary_unit" },
//                     storage: { $first: "$product_details.storage" },
//                     rack: { $first: "$product_details.rack" },
//                     expiry_date: { $first: "$product_details.expiry_date" },
//                     production_date: { $first: "$product_details.production_date" },
//                     maxPerUnit: { $first: "$product_details.maxPerUnit" },
//                     batch_code: { $first: "$product_details.batch_code" },
//                     product_cat:{ $first: "$product_details.product_cat" },
//                     computeUsed : { $first: "P" }
//                 }
//             },
//         ])


//         const stock_data2 = await warehouse.aggregate([
//             {
//                 $match: { "name": warehouse_name, "room" : value }
//             },
//             {
//                 $unwind: "$product_details"
//             },
//             {
//                 $match: { "product_details.secondary_code": product_code }
//             },
//             {
//                 $group: {
//                     _id: "$product_details._id",
//                     name: { $first: "$product_details.product_name" },
//                     product_stock: { $first: "$product_details.product_stock" },
//                     primary_code: { $first: "$product_details.primary_code" },
//                     secondary_code: {$first: "$product_details.secondary_code" },
//                     product_code: { $first: "$product_details.product_code" },
//                     level: { $first: "$product_details.bay" },
//                     isle: { $first: "$product_details.bin" },
//                     type: { $first: "$product_details.type" },
//                     pallet: { $first: "$product_details.floorlevel" },
//                     unit: { $first: "$product_details.unit" },
//                     secondary_unit: { $first: "$product_details.secondary_unit" },
//                     storage: { $first: "$product_details.storage" },
//                     rack: { $first: "$product_details.rack" },
//                     expiry_date: { $first: "$product_details.expiry_date" },
//                     production_date: { $first: "$product_details.production_date" },
//                     maxPerUnit: { $first: "$product_details.maxPerUnit" },
//                     batch_code: { $first: "$product_details.batch_code" },
//                     product_cat:{ $first: "$product_details.product_cat" },
//                     computeUsed : { $first: "S" }
//                 }
//             },
//         ])


//         if (stock_data.length > 0) {
//             results.push(stock_data);
//         } else if (stock_data2.length > 0) {
//             results.push(stock_data2);
//         }
//         // results.push(checkData)
//         // console.log(checkData)
      
//     })
    
    


        


        
//     res.json( results )
    
// })


router.post("/barcode_scanner", async (req, res) => {
    const { product_code, warehouse_name, rooms_data, Roomslist } = req.body;
    const RoomAll = Roomslist.split(",");
    const results = [];

    // Define a function to fetch stock data asynchronously
    async function fetchStockData(value) {
        const stock_data = await warehouse.aggregate([
            {
                $match: { "name": warehouse_name, "room" : value }
            },
            {
                $unwind: "$product_details"
            },
            {
                $match: { "product_details.primary_code": product_code }
            },
            {
                $group: {
                    _id: "$product_details._id",
                    name: { $first: "$product_details.product_name" },
                    product_stock: { $first: "$product_details.product_stock" },
                    primary_code: { $first: "$product_details.primary_code" },
                    secondary_code: {$first: "$product_details.secondary_code" },
                    product_code: { $first: "$product_details.product_code" },
                    level: { $first: "$product_details.bay" },
                    isle: { $first: "$product_details.bin" },
                    type: { $first: "$product_details.type" },
                    pallet: { $first: "$product_details.floorlevel" },
                    unit: { $first: "$product_details.unit" },
                    secondary_unit: { $first: "$product_details.secondary_unit" },
                    storage: { $first: "$product_details.storage" },
                    rack: { $first: "$product_details.rack" },
                    expiry_date: { $first: "$product_details.expiry_date" },
                    production_date: { $first: "$product_details.production_date" },
                    maxPerUnit: { $first: "$product_details.maxPerUnit" },
                    batch_code: { $first: "$product_details.batch_code" },
                    product_cat:{ $first: "$product_details.product_cat" },
                    computeUsed : { $first: "P" },
                    roomNamed : { $first: "$room" },
                    invoice : { $first: "$product_details.invoice" },
                    actual_qty : {$first : "$product_details.actual_qty"},
                    actual_uom : {$first : "$product_details.actual_uom"}
                }
            },
        ]);

        const stock_data2 = await warehouse.aggregate([
            
            {
                $match: { "name": warehouse_name, "room" : value }
            },
            {
                $unwind: "$product_details"
            },
            {
                $match: { "product_details.secondary_code": product_code }
            },
            {
                $group: {
                    _id: "$product_details._id",
                    name: { $first: "$product_details.product_name" },
                    product_stock: { $first: "$product_details.product_stock" },
                    primary_code: { $first: "$product_details.primary_code" },
                    secondary_code: {$first: "$product_details.secondary_code" },
                    product_code: { $first: "$product_details.product_code" },
                    level: { $first: "$product_details.bay" },
                    isle: { $first: "$product_details.bin" },
                    type: { $first: "$product_details.type" },
                    pallet: { $first: "$product_details.floorlevel" },
                    unit: { $first: "$product_details.unit" },
                    secondary_unit: { $first: "$product_details.secondary_unit" },
                    storage: { $first: "$product_details.storage" },
                    rack: { $first: "$product_details.rack" },
                    expiry_date: { $first: "$product_details.expiry_date" },
                    production_date: { $first: "$product_details.production_date" },
                    maxPerUnit: { $first: "$product_details.maxPerUnit" },
                    batch_code: { $first: "$product_details.batch_code" },
                    product_cat:{ $first: "$product_details.product_cat" },
                    computeUsed : { $first: "S" },
                    roomNamed : { $first: "$room" },
                    invoice : { $first: "$product_details.invoice" }
                }
            },
        ]);

        if (stock_data.length > 0) {
            results.push(stock_data);
        } else if (stock_data2.length > 0) {
            results.push(stock_data2);
        }
    }

    // Create an array of promises for each value
    const promises = RoomAll.map((value) => fetchStockData(value));

    // Wait for all promises to resolve before sending the response
    await Promise.all(promises);

    res.json(results);
});


module.exports = router;