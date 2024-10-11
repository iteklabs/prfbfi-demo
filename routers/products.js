const express = require("express");
const res = require("express/lib/response");
const app = express();
const router = express.Router();
const multer = require('multer');
const { profile, master_shop, categories, brands, units, product, purchases, warehouse } = require("../models/all_models");
const auth = require("../middleware/auth");
const users = require("../public/language/languages.json");
const excelJS = require("exceljs");
const xlsx = require('xlsx');
const JsBarcode = require('jsbarcode');
const { Canvas } = require("canvas");
const PDFDocument = require('pdfkit-table');

// ========== categories ============ //

router.get("/categories", auth, async (req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user

        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        console.log("master" , master);

        const find_data = await categories.find();
        // console.log(find_data);

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

        res.render("categories", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            user: find_data,
            master_shop : master,
            language : lan_data
            })
    } catch (error) {
        console.log(error);
    }
})

router.post("/categories", auth, async (req, res) => {
    try {
        // console.log(req.body.name);
        const { name, products } = req.body;
        const data = new categories({ name, products })

        const categories_name = await categories.findOne({name:name})
        if(categories_name){
            req.flash("errors", `${name} categories is alredy added. please choose another`)
        }else{
            req.flash("success", `${name} categories is add successfully`)
        }

        const userdata = await data.save();
        // console.log(userdata);
        res.redirect("/products/categories")
    } catch (error) {
        console.log(error);
    }
})

router.get("/categories/:id", auth, async (req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user

        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        console.log("master" , master);

        const _id = req.params.id;
        console.log(_id);
        const user_id = await categories.findById(_id)

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

        res.render("categories", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            master_shop : master,
            user: user_id,
            language : lan_data
        })

    } catch (error) {
        console.log(error);
    }
})

router.post("/categories/:id", auth, async (req, res) => {
    try {
        const _id = req.params.id;
        const update_data = await categories.findByIdAndUpdate(_id, req.body);

        req.flash("success", `${users.categories_edit}`)
        res.redirect("/products/categories")
    } catch (error) {
        console.log(error);
    }
})

router.get("/categories/delete/:id", auth, async (req, res) => {
    try {
        const _id = req.params.id;
        const delete_data = await categories.findByIdAndDelete(_id);

        req.flash("success", `categories data delete successfully`)
        res.redirect("/products/categories")
    } catch (error) {
        console.log(error);
    }
})


// ============ brands ============= //

router.get("/brands", auth, async (req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user
        
        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        console.log("master" , master);

        const find_data = await brands.find();
        // console.log(find_data);

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
        
        res.render("brands", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            master_shop : master,
            user: find_data,
            language : lan_data
        })
    } catch (error) {
        console.log(error);
    }
})

router.post("/brands", auth, async (req, res) => {
    try {
        // console.log(req.body.name);
        const { name, products } = req.body;
        const data = new brands({ name,products })

        const brands_name = await brands.findOne({name:name})
        if(brands_name){
            req.flash("errors", `${name} brand is alredy added. please choose another`)
        }else{
            req.flash("success", `${name} brand is add successfully`)
        }

        const userdata = await data.save();
        // console.log(userdata);
        res.redirect("/products/brands")
    } catch (error) {
        console.log(error);
    }
})


router.get("/brands/:id", auth, async (req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user
        
        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        console.log("master" , master);

        const _id = req.params.id;
        console.log(_id);
        const user_id = await brands.findById(_id)

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

        res.render("brands", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            master_shop : master,
            user: user_id,
            language : lan_data
        })

    } catch (error) {
        console.log(error);
    }
})

router.post("/brands/:id", auth, async (req, res) => {
    try {
        const _id = req.params.id;
        const update_data = await brands.findByIdAndUpdate(_id, req.body);

        req.flash('success', `brand data update successfully`)
        res.redirect("/products/brands")
    } catch (error) {
        console.log(error);
    }
})

router.get("/brands/delete/:id", auth, async (req, res) => {
    try {
        const _id = req.params.id;
        const delete_data = await brands.findByIdAndDelete(_id);

        req.flash("success", `brand data delete successfully`)
        res.redirect("/products/brands")
    } catch (error) {
        console.log(error);
    }
})


// ============ units ============= //


