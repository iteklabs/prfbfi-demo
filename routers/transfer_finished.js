const express = require("express");
const app = express();
const router = express.Router();
const { profile, master_shop, categories, brands, units, product, warehouse, staff, customer, suppliers, purchases, purchases_return, sales, sales_return, suppliers_payment, customer_payment, transfers , transfers_finished, email_settings, supervisor_settings } = require("../models/all_models");
const auth = require("../middleware/auth");
const users = require("../public/language/languages.json");
const nodemailer = require('nodemailer');


router.get("/view", auth, async(req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user
        
        const profile_data = await profile.findOne({email : role_data.email})
        const master = await master_shop.find()

        let transfer_data
        if(role_data.role == "staff"){
            const staff_data = await staff.findOne({ email: role_data.email })
            transfer_data = await transfers_finished.find({ from_warehouse : staff_data.warehouse });
        }else{
            // transfer_data = await transfers_finished.find()
            transfer_data = await transfers_finished.aggregate([
              
        
                {
                  $unwind: "$product"
                },
                {
                  $group: {
                    _id: "$_id",
                    invoice: { $first: "$invoice" },
                    date: { $first: "$date" },
                    from_warehouse: { $first: "$from_warehouse" },
                    to_warehouse: { $first: "$to_warehouse" },
                    from_room_name: { $addToSet: "$product.from_room_name" },
                    to_room_name: { $addToSet: "$product.to_room_name" },
                    finalize: { $first: "$finalize" }
                  }
                  
                },
                {
                  $project: {
                    _id: 1,
                    invoice: 1,
                    date: 1,
                    from_warehouse:1,
                    to_warehouse: 1,
                    from_room_name: 1,
                    to_room_name: 1,
                    finalize: 1
                    
                  }
               }
          ]);
        }

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

        res.render("transfer_finished", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            master_shop : master,
            transfer: transfer_data,
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


    const new_purchase = await transfers_finished.findOne({ invoice: "TRFF-"+random });
    if (new_purchase && new_purchase.length > 0) {
        IDInvoice = "TRFF-"+random;
    }else{
        IDInvoice = "TRFF-"+random; 
    }
    return IDInvoice ;
}
router.get("/view/add_transfer", auth, async(req, res) => {
    try{
        const {username, email, role} = req.user
        const role_data = req.user
        
        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()

        let warehouse_data
        if(role_data.role == "staff"){
            const staff_data = await staff.findOne({ email: role_data.email })
            // warehouse_data = await warehouse.find({status : 'Enabled', name: staff_data.warehouse });
            warehouse_data = await warehouse.aggregate([
                {
                    $match: { 
                        "status" : 'Enabled', 
                        name: staff_data.warehouse,
                        "warehouse_category" : "Finished Goods",
                        "name": { $ne: "QA Warehouse" }
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
            // warehouse_data = await warehouse.find({status : 'Enabled'});
            warehouse_data = await warehouse.aggregate([
                {
                    $match: { 
                        "status" : 'Enabled',
                        "warehouse_category" : "Finished Goods",
                        "name": { $ne: "QA Warehouse" }
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


        const transfer_data = await transfers_finished.find({})
        const invoice_noint = transfer_data.length + 1
        const invoice_no = "TRFF-" + invoice_noint.toString().padStart(5, "0")


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


        const randominv = getRandom8DigitNumber();

        randominv.then(invoicedata => {

            res.render("add_transfer_finished", {
                success: req.flash('success'),
                errors: req.flash('errors'),
                role : role_data,
                profile : profile_data,
                master_shop : master,
                warehouse: warehouse_data,
                language : lan_data,
                invoice: invoicedata
            })
        }).catch(error => {
            req.flash('errors', `There's a error in this transaction`)
            res.redirect("/transfer/view");
        })
        
    }catch(error){
        console.log(error);
    }
})

router.post("/view/add_transfer", auth, async(req, res) => {
    try{
        // res.json(req.body);
        // return
        const {date, from_warehouse, FromRoom_name, to_warehouse, ToRoom_name, prod_name, from_prod_qty, from_prod_level, from_prod_isle, from_prod_pallet, to_prod_qty, to_prod_level, to_prod_isle, to_prod_pallet, primary_code, secondary_code, product_code3, note, MaxStocks_data2, invoice, expiry_date} = req.body
        
        if(typeof prod_name == "string"){
            var product_name_array = [req.body.prod_name]
            
            var from_qty_array = [req.body.from_prod_qty]
            var from_level_array = [req.body.from_prod_level]
        

            var to_qty_array = [req.body.New_Qty_Converted]
            var to_level_array = [req.body.to_prod_level]
            
            var primary_code_array = [req.body.primary_code]
            var secondary_code_array = [req.body.secondary_code]
            var product_code3_array = [req.body.product_code3]
            var MaxStocks_data2_array = [req.body.MaxStocks_data2]

            var unit_array = [req.body.primary_unit]
            var secondary_unit_array = [req.body.secondary_unit]
            var batch_code_array = [req.body.batch_code]
            var expiry_date_array = [req.body.expiry_date]
            var product_date_array = [req.body.product_date]
            var maxProducts_array = [req.body.MaxStocks_data]

            var maxPerUnit_array = [req.body.maxPerUnit]
            var prod_cat_array = [req.body.prod_cat]

            var RoomAssigned_array = [req.body.RoomAssigned]
            var ToRoomAssigned_array = [req.body.ToRoomAssigned]
            var from_invoice_array = [req.body.from_invoice]
            var to_invoice_array = [req.body.to_invoice]

            var id_transaction_array = [req.body.id_transaction]
            
            
        }else{
            var product_name_array = [...req.body.prod_name]
            

            var from_qty_array = [...req.body.from_prod_qty]
            var from_level_array = [...req.body.from_prod_level]
        
            
            var to_qty_array = [...req.body.New_Qty_Converted]
            var to_level_array = [...req.body.to_prod_level]
            
            var primary_code_array = [...req.body.primary_code]
            var secondary_code_array = [...req.body.secondary_code]
            var product_code3_array = [...req.body.product_code3]
            var MaxStocks_data2_array = [...req.body.MaxStocks_data2]

            var unit_array = [...req.body.primary_unit]
            var secondary_unit_array = [...req.body.secondary_unit]
            var batch_code_array = [...req.body.batch_code]
            var expiry_date_array = [...req.body.expiry_date]
            var product_date_array = [...req.body.product_date]
            var maxProducts_array = [...req.body.MaxStocks_data]
            var maxPerUnit_array = [...req.body.maxPerUnit]
            var prod_cat_array = [...req.body.prod_cat]

            var RoomAssigned_array = [...req.body.RoomAssigned]
            var ToRoomAssigned_array = [...req.body.ToRoomAssigned]

            var from_invoice_array = [...req.body.from_invoice]
            var to_invoice_array = [...req.body.to_invoice]
            var id_transaction_array = [...req.body.id_transaction]
        } 
        
        const newproduct = product_name_array.map((value)=>{
            
            return  value  = {
                        product_name : value,
                    }   
            })
                    
        from_qty_array.forEach((value,i) => {
            newproduct[i].from_quantity = value
        });

        from_level_array.forEach((value,i) => {
            newproduct[i].from_bay = value
        });

        id_transaction_array.forEach((value, i) => {
            newproduct[i].id_transaction = value
        })


        from_invoice_array.forEach((value,i) => {
            newproduct[i].from_invoice = value
        });
        to_invoice_array.forEach((value,i) => {
            newproduct[i].To_invoice = value
        });
        
        
        
        to_qty_array.forEach((value,i) => {
            newproduct[i].to_quantity = value
        });
        
        to_level_array.forEach((value,i) => {
            newproduct[i].to_bay = value
        });
        
        primary_code_array.forEach((value,i) => {
            newproduct[i].primary_code = value
        });
        
        secondary_code_array.forEach((value,i) => {
            newproduct[i].secondary_code = value
        });
        
        product_code3_array.forEach((value,i) => {
            newproduct[i].product_code = value
        });

        MaxStocks_data2_array.forEach((value, i) => {
            newproduct[i].maxProducts = value
        })



        unit_array.forEach((value, i) => {
            newproduct[i].unit = value
        })


        secondary_unit_array.forEach((value, i) => {
            newproduct[i].secondary_unit = value
        })


        batch_code_array.forEach((value, i) => {
            newproduct[i].batch_code = value
        })


        expiry_date_array.forEach((value, i) => {
            newproduct[i].expiry_date = value
        })

        product_date_array.forEach((value, i) => {
            newproduct[i].production_date = value
        })

        maxProducts_array.forEach((value, i) => {
            newproduct[i].maxProducts = value
        })

        maxPerUnit_array.forEach((value, i) => {
            newproduct[i].maxPerUnit = value
        })

        prod_cat_array.forEach((value, i)=>{
            newproduct[i].prod_cat = value
        })

        RoomAssigned_array.forEach((value, i) => {
            newproduct[i].from_room_name = value
        })


        ToRoomAssigned_array.forEach((value, i) => {
            newproduct[i].to_room_name = value
        })

        



        const Newnewproduct = newproduct.filter(obj => obj.to_quantity !== "0" && obj.to_quantity !== "" || obj.to_floorlevel !== "0" && obj.to_floorlevel !== "");
        // res.json(Newnewproduct)
        // return
        var error = 0
        Newnewproduct.forEach(data => {
            if (parseInt(data.from_quantity) < parseInt(data.to_quantity)) {
                
                error++
            }
        })
        if (error != 0) {
            
            req.flash("errors", `Must not be greater than stock Qty`)
            return res.redirect("back")
        }

    
        
        
        const data = new transfers_finished({ date, from_warehouse, to_warehouse, product:Newnewproduct, note, invoice })
        const transfers_data = await data.save()


        req.flash('success', `Product Transfer successfully`)
        res.redirect("/transfer_finished/preview/"+transfers_data._id)

    }catch(error){
        console.log(error);
        res.status(200).json({ errorMessage: error.message})
    }
})

// finalize process
router.get("/preview/:id", auth , async (req, res) => {
    try { 
        const {username, email, role} = req.user
        const role_data = req.user
        
        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()

        const transfer_data = await transfers_finished.findById(req.params.id)

        let warehouse_data
        if(role_data.role == "staff"){
            const staff_data = await staff.findOne({ email: role_data.email })
            warehouse_data = await warehouse.find({status : 'Enabled', name: staff_data.warehouse, "warehouse_category" : "Finished Goods" });
        }else{
            warehouse_data = await warehouse.find({status : 'Enabled' , "warehouse_category" : "Finished Goods"});
        }
        // res.json(transfer_data.from_warehouse)
        const stock_data = await warehouse.aggregate([
            {
                $match: { "name": transfer_data.from_warehouse, "warehouse_category" : "Finished Goods" }
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
                    expiry_date: { $first: "$product_details.expiry_date"},
                    production_date: { $first: "$product_details.production_date"},
                    room: { $first: "$room" },
                    warehoue_name: {$first: "$name"}
                }
            },
        ])

        // res.json(transfer_data)
        // const RoomAll = transfer_data.product;
        // const results = [];
        // async function fetchStockData(value) {
        //     const stock_data = await warehouse.aggregate([
        //         {
        //             $match: { 
        //                 "name": transfer_data.from_warehouse,
        //                 "room": value 
        //             }
        //         },
        //         {
        //             $unwind: "$product_details"
        //         },
        //         {
        //             $group: {
        //                 _id: "$product_details._id",
        //                 name: { $first: "$product_details.product_name"},
        //                 product_stock: { $first: "$product_details.product_stock" },
        //                 bay: { $first: "$product_details.bay" },
        //                 bin: { $first: "$product_details.bin" },
        //                 type: { $first: "$product_details.type" },
        //                 floorlevel: { $first: "$product_details.floorlevel" },
        //                 primary_code: { $first: "$product_details.primary_code" },
        //                 secondary_code: { $first: "$product_details.secondary_code" },
        //                 product_code: { $first: "$product_details.product_code" },
        //                 storage: { $first: "$product_details.storage" },
        //                 rack: { $first: "$product_details.rack" },
        //                 expiry_date: { $first: "$product_details.expiry_date"},
        //                 from_room: { $first: "$room" }
        //             }
        //         },
        //     ])

        //     results.push(stock_data);

        // }


        // const promises = RoomAll.map((value) => fetchStockData(value.from_room_name));
        // await Promise.all(promises);
        

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

        res.render("edit_transfer_finished_view", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            master_shop : master,
            warehouse: warehouse_data,
            transfer: transfer_data,
            stock: stock_data,
            unit: product_data,
            language : lan_data,
        })
        
    } catch (error) {
        console.log(error);
    }
})


router.post("/preview/:id", auth , async (req, res) => {
    try{

        const {invoice, from_warehouse, FromRoom_name, to_warehouse, ToRoom_name } = req.body
        

        const data =  await transfers_finished.findById(req.params.id)
        // res.json(data)
        // return


        

        const promises = data.product.map( async (product_details) => {
            
            if(product_details.to_quantity > 0){
                var from_warehouse_data = await warehouse.findOne({ name: from_warehouse, room: product_details.from_room_name, warehouse_category: "Finished Goods" });
                const match_data = from_warehouse_data.product_details.map((data) => {

                    // console.log(data._id + " <> " + product_details.id_transaction)
                    if (data.product_name == product_details.product_name &&  data.bay == product_details.from_bay && data.expiry_date == product_details.expiry_date  && data.production_date == product_details.production_date && data.batch_code == product_details.batch_code && data.invoice == product_details.from_invoice) {
                        // console.log("here1", typeof product_details.id_transaction)
                        console.log("here1", data.product_stock)
                        if(typeof product_details.id_transaction == "undefined"){
                            data.product_stock = Math.max(0, Math.abs(data.product_stock) - Math.abs(product_details.to_quantity))
                        }else{
                            data.product_stock = Math.max(0, Math.abs(data.product_stock) - Math.abs(product_details.to_quantity))
                        }
                        // data.product_stock = data.product_stock - product_details.to_quantity

                        // if(data._id == product_details.id_transaction){
                        //     data.product_stock = Math.max(0, Math.abs(data.product_stock) - Math.abs(product_details.quantity))
                        // }else{
                        //     data.product_stock = Math.max(0, Math.abs(data.product_stock) - Math.abs(product_details.quantity))
                        // }
                        
                        
                        
                    }
                })
            }

            return from_warehouse_data;
        })

        Promise.all(promises)
            .then(async (updatedWarehouseDataArray) => {
                try {
                    
                    for (const FromwarehouseData of updatedWarehouseDataArray) {
                        await FromwarehouseData.save();
                    }


                    




                    const promises2 = data.product.map( async (product_details) => {
                        var to_warehouse_data = await warehouse.findOne({ name: to_warehouse, room: product_details.to_room_name });
                        if(product_details.to_quantity > 0){
                            var x = 0;
                            const match_data = to_warehouse_data.product_details.map((data) => {
                                    if (data.product_name == product_details.product_name &&  data.bay == product_details.to_bay && data.expiry_date == product_details.expiry_date  && data.production_date == product_details.production_date && data.batch_code == product_details.batch_code && data.invoice == product_details.To_invoice) {
                                        
                                        if(typeof product_details.id_transaction == "undefined"){
                                            console.log("here2", data.product_stock + " <> " + data._id  + " <=> " +   Math.abs(data.product_stock) + Math.abs(product_details.to_quantity))
                                            data.product_stock = Math.abs(data.product_stock) + Math.abs(product_details.to_quantity)
                                        }else{
                                            data.product_stock = Math.abs(data.product_stock) + Math.abs(product_details.to_quantity)
                                        }
                                        // data.product_stock = data.product_stock + product_details.to_quantity
                                        // if(data._id == product_details.id_transaction){
                                        //     data.product_stock = Math.abs(data.product_stock) + Math.abs(product_details.quantity)
                                        // }else{
                                        //     data.product_stock = Math.abs(data.product_stock) + Math.abs(product_details.quantity)
                                        // }
                                        
                                        x++
                                    }
                                
                            })
            
                            if (x == "0") {
                                to_warehouse_data.product_details = to_warehouse_data.product_details.concat({ 
                                    product_name: product_details.product_name, 
                                    product_stock: product_details.to_quantity, 
                                    bay: product_details.to_bay, 
                                    product_code: product_details.product_code, 
                                    primary_code: product_details.primary_code, 
                                    secondary_code: product_details.secondary_code, 
                                    expiry_date: product_details.expiry_date,
                                    production_date: product_details.production_date,
                                    maxProducts: product_details.maxProducts,
                                    batch_code: product_details.batch_code,
                                    secondary_unit: product_details.secondary_unit,
                                    unit: product_details.unit,
                                    maxProducts: product_details.maxProducts,
                                    maxPerUnit: product_details.maxPerUnit,
                                    invoice: product_details.To_invoice
                                })
                            }
                        }  
            
                        return to_warehouse_data;
                    })


                    Promise.all(promises2)
                        .then(async (updatedWarehouseDataArray) => {
                            try {
                                
                                // for (const TowarehouseData of updatedWarehouseDataArray) {
                                //     await TowarehouseData.save();
                                // }

                                for (const TowarehouseData of updatedWarehouseDataArray) {
                                    await warehouse.updateOne({ _id: TowarehouseData._id }, {
                                            $addToSet: {
                                                product_details: { $each: TowarehouseData.product_details }
                                            }
                                      });
                                }

                                
                                data.finalize = "True"
                                const transfer_data = await data.save()


                                const master = await master_shop.find()
                                const email_data = await email_settings.findOne()
                                const supervisor_data = await supervisor_settings.find();


                                var product_list = data.product

                                var arrayItems = "";
                                var n;

                                for (n in product_list) {
                                    var dataVal = "FG"
                                    if(data.to_warehouse == "DRY GOODS"){
                                        dataVal = "DG"
                                    }
                                    arrayItems +=  '<tr>'+
                                                        '<td style="border: 1px solid black;">' + product_list[n].product_name + '</td>' +
                                                        '<td style="border: 1px solid black;">' + product_list[n].product_code + '</td>' +  
                                                        '<td style="border: 1px solid black;">' + product_list[n].to_quantity + '</td>' +
                                                        '<td style="border: 1px solid black;">' + product_list[n].unit + '</td>' +
                                                        '<td style="border: 1px solid black;">' + product_list[n].secondary_unit + '</td>' +
                                                        '<td style="border: 1px solid black;">' + data.to_warehouse + '</td>' +
                                                        '<td style="border: 1px solid black;">' + product_list[n].to_room_name + '</td>' +
                                                        '<td style="border: 1px solid black;">' + dataVal+product_list[n].to_bay+ '</td>'+ 
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
                                    to: supervisor_data[0].FGSEmail,
                                    subject:'Transfer Mail',
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
                                                        ' Order Number : '+ data.invoice +' '+
                                                        '<span style="float: right;">'+
                                                            ' Order Date : '+ data.date +' '+
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


                                req.flash('success', `Transfer Finalize Successfully`);
                                res.redirect("/picking_list/PDF_transfer/" + transfer_data._id );

                            } catch (error) {
                                console.error(error);
                                res.status(500).json({ error: 'To An error occurred while saving data.' });
                            }
                        })
                        .catch((error) => {
                            // Handle any errors that might have occurred during the process.
                            console.error(error);
                            res.status(500).json({ error: 'An error occurred.' });
                        });

  
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

        

        

        

        
    }catch(error){
        res.json({ message: error.message })
    }
})

// end Finalize

function BayBinSelected(warehouse, room){
    var levels = [];
    let outputArray = [];
    var identify = [];
    if(warehouse == "DRY GOODS"){
        switch(room){
            case "Rack 1":
            levels = [1, 2, 3, 4, 5, 6, 7, 8,9,10,11,12,13,14,15,16];
            break;
            case "Rack 2":
            levels = [17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32];
            break;
        }
        identify = ["DG"]
    }else if(warehouse == "FROZEN GOODS"){
        switch(room){
            case "Rack 1":
            levels = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            break;
            case "Rack 2":
            levels = [10, 11, 12, 13, 14, 15, 16, 17, 18];
            break;
        }
        identify = ["FG"]  
    }


    return { levels, identify };
}

router.get("/view/:id", auth, async(req, res) => {
    try { 
        const {username, email, role} = req.user
        const role_data = req.user
        
        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()

        const transfer_data = await transfers_finished.findById(req.params.id)
        let expiry_date = new Date(transfer_data.expiry_date)
        let ed_day = ('0' + expiry_date.getDate()).slice(-2)
        let ed_month = ('0' + (expiry_date.getMonth() + 1)).slice(-2)
        let ed_year = expiry_date.getFullYear()
        let ed_fullDate = `${ed_year}-${ed_month}-${ed_day}`
        let warehouse_data
        if(role_data.role == "staff"){
            const staff_data = await staff.findOne({ email: role_data.email })
            warehouse_data = await warehouse.find({status : 'Enabled', name: staff_data.warehouse, "warehouse_category" : "Finished Goods" });
        }else{
            warehouse_data = await warehouse.find({status : 'Enabled' , "warehouse_category" : "Finished Goods"});
        }

        const stock_data = await warehouse.aggregate([
            {
                $match: { "name": transfer_data.from_warehouse, room: transfer_data.from_room }
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
        // res.json({ transfer_data })
        var levels = [1, 2, 3, 4]; 
        var Isle = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]; 
        var rooms_data = ["Ambient", "Enclosed"];

        const product_data = await product.find({})
        const dataSelected = BayBinSelected(transfer_data.to_warehouse, transfer_data.to_room);
        // res.json(dataSelected)

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

        res.render("edit_transfer_finished", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            master_shop : master,
            warehouse: warehouse_data,
            transfer: transfer_data,
            stock: stock_data,
            unit: product_data,
            language : lan_data,
            levels,
            Isle,
            rooms_data,
            ed_fullDate,
            dataSelected
        })
        
    } catch (error) {
        console.log(error);
    }
})

router.post("/view/:id", auth, async(req, res) => {
    try {
        const _id = req.params.id
        console.log(req.body);

        const transfer_data = await transfers_finished.findById(_id)
        console.log("transfer_data" , transfer_data);



        const {date, from_warehouse, FromRoom_name, to_warehouse, ToRoom_name, prod_name, from_prod_qty, from_prod_level, from_prod_isle, from_prod_pallet, to_prod_qty, to_prod_level, to_prod_isle, to_prod_pallet, primary_code, secondary_code, product_code3, note, invoice, expiry_date} = req.body


        // res.status(200).json( req.body)
        if(typeof prod_name == "string"){
            var product_name_array = [req.body.prod_name]
            
            var from_qty_array = [req.body.from_prod_qty]
            var from_level_array = [req.body.from_prod_level]

        

            var to_qty_array = [req.body.to_prod_qty]
            var to_level_array = [req.body.to_prod_level]

            
            var primary_code_array = [req.body.primary_code]
            var secondary_code_array = [req.body.secondary_code]
            var product_code3_array = [req.body.product_code3]
            var MaxStocks_data2_array = [req.body.MaxStocks_data2]

            var unit_array = [req.body.unit]
            var secondary_unit_array = [req.body.secondary_unit]
            var batch_code_array = [req.body.batch_code]
            var expiry_date_array = [req.body.expiry_date]
            
            
            
        }else{
            var product_name_array = [...req.body.prod_name]

            

            var from_qty_array = [...req.body.from_prod_qty]
            var from_level_array = [...req.body.from_prod_level]
        
            
            var to_qty_array = [...req.body.to_prod_qty]
            var to_level_array = [...req.body.to_prod_level]
            
            var primary_code_array = [...req.body.primary_code]
            var secondary_code_array = [...req.body.secondary_code]
            var product_code3_array = [...req.body.product_code3]
            var MaxStocks_data2_array = [...req.body.MaxStocks_data2]

            var unit_array = [...req.body.unit]
            var secondary_unit_array = [...req.body.secondary_unit]
            var batch_code_array = [...req.body.batch_code]
            var expiry_date_array = [...req.body.expiry_date]
        } 
        
        const newproduct = product_name_array.map((value)=>{
            
            return  value  = {
                        product_name : value,
                    }   
            })
                    
        from_qty_array.forEach((value,i) => {
            newproduct[i].from_quantity = value
        });

        from_level_array.forEach((value,i) => {
            newproduct[i].from_bay = value
        });
        
        
       
        
        
        
        to_qty_array.forEach((value,i) => {
            newproduct[i].to_quantity = value
        });
        
        to_level_array.forEach((value,i) => {
            newproduct[i].to_bay = value
        });
        
        
        primary_code_array.forEach((value,i) => {
            newproduct[i].primary_code = value
        });
        
        secondary_code_array.forEach((value,i) => {
            newproduct[i].secondary_code = value
        });
        
        product_code3_array.forEach((value,i) => {
            newproduct[i].product_code = value
        });

        MaxStocks_data2_array.forEach((value, i) => {
            newproduct[i].maxProducts = value
        })



        unit_array.forEach((value, i) => {
            newproduct[i].unit = value
        })


        secondary_unit_array.forEach((value, i) => {
            newproduct[i].secondary_unit = value
        })


        batch_code_array.forEach((value, i) => {
            newproduct[i].batch_code = value
        })


        expiry_date_array.forEach((value, i) => {
            newproduct[i].expiry_date = value
        })


    
        
        const Newnewproduct = newproduct.filter(obj => obj.to_quantity !== "0" && obj.to_quantity !== "" || obj.to_floorlevel !== "0" && obj.to_floorlevel !== "");

        var error = 0
        Newnewproduct.forEach(data => {
            if (parseInt(data.from_quantity) < parseInt(data.to_quantity)) {
                
                error++
            }
        })
        if (error != 0) {
            
            req.flash("errors", `Must not be greater than stock Qty`)
            return res.redirect("back")
        }




        const old_from_warehouse_data = await warehouse.findOne({ name: transfer_data.from_warehouse, room: transfer_data.from_room });

        transfer_data.product.forEach(product_details => {

            if(product_details.to_quantity > 0){
                const match_data = old_from_warehouse_data.product_details.map((data) => {

                    if (data.product_name == product_details.product_name  && data.bay == product_details.from_bay) {
                        data.product_stock = parseInt(data.product_stock) + parseInt(product_details.to_quantity)
                        
                    }

                })
            }
            // console.log("final", old_from_warehouse_data);
        })

        await old_from_warehouse_data.save()



        const old_to_warehouse_data = await warehouse.findOne({ name: transfer_data.to_warehouse, room: transfer_data.to_room });

        transfer_data.product.forEach(product_details => {

            if(product_details.to_quantity > 0){
                const match_data = old_to_warehouse_data.product_details.map((data) => {

                    if (data.product_name == product_details.product_name && data.bay == product_details.to_bay) {
                        data.product_stock = parseInt(data.product_stock) - parseInt(product_details.to_quantity)
                    
                    }

                })
            }
        })

        await old_to_warehouse_data.save()



        
        transfer_data.date = date
        transfer_data.from_warehouse = from_warehouse
        transfer_data.to_warehouse = to_warehouse
        transfer_data.product = Newnewproduct
        transfer_data.note = note
        transfer_data.invoice = invoice


        const data = await transfer_data.save()




        const from_warehouse_data = await warehouse.findOne({ name: from_warehouse, room: FromRoom_name });

        data.product.forEach(product_details => {


            if(product_details.to_quantity > 0){
                const match_data = from_warehouse_data.product_details.map((data) => {

                        if (data.product_name == product_details.product_name && data.bay == product_details.from_bay) {
                        data.product_stock = parseInt(data.product_stock) - parseInt(product_details.to_quantity)
                        
                    }

                })
           }
        })

        await from_warehouse_data.save()



        const to_warehouse_data = await warehouse.findOne({ name: to_warehouse, room: ToRoom_name });

        data.product.forEach(product_details => {
            if(product_details.to_quantity > 0){
                var x = 0;
                const match_data = to_warehouse_data.product_details.map((data) => {

                    if (data.product_name == product_details.product_name && data.bay == product_details.to_bay ) {
                        data.product_stock = parseInt(data.product_stock) + parseInt(product_details.to_quantity)
                        x++
                    }

                })

                if (x == "0") {
                    to_warehouse_data.product_details = to_warehouse_data.product_details.concat({  
                        product_name: product_details.product_name, 
                        product_stock: product_details.to_quantity, 
                        bay: product_details.to_bay, 
                        product_code: product_details.product_code, 
                        primary_code: product_details.primary_code, 
                        secondary_code: product_details.secondary_code, 
                        maxProducts: product_details.maxProducts,
                    })
                }
            } 
            // console.log("final", to_warehouse_data);
        })

        await to_warehouse_data.save()
        
        req.flash('success', `Transfer Edit Successfully`)
        res.redirect("/transfer_finished/view")

    } catch (error) {
        console.log(error);
    }
})

// router.post("/barcode_scanner", async(req, res) => {
//     try{
//         const { FromWareHouse, FromRoom, ToWarehouse, ToRoom, primary_code } = req.body 
    
        
//         var checkBy;
//         const warehouse_data = await warehouse.aggregate([
//                 {
//                     $match: { "name": FromWareHouse, room: FromRoom }
//                 },
//                 {
//                     $unwind: "$product_details"
//                 },
//                 {
//                     $match: { "product_details.primary_code" : primary_code }
//                 },
//                 {
//                     $group: {
//                         _id: "$product_details._id",
//                         name: { $first: "$product_details.product_name" },
//                         instock: { $first: "$product_details.product_stock" },
//                         primary_code: { $first: "$product_details.primary_code" },
//                         secondary_code: {$first: "$product_details.secondary_code" },
//                         product_code: { $first: "$product_details.product_code" },
//                         level: { $first: "$product_details.bay" },
//                         isle: { $first: "$product_details.bin" },
//                         type: { $first: "$product_details.type" },
//                         pallet: { $first: "$product_details.floorlevel" },
//                         unit: { $first: "$product_details.unit" },
//                         secondary_unit: { $first: "$product_details.secondary_unit" },
//                         storage: { $first: "$product_details.storage" },
//                         rack: { $first: "$product_details.rack" },
//                         expiry_date: { $first: "$product_details.expiry_date" },
//                         production_date: { $first: "$product_details.production_date" },
//                         batch_code: { $first: "$product_details.batch_code" },
//                         maxPerUnit: { $first: "$product_details.maxPerUnit" },
//                         prod_cat: { $first: "P" }
//                     }
//                 },
            
            
//             ])


//             const warehouse_data2 = await warehouse.aggregate([
//                 {
//                     $match: { "name": FromWareHouse, room: FromRoom }
//                 },
//                 {
//                     $unwind: "$product_details"
//                 },
//                 {
//                     $match: { "product_details.secondary_code" : primary_code }
//                 },
//                 {
//                     $group: {
//                         _id: "$product_details._id",
//                         name: { $first: "$product_details.product_name" },
//                         instock: { $first: "$product_details.product_stock" },
//                         primary_code: { $first: "$product_details.primary_code" },
//                         secondary_code: {$first: "$product_details.secondary_code" },
//                         product_code: { $first: "$product_details.product_code" },
//                         level: { $first: "$product_details.bay" },
//                         isle: { $first: "$product_details.bin" },
//                         type: { $first: "$product_details.type" },
//                         pallet: { $first: "$product_details.floorlevel" },
//                         unit: { $first: "$product_details.unit" },
//                         secondary_unit: { $first: "$product_details.secondary_unit" },
//                         storage: { $first: "$product_details.storage" },
//                         rack: { $first: "$product_details.rack" },
//                         expiry_date: { $first: "$product_details.expiry_date" },
//                         production_date: { $first: "$product_details.production_date" },
//                         batch_code: { $first: "$product_details.batch_code" },
//                         maxPerUnit: { $first: "$product_details.maxPerUnit" },
//                         prod_cat: { $first: "S" }
//                     }
//                 },
            
            
//             ])

//             if(warehouse_data.length > 0){
//                 checkBy = warehouse_data;
//             }else if(warehouse_data2.length > 0){
//                 checkBy = warehouse_data2;
//             }
        
//         res.status(200).json(checkBy)
        
//     }catch(error){
//         res.status(404).json({ message : error.message })    
//     }
// })

router.post("/barcode_scanner", async (req, res) => {
    const { FromWareHouse, FromRoom, ToWarehouse, ToRoom, primary_code , Roomslist } = req.body;
    const RoomAll = Roomslist.split(",");
    const results = [];
    // console.log(req.body)
    // Define a function to fetch stock data asynchronously
    async function fetchStockData(value) {
        const stock_data = await warehouse.aggregate([
            {
                $match: { "name": FromWareHouse, "room" : value }
            },
            {
                $unwind: "$product_details"
            },
            {
                $match: { "product_details.primary_code": primary_code }
            },
            {
                $group: {
                    _id: "$product_details._id",
                    name: { $first: "$product_details.product_name" },
                    instock: { $first: "$product_details.product_stock" },
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
                    batch_code: { $first: "$product_details.batch_code" },
                    maxPerUnit: { $first: "$product_details.maxPerUnit" },
                    roomNamed : { $first: "$room" },
                    prod_cat: { $first: "P" },
                    invoice: { $first: "$product_details.invoice" }
                }
            },
        ]);

        const stock_data2 = await warehouse.aggregate([
            
            {
                $match: { "name": FromWareHouse, "room" : value }
            },
            {
                $unwind: "$product_details"
            },
            {
                $match: { "product_details.secondary_code": primary_code }
            },
            {
                $group: {
                    _id: "$product_details._id",
                    name: { $first: "$product_details.product_name" },
                    instock: { $first: "$product_details.product_stock" },
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
                    batch_code: { $first: "$product_details.batch_code" },
                    maxPerUnit: { $first: "$product_details.maxPerUnit" },
                    roomNamed : { $first: "$room" },
                    prod_cat: { $first: "S" },
                    invoice: { $first: "$product_details.invoice" }
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


router.post("/barcode_scanner2", async(req, res) => {
    try{
        const { FromWareHouse, FromRoom, ToWarehouse, ToRoom, secondary_code } = req.body 
    
        
        
        const warehouse_data = await warehouse.aggregate([
                {
                    $match: { "name": FromWareHouse }
                },
                {
                    $unwind: "$product_details"
                },
                {
                    $match: { "product_details.secondary_code" : secondary_code }
                },
                {
                    $group: {
                      _id: "$product_details._id",
                      name: { $first: "$product_details.product_name"},
                      primary_code: { $first: "$product_details.primary_code" } ,
                      secondary_code: { $first: "$product_details.secondary_code" } ,
                      product_code: { $first: "$product_details.product_code" } ,
                      instock: { $first: "$product_details.product_stock" } ,
                      warehouse: { $first: "$name" },
                      level: { $first: "$product_details.level" },
                      isle: { $first: "$product_details.isle" },
                      pallet: { $first: "$product_details.pallet" },
                      maxProducts: { $first: "$product_details.maxProducts" },
                      unit: { $first: "$product_details.unit" },
                      expiry_date: { $first: "$product_details.expiry_date" },
                      production_date: { $first: "$product_details.production_date" },
                    }
                },
            
            
            ])
        
        res.status(200).json(warehouse_data)
        
    }catch(error){
        res.status(404).json({ message : error.message })    
    }
})

router.post("/barcode_scanner3", async(req, res) => {
    try{
        const { FromWareHouse, FromRoom, ToWarehouse, ToRoom, product_code } = req.body 
    
        
        
        const warehouse_data = await warehouse.aggregate([
                {
                    $match: { "name": FromWareHouse }
                },
                {
                    $unwind: "$product_details"
                },
                {
                    $match: { "product_details.product_code" : product_code }
                },
                {
                    $group: {
                      _id: "$product_details._id",
                      name: { $first: "$product_details.product_name"},
                      primary_code: { $first: "$product_details.primary_code" } ,
                      secondary_code: { $first: "$product_details.secondary_code" } ,
                      product_code: { $first: "$product_details.product_code" } ,
                      instock: { $first: "$product_details.product_stock" } ,
                      warehouse: { $first: "$name" },
                      level: { $first: "$product_details.level" },
                      isle: { $first: "$product_details.isle" },
                      pallet: { $first: "$product_details.pallet" },
                      maxProducts: { $first: "$product_details.maxProducts" },
                      unit: { $first: "$product_details.unit" },
                    }
                },
            
            
            ])
        
        res.status(200).json(warehouse_data)
        
    }catch(error){
        res.status(404).json({ message : error.message })    
    }
})



// router.post("/CheckingWarehouse", async (req, res) => {

//     const {  level, isle, pallet, warehouses, room } = req.body

//     try{
//         const stock_data = await warehouse.aggregate([
//             {
//                 $match: { 
//                     "name": warehouses,
//                     "room": room

//                 }
//             },
//             {
//                 $unwind: "$product_details"
//             },
//             {
//                 $match: {
//                     "product_details.level" : parseInt(level),
//                     "product_details.isle" : isle,
//                     "product_details.pallet": parseInt(pallet),
//                     // "product_details.product_code" : productCode,
//                     // "product_details.secondary_code": secondaryCode,
//                     // "product_details.primary_code" : primaryCode
//                 }
//             },
//             {
//                 $group: {
//                     _id: "$product_details._id",
//                     name: { $first: "$product_details.product_name"},
//                     product_stock: { $first: "$product_details.product_stock" },
//                     level: { $first: "$product_details.level" },
//                     isle: { $first: "$product_details.isle" },
//                     pallet: { $first: "$product_details.pallet" },
//                     maxProducts: { $first: "$product_details.maxProducts" },
//                     expiry_date: { $first: "$product_details.expiry_date" },
//                     production_date: { $first: "$product_details.production_date" },
//                 }
//             },
//         ])


//         res.status(200).json(stock_data)
//     }catch(error){
//         res.status(404).json({ message: error.message })
//     }

// })


router.post("/CheckingWarehouse", async (req, res) => {

    const { productCode, bay, warehouses, room } = req.body
    console.log(req.body)
    try{
        const stock_data = await warehouse.aggregate([
            {
                $match: { 
                    "name": warehouses,
                    "room": room

                }
            },
            {
                $unwind: "$product_details"
            },
            {
                $match: {
                    "product_details.bay" : parseInt(bay),
                }
            },
            {
                $group: {
                    _id: "$product_details._id",
                    name: { $first: "$product_details.product_name"},
                    product_stock: { $first: "$product_details.product_stock" },
                    bay: { $first: "$product_details.bay" },
                    maxProducts: { $first: "$product_details.maxProducts" }
                }
            },
        ])


        res.status(200).json(stock_data)
    }catch(error){
        res.status(404).json({ message: error.message })
    }

})

module.exports = router;