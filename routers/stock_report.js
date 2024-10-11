const express = require("express");
const app = express();
const router = express.Router();
const { profile, master_shop, categories, brands, units, product, warehouse, staff, customer, suppliers, purchases } = require("../models/all_models");
const auth = require("../middleware/auth");
const users = require("../public/language/languages.json");


router.get("/view", auth, async (req, res) => {
    try {
        const role_data = req.user
        console.log("role_data", req.user);
        
        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        console.log("master" , master);

        const warehouse_data = await warehouse.find({})
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

        res.render("stock_report", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            master_shop : master,
            warehouse: warehouse_data,
            product: product_data,
            warehouse_doc: [],
            product_doc : [],
            language : lan_data
        }) 

    } catch (error) {
        console.log(error);
    }
})

router.get("/view/:id", auth, async (req, res) => {
    try {

        const master = await master_shop.find()
        console.log("master" , master);

        if (req.params.id == "warehouse") {
            
            const user_data = await warehouse.find()
            console.log(user_data);

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
            res.status(200).json({
                data: user_data,
                language : lan_data.warehouse,
            })
        } else {
            
            const user_data = await product.find()
            console.log("111", user_data);

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
            
            res.status(200).json({ 
                data: user_data,
                language : lan_data.products,
               
            })
        }
        


    } catch (error) {
        console.log(error);
    }
})


router.get("/view/warehouse/:id", auth, async (req, res) => {
    try {
        const _id = req.params.id
        console.log(_id);

        const master = await master_shop.find()
        console.log("master" , master);

        const warehouse_data = await warehouse.aggregate([
            {
                $match: { "name": _id }
            },
            {
                $unwind: "$product_details"
            },
            {
                $lookup:
                {
                    from: "products",
                    localField: "product_details.product_name",
                    foreignField: "name",
                    as: "product_docs"
                }
            },
            {
                $unwind: "$product_docs"
            },
            {
                $project: 
                {
                    name: 1,
                    product_name: '$product_details.product_name',
                    product_stock: '$product_details.product_stock',
                    category: '$product_docs.category',
                    brand: '$product_docs.brand',
                    sku: '$product_docs.sku',
                    unit: '$product_docs.unit',
                    rak: 'product_details.rak_name',
                    bin: 'product_details.bin_name'
                }
            }
        ])
        console.log(warehouse_data);
        

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

        res.status(200).json({
            data: warehouse_data,
            language : lan_data
        })

    } catch (error) {
        console.log(error);
    }
})


router.get("/view/product/:id", auth, async (req, res) => {
    try {
        const _id = req.params.id
        console.log(_id);

        const master = await master_shop.find()
        console.log("master" , master);


        const product_data = await product.findOne({name : _id})
        console.log("product_data", product_data);

        const warehouse_data = await warehouse.aggregate([
            {
                $unwind: "$product_details"
            },
            {
                $match: { "product_details.product_name": _id }
            },
            {
                $project: 
                {
                    name: 1,
                    product_name: '$product_details.product_name',
                    product_stock: '$product_details.product_stock',
                }
            }
        ])
        console.log("warehouse_data", warehouse_data);
        
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

        res.status(200).json({ 
            product_data,
            warehouse_data,
            language : lan_data
        })

    } catch (error) {
        console.log(error);
    }
})


router.post("/Reports", async (req, res)=> {
    const { warehouseNew, rooms, Type, process_cat, room_cat } = req.body
    let warehouse_data;
    console.log(req.body)
    // return
    if(process_cat == "raw"){
        warehouse_data = await warehouse.aggregate([
            {
                $match:{
                    name: warehouseNew,
                    room: rooms,
                    warehouse_category: "Raw Materials"
                }
            },
            {
                $unwind: "$product_details"
            },
            {
                $match:{
                    "product_details.type": Type,
                    "product_details.product_stock": { $gt: 0 } 
                }
            },
            {
                $sort: { 
                    "warehouse_category": 1,
                    "product_details.bay": 1 
                    
                }
            }
        ]);
    }else if(process_cat == "finish"){
        if(rooms == "All"){
            
            warehouse_data = await warehouse.aggregate([
                {
                    $match:{
                        name: warehouseNew,
                        // room: rooms,
                        warehouse_category: "Finished Goods"
                    }
                },
                {
                    $unwind: "$product_details"
                },
                {
                    $match:{
                      
                        "product_details.product_stock": { $gt: 0 } 
                    }
                },
                {
                    $sort: { 
                        "warehouse_category": 1,
                        "product_details.bay": 1 
                        
                    }
                }
            ]); 

            // warehouse_data.sort((a, b) => a.product_details.bay - b.product_details.bay);


        }else{
            
            warehouse_data = await warehouse.aggregate([
                {
                    $match:{
                        name: warehouseNew,
                        room: rooms,
                        warehouse_category: "Finished Goods"
                    }
                },
                {
                    $unwind: "$product_details"
                },
                {
                    $match:{
                      
                        "product_details.product_stock": { $gt: 0 } 
                    }
                },
                {
                    $sort: { 
                        "warehouse_category": 1,
                        "product_details.bay": 1 
                        
                    }
                }
            ]); 

            // warehouse_data.sort((a, b) => a.product_details.bay - b.product_details.bay);
        }
        
    }else{



        console.log("ssd")
        Include = [
            {
                $unwind: "$product_details"
            },
            {
                $match:{
                    // "product_details.type": Type,
                    "product_details.product_stock": { $gt: 0 } 
                }
            },
            {
                $sort: { 
                    "warehouse_category": 1,
                    "product_details.bay": 1 
                    
                }
            }
        ]
      

        
        warehouse_data = await warehouse.aggregate(Include);
        // warehouse_data.sort((a, b) => a.product_details.bay - b.product_details.bay);

    }
    
    res.json(warehouse_data)
})


router.post("/Reports_product", async (req, res)=> {
    const { warehouseNew, rooms, Type, process_cat, room_cat } = req.body
  
    
    const product_data = await product.find();
    
    
    res.json(product_data)
})

module.exports = router;