router.get("/units", auth, async (req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user
        
        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        console.log("master" , master);

        const find_data = await units.find();
        // console.log(find_data);

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

        res.render("units", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            master_shop : master,
            user: find_data,
            language : lan_data
        })
    } catch (error) {
        console.log(error);
    }
})

router.post("/units", auth, async (req, res) => {
    try {
        // console.log(req.body.name);
        const { name, secondary_unit,products } = req.body;
        const data = new units({ name, secondary_unit,products })

        const unit_name = await units.findOne({name:name});
        if(unit_name){
            req.flash('errors', `${name} unit is alredy added. please choose another`)
        }else{
            req.flash('success', `${name} unit is add successfully`)
        }

        const userdata = await data.save();
        // console.log(userdata);
        res.redirect("/products/units")
    } catch (error) {
        console.log(error);
    }
})


router.get("/units/:id", auth, async (req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user
        
        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        console.log("master" , master);

        const _id = req.params.id;
        // console.log(_id);
        const user_id = await units.findById(_id)

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

        res.render("units", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            master_shop : master,
            user: user_id,
            language : lan_data
        })

    } catch (error) {
        console.log(error);
    }
})

router.post("/units/:id", auth, async (req, res) => {
    try {
        const _id = req.params.id;
        const update_data = await units.findByIdAndUpdate(_id, req.body);

        req.flash('success', `unit data update successfully`)
        res.redirect("/products/units")
    } catch (error) {
        console.log(error);
    }
})

router.get("/units/delete/:id", auth, async (req, res) => {
    try {
        const _id = req.params.id;
        const delete_data = await units.findByIdAndDelete(_id);

        req.flash('success', `unit data delete successfully`)
        res.redirect("/products/units")
    } catch (error) {
        console.log(error);
    }
})



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/upload")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname)
    }
})

const upload = multer({ storage: storage });


// ======== Products ============ //

router.get("/view", auth, async (req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user
        
        const profile_data = await profile.findOne({email : role_data.email})
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const master = await master_shop.find()
        console.log("Products master" , master);

        const find_data = await product.find();
        console.log("Products find_data", find_data);


        const warehouse_data = await warehouse.aggregate([
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
                    product_name: '$product_details.product_name',
                    product_stock: '$product_details.product_stock',
                }
            },
            {
                $group: {
                    _id: "$product_name",
                    product_stock: { $sum: "$product_stock" }
                }
            },
        ])
        console.log("Products warehouse_data", warehouse_data);


        warehouse_data.forEach(product_details => {

            const match_data = find_data.map((data) => {

                if (data.name == product_details._id) {
                    data.stock = parseInt(data.stock) + parseInt(product_details.product_stock)
                    
                }

            })
        })
        console.log("Products find_data", find_data);

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

        res.render("products", { 
            success: req.flash('success'),
            errors: req.flash('errors'),
            alldata: find_data,
            profile : profile_data,
            master_shop : master,
            role : role_data,
            product_stock : warehouse_data,
            language : lan_data
			
        })
    } catch (error) {
        console.log(error);
    }
})

// ------------ Add Product ------------ //

router.get("/view/add_products", auth, async (req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user
        
        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        console.log("master" , master);

        const categories_data = await categories.find({});
        const brands_data = await brands.find({});
        const units_data = await units.find({});
        const find_data = await warehouse.find({status : 'Enabled'});

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

        // res.render("product_add_product", {
        res.render("add_product", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            categories: categories_data,
            brands: brands_data,
            master_shop : master,
            units: units_data,
            language : lan_data,
            find_data
        })
    } catch (error) {
        console.log(error);
    }
})

router.post("/view/add_products", auth, upload.single("image"), async (req, res) => {
    try {
        const { name, category, brand, unit, alertquantity, stock, product_code,  warehouse, primary_ItemCode, second_ItemCode, second_unit, maxPerUnit, MaxPerProduct } = req.body
        // const image = req.file.filename ?? 'defaultProduct.avif';
        const image = req.file?.filename || 'defaultProduct.avif';
        
        const data = new product({ image, name, category, brand, unit, alertquantity, stock, product_code, warehouse, primary_code: primary_ItemCode, secondary_code: second_ItemCode, second_unit: second_unit, maxStocks: MaxPerProduct, maxProdPerUnit:maxPerUnit });
        const products_data = await data.save()

        const categories_data = await categories.findOne({name : category});
        categories_data.products = parseInt(categories_data.products) + 1
        await categories_data.save()

        const brands_data = await brands.findOne({name : brand});
        brands_data.products = parseInt(brands_data.products) + 1
        await brands_data.save()

        const units_data = await units.findOne({name : unit});
        units_data.products = parseInt(units_data.products) + 1
        await units_data.save()


        req.flash('success', `product add successfully`)
        res.redirect("/products/view")
    } catch (error) {
        console.log(error);
    }
})


// ========= edit Product ============ //

router.get("/view/:id", auth, async (req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user
        
        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        console.log("edit Product master" , master);

        const _id = req.params.id
        const user_id = await product.findById(_id)


        const categories_data = await categories.find({});
        const brands_data = await brands.find({});
        const units_data = await units.find({});
        const find_data = await warehouse.find({status : 'Enabled'});

        const Secunits_data = await units.aggregate([
            {
              "$group": {
                "_id": "$_id",
                "secondaryunit": {
                  $first: "$secondary_unit"
                }
              }
            }
          ])

        // res.json(Secunits_data)
		
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

        res.render("edit_product", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            alldata: user_id,
            categories: categories_data, 
            brands: brands_data, 
            master_shop : master,
            units: units_data,
            secondunit: Secunits_data,
            find_data,
            language : lan_data
        })

    } catch (error) {
        console.log(error);
    }
})

router.post("/view/:id", auth, upload.single("image"), async (req, res) => {
    try {
        console.log("hello");
        const _id = req.params.id;
        const data = await product.findById(_id)

        const { image, name, category, brand, sku, unit, alertquantity, product_code,  warehouse, primary_ItemCode, second_ItemCode, second_unit, maxPerUnit, MaxPerProduct, prod_catdata } = req.body

        if (req.file) {
            data.image = req.file.filename
        }
        data.name = name
        data.category = category
        data.brand = brand
        data.sku = sku
        data.unit = unit
        data.alertquantity = alertquantity
        data.product_code = product_code
        data.warehouse = warehouse
        data.primary_code = primary_ItemCode
        data.secondary_code = second_ItemCode
        data.secondary_unit = second_unit
        data.maxStocks = MaxPerProduct
        data.maxProdPerUnit = maxPerUnit
        data.product_category = prod_catdata
       

        const new_data = await data.save();
        console.log("product edit", data);
        
        req.flash('success', `product update successfully`)
        res.redirect("/products/view")
    } catch (error) {
        console.log(error);
    }
})


router.get("/barcode/:id", auth, async (req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user
        
        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        console.log("barcode Product master" , master);

        const _id = req.params.id
        const user_id = await product.findById(_id)
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
        
        res.render("product_barcode", {
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


// ========== Export Excel Product =============== //


router.get("/products_export_migrate_file", auth, async (req, res) => {
    
    try{
        const workbook = new excelJS.Workbook();  // Create a new workbook
        const worksheet = workbook.addWorksheet("Products"); // New Worksheet
         worksheet.columns = [
            { header: "Product_Name", key: "PName", width: 10 }, 
            { header: "Brands", key: "PBrands", width: 10 },
            { header: "Units", key: "PUnits", width: 10 },
            { header: "Secondary_Units", key: "PSecondaryUnits", width: 10 },
            { header: "max_number_per_units", key: "MaxperUnits", width: 10 },
            { header: "Primary_Code", key: "ProductCode", width: 10 },
            { header: "Secondary_Code", key: "ProductCode", width: 10 },
            { header: "Product_Code", key: "ProductCode", width: 10 },
            { header: "Category", key: "PCat", width: 10 },
            { header: "Alert_QTY", key: "PAlQty", width: 10 },
            { header: "Maximum_Stocks", key: "PAlQty", width: 10 },
            { header: "Products_category", key: "Prod_Cat", width: 10 },
        ];
        
        res.setHeader(
        	"Content-Type",
        	"application/vnd.openxmlformats-officedocument.spreadsheatml.sheet"
        );


        res.setHeader("Content-Disposition", 'attachment; filename=Product_Migration_File.xlsx');

        return workbook.xlsx.write(res).then(() =>{
        	res.status(200);
        })
        
        
    }catch(error){
        res.status(400).send(error);
    }
})


const storage1 = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/Migration")
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname)
    }
})

const uploadMigrate = multer({ storage: storage1 });


router.post("/products_import_migrate_file", auth, uploadMigrate.single("migrate_product_fule"), async (req, res) => {
    
    const excelFile = req.file.filename
    const workbook = await xlsx.readFile("public/Migration/"+excelFile);  // Step 2
    let workbook_sheet = workbook.SheetNames;                // Step 3
    let workbook_response = xlsx.utils.sheet_to_json(        // Step 4
      workbook.Sheets[workbook_sheet[0]]
    );
    
    for (const item of workbook_response) {
      const ProductName = item["Product_Name"];
      const brand = item.Brands;
      const unit = item.Units;
      const secondary_unit1 = item.Secondary_Units;
      const product_code = item.Product_Code;
      const category = item.Category;
      const AQty = item.Alert_QTY;
      const Primary_code = item.Primary_Code;
      const Secondary_code = item.Secondary_Code;
      const MaxStocks = item.Maximum_Stocks;
      const max_number_per_units = item.max_number_per_units;
      const Products_category = item.Products_category;
    
      try {
        let categories_data = await categories.findOne({ name: category });
        if (!categories_data) {
          const data1 = new categories({ name: category, products: '0' });
          categories_data = await data1.save();
        }
    
        let brands_data = await brands.findOne({ name: brand });
        if (!brands_data) {
          const data2 = new brands({ name: brand, products: '0' });
          brands_data = await data2.save();
        }
    
        let units_data = await units.findOne({ name: unit, secondary_unit: secondary_unit1 });
        if (!units_data) {
          const data3 = new units({ name: unit, secondary_unit: secondary_unit1, products: '0' });
          units_data = await data3.save();
        }
    
        const prduct_data = await product.find({
          name: ProductName,
          category: categories_data.name,
          brand: brands_data.name,
          secondary_unit: units_data.secondary_unit,
          product_code: product_code
        });
        console.log(prduct_data.length + " <> " + categories_data.name + " <> "  + brands_data.name + " <> " +  units_data.secondary_unit + " <> " + product_code + " <> " + ProductName)
        if (prduct_data.length === 0) {
          const data5 = new product({
            image: "defaultProduct.avif",
            name: ProductName,
            category: categories_data.name,
            brand: brands_data.name,
            unit: units_data.name,
            alertquantity: AQty,
            product_code: product_code,
            secondary_unit: units_data.secondary_unit,
            primary_code: Primary_code,
            secondary_code: Secondary_code,
            maxStocks: MaxStocks, 
            maxProdPerUnit: max_number_per_units,
            product_category:Products_category
          });
    
          const savedData = await data5.save();
          categories_data.products = parseInt(categories_data.products) + 1;
          await categories_data.save();
          brands_data.products = parseInt(brands_data.products) + 1;
          await brands_data.save();
          units_data.products = parseInt(units_data.products) + 1;
          await units_data.save();
          req.flash('success', `${ProductName} added successfully`);
        } else {
            console.log(prduct_data[0])
            const datasave = prduct_data[0];
            datasave.category = categories_data.name,
            datasave.brand = brands_data.name,
            datasave.unit = units_data.name,
            datasave.alertquantity = AQty,
            datasave.product_code = product_code,
            datasave.secondary_unit = units_data.secondary_unit,
            datasave.primary_code = Primary_code,
            datasave.secondary_code = Secondary_code,
            datasave.maxStocks = MaxStocks, 
            datasave.maxProdPerUnit = max_number_per_units,
            datasave.product_category = Products_category
            
            const savedData = await datasave.save();
          req.flash('success', `${savedData.name} Edit Successfully`);
        }
      } catch (error) {
        res.status(500).json({ proderror: error.message, aproduct: ProductName });
      }
    }

    
    
    res.redirect("/products/view");

    
    
})


router.post("/select_data", auth, async (req, res) => {
try {
    console.log(req.body);
    const { data_cateory, datachoose } = req.body
    var dataShow;
    if(datachoose == "prod_categ"){
        dataShow = await product.aggregate([
            {
                $group:{
                    "_id": "$product_category",
                }
            }
        ])

       
    }else if(datachoose == "brands"){

        dataShow = await product.aggregate([
            {
                $match:{
                    "product_category": data_cateory,
                }
            },
            {
                $group:{
                    "_id": "$brand",
                }
            }
        ])

    }else if(datachoose == "categ"){
        dataShow = await product.aggregate([
            {
                $match:{
                    "product_category": data_cateory,
                }
            },
            {
                $group:{
                    "_id": "$category",
                }
            }
        ])
    }
    // console.log(dataShow)
    res.json(dataShow)
} catch (error) {
    res.json({ message: error.message })
}

    
    
})


router.post("/filter_product", auth, async (req, res) => {
    try {
        const { data_choosing, data_selected } = req.body
        var dataShow;
        if(data_choosing == "prod_categ"){
            dataShow = await product.aggregate([
                {
                    $match:{
                        "product_category": data_selected,
                    }
                }
            ])
    
           
        }else if(data_choosing == "brands"){
    
            dataShow = await product.aggregate([
                {
                    $match:{
                        "brand": data_selected,
                    }
                }
            ])
    
        }else if(data_choosing == "categ"){
            dataShow = await product.aggregate([
                {
                    $match:{
                        "category": data_selected,
                    }
                }
            ])
        }
        // console.log(req.body)
        res.json(dataShow)
    } catch (error) {
        res.json({ message: error.message })
    }
    
        
        
})



router.get("/print_barcode", auth, async(req, res) =>{

    const role_data = req.user
        
    const profile_data = await profile.findOne({email : role_data.email})
    const master = await master_shop.find();
    const products_data = await product.find();

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


    res.render("product_barcode_products", {
        success: req.flash('success'),
        errors: req.flash('errors'),
        role : role_data,
        profile : profile_data,
        // alldata: user_id,,
        products : products_data,
        master_shop : master,
        language : lan_data
    })
})


router.post("/barcode_data", auth, async (req, res) => {
    const products_data = await product.find();
    res.json({ "data" : products_data } );
})



router.post("/barcode_filter", auth, async (req, res) => {
    try {
        const { dataProdCat, dataProdIdentity  } = req.body
        
        var dataShow;
        switch (dataProdCat) {
            case "fg":
                switch (dataProdIdentity) {
                    case "Brands":

                    dataShow = await product.aggregate([
                        {
                            $match:{
                                "product_category": "Finished Goods",
                            }
                        },
                        {
                            $group:{
                                "_id": "$brand",
                            }
                        },
                        {
                            $project: {
                                "brand": "$_id" // Projecting the category
                            }
                        }
                    ])
                    
                        break;
                    case "Category":
                        dataShow = await product.aggregate([
                            {
                                $match:{
                                    "product_category": "Finished Goods",
                                }
                            },
                            {
                                $group:{
                                    "_id": "$category",
                                }
                            },
                            {
                                $project: {
                                    "category": "$_id" // Projecting the category
                                }
                            }
                        ])
                    break;
                    
                    
                }
                break;

            case "rm":
                switch (dataProdIdentity) {
                    case "Brands":
                        dataShow = await product.aggregate([
                            {
                                $match:{
                                    "product_category": "Raw Materials",
                                }
                            },
                            {
                                $group:{
                                    "_id": "$brand",
                                }
                            },
                            {
                                $project: {
                                    "brand": "$_id" // Projecting the category
                                }
                            }
                        ])
                        
                        
                        break;
                    case "Category":
                        dataShow = await product.aggregate([
                            {
                                $match: {
                                    "product_category": "Raw Materials",
                                }
                            },
                            {
                                $group: {
                                    "_id": "$category" // Grouping by category
                                }
                            },
                            {
                                $project: {
                                    "category": "$_id" // Projecting the category
                                }
                            }
                        ]);
                        
                        
                    
                    break;
                }
                break;
        }


       
        res.json(dataShow)
    } catch (error) {
        res.json({ message: error.message })
    }
    
        
        
})


router.post("/print_barcode_filter/", auth, async (req, res) => {
    try {
      console.log(req.body)
        const { prod_cat, identity, valueData, typeofbarcode } = req.body
        let dataShow;
        switch (prod_cat) {
            case "fg":
                if(identity == "Brands"){
                    dataShow = await product.aggregate([
                        {
                            $match:{
                                "product_category": "Finished Goods",
                                "brand" : valueData
                            }
                        }
                    ])
                }else if(identity == "Category"){
             

                    dataShow = await product.aggregate([
                        {
                            $match:{
                                "product_category": "Finished Goods",
                                "category" : valueData
                            }
                        }
                    ])


             
                }
                break;
            case "rm":
                if(identity == "Brands"){
                    dataShow = await product.aggregate([
                        {
                            $match:{
                                "product_category": "Raw Materials",
                                "brand" : valueData
                            }
                        }
                    ])
                }else if(identity == "Category"){
                    dataShow = await product.aggregate([
                        {
                            $match:{
                                "product_category": "Raw Materials",
                                "category" : valueData
                            }
                        }
                    ])
                }
                break;
        
        }




        const inchesToPoints = inches => inches * 72; // Convert inches to points (1 inch = 72 points)

        const sizeInInches = { width: 3, height: 1 }; // Size in inches
        // Create PDF document
        const doc = new PDFDocument({
            margin: inchesToPoints(0.75), // 0.75 inches margin on all sides (30 mm)
            size: [inchesToPoints(sizeInInches.width), inchesToPoints(sizeInInches.height)], // Set document size to 3 inches wide and 1 inch tall
            bufferPages: true
        });

        const intdata = dataShow.length;


        for(let i = 0; i <= intdata; i++){


            if(i != intdata){
              const ProductName = dataShow[i].name;
              const primary_code = dataShow[i].primary_code;
              const secondary_code = dataShow[i].secondary_code;
              const products_code = dataShow[i].product_code;
                var thecode;
              switch(typeofbarcode){
                case "1":
                    thecode = primary_code;
                break;
                case "2":
                    thecode =secondary_code;
                break;
                case "3":
                    thecode =products_code;
                break;
              }
      
              const imageSize = { width: 210, height: 100 }; // Size of the barcode image
              const pdfPageSize = { width: inchesToPoints(sizeInInches.width), height: inchesToPoints(sizeInInches.height) }; // Size of the PDF page
              const canvas = new Canvas();
            //   JsBarcode(canvas, thecode, {
            //       format: "CODE128", height: 50,
            //       displayValue: true,
            //       text: thecode
            //   });

            JsBarcode(canvas, thecode, {
                format: "CODE128",
                height: imageSize.height,
                displayValue: true,
                text: thecode
            });
      
              // doc
              // .fontSize(8)
              // .text(ProductName, 0, 0);
            //   doc.image(canvas.toBuffer(), 0, 0, { width: 210 });
      
            //   doc.addPage();


            const imageBuffer = canvas.toBuffer();
    
            // Calculate scaling factors for width and height
            const scaleFactorWidth = pdfPageSize.width / imageSize.width;
            const scaleFactorHeight = pdfPageSize.height / imageSize.height;

            // Choose the smaller scaling factor to ensure the image fits within the page
            const scaleFactor = Math.min(scaleFactorWidth, scaleFactorHeight);

            // Calculate new dimensions based on the scaling factor
            const newWidth = imageSize.width * scaleFactor;
            const newHeight = imageSize.height * scaleFactor;

            // Calculate position to center the image on the page
            const xPosition = (pdfPageSize.width - newWidth) / 2;
            const yPosition = (pdfPageSize.height - newHeight) / 2;

            doc.image(imageBuffer, xPosition, yPosition, { width: newWidth, height: newHeight });

            if (i != intdata) {
                doc.addPage();
            }
            }
      
          }
          
          
         // Save the PDF to a buffer
        const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                // const pdfBlob = new Blob([pdfData], { type: 'application/pdf' });
                // const pdfUrl = URL.createObjectURL(pdfBlob);
                // // res.json({ pdfUrl: pdfUrl }); // Sending back the URL to the client-side
                // res.json({ pdfContent: pdfData.toString('base64') });

                const pdfBase64 = pdfData.toString('base64');
                res.json({ pdfContent: pdfBase64 });
            });

            doc.end();


        // res.json(dataShow);
    } catch (error) {
        res.json({ message: error.message })
    }
})



router.post("/print_barcode_filter_search/", auth, async (req, res) => {
    try {
      console.log(req.body)
        const { prod_cat, identity, valueData } = req.body
        let dataShow;
        switch (prod_cat) {
            case "fg":
                if(identity == "Brands"){
                    dataShow = await product.aggregate([
                        {
                            $match:{
                                "product_category": "Finished Goods",
                                "brand" : valueData
                            }
                        }
                    ])
                }else if(identity == "Category"){
             

                    dataShow = await product.aggregate([
                        {
                            $match:{
                                "product_category": "Finished Goods",
                                "category" : valueData
                            }
                        }
                    ])


             
                }
                break;
            case "rm":
                if(identity == "Brands"){
                    dataShow = await product.aggregate([
                        {
                            $match:{
                                "product_category": "Raw Materials",
                                "brand" : valueData
                            }
                        }
                    ])
                }else if(identity == "Category"){
                    dataShow = await product.aggregate([
                        {
                            $match:{
                                "product_category": "Raw Materials",
                                "category" : valueData
                            }
                        }
                    ])
                }
                break;
        
        }


        res.json({ data: dataShow});
    } catch (error) {
        res.json({ message: error.message })
    }
})



router.post("/print_barcode_single/:id", auth, async (req, res) => {
    try {

        const _id = req.params.id
        const {copies, typeofbarcode} = req.body;
       

        var dataShow = await product.findById(_id);

       
        const inchesToPoints = inches => inches * 72; // Convert inches to points (1 inch = 72 points)

        const sizeInInches = { width: 3, height: 1 }; // Size in inches
        // Create PDF document
        const doc = new PDFDocument({
            margin: inchesToPoints(0.75), // 0.75 inches margin on all sides (30 mm)
            size: [inchesToPoints(sizeInInches.width), inchesToPoints(sizeInInches.height)], // Set document size to 3 inches wide and 1 inch tall
            bufferPages: true
        });

        const intdata = copies;
        const ProductName = dataShow.name;
        const primary_code = dataShow.primary_code;
        const secondary_code = dataShow.secondary_code;
        const products_code = dataShow.product_code;
        let codeused;
        switch(typeofbarcode){
            case "1":
                codeused = primary_code;
                break;
            case "2": 
                codeused = secondary_code;
            break;
            case "3": 
                codeused = products_code;
            break;
        }



        // for(let i = 1; i <= intdata; i++){
        //       const canvas = new Canvas();
        //       JsBarcode(canvas, codeused, {
        //           format: "CODE128", height: 50,
        //           displayValue: true,
        //           text: codeused
        //       });
        //       // doc
        //       // .fontSize(8)
        //       // .text(ProductName, 0, 0);
        //       doc.image(canvas.toBuffer(), 0, 0, { width: 210 });
        //         if(i != intdata){
        //             doc.addPage();
        //         }
        //   }
          
          
         // Save the PDF to a buffer
         const imageSize = { width: 210, height: 100 }; // Size of the barcode image
         const pdfPageSize = { width: inchesToPoints(sizeInInches.width), height: inchesToPoints(sizeInInches.height) }; // Size of the PDF page

         for (let i = 1; i <= intdata; i++) {
            const canvas = new Canvas();
            JsBarcode(canvas, codeused, {
                format: "CODE128",
                height: imageSize.height,
                displayValue: true,
                text: codeused
            });
            const imageBuffer = canvas.toBuffer();
    
            // Calculate scaling factors for width and height
            const scaleFactorWidth = pdfPageSize.width / imageSize.width;
            const scaleFactorHeight = pdfPageSize.height / imageSize.height;

            // Choose the smaller scaling factor to ensure the image fits within the page
            const scaleFactor = Math.min(scaleFactorWidth, scaleFactorHeight);

            // Calculate new dimensions based on the scaling factor
            const newWidth = imageSize.width * scaleFactor;
            const newHeight = imageSize.height * scaleFactor;

            // Calculate position to center the image on the page
            const xPosition = (pdfPageSize.width - newWidth) / 2;
            const yPosition = (pdfPageSize.height - newHeight) / 2;

            doc.image(imageBuffer, xPosition, yPosition, { width: newWidth, height: newHeight });

            if (i != intdata) {
                doc.addPage();
            }
        }
        
        
         const buffers = [];
            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                // const pdfBlob = new Blob([pdfData], { type: 'application/pdf' });
                // const pdfUrl = URL.createObjectURL(pdfBlob);
                // // res.json({ pdfUrl: pdfUrl }); // Sending back the URL to the client-side
                // res.json({ pdfContent: pdfData.toString('base64') });

                const pdfBase64 = pdfData.toString('base64');
                res.json({ pdfContent: pdfBase64 });
            });

            doc.end();


        // res.json(dataShow);
    } catch (error) {
        res.json({ message: error.message })
    }
})







module.exports = router;