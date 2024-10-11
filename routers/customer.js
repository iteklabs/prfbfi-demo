const express = require("express");
const app = express();
const router = express.Router();
const { profile, master_shop, categories, brands, units, product, warehouse, staff, customer, customer_payment, c_payment_data, sing_up} = require("../models/all_models");
const auth = require("../middleware/auth");
const users = require("../public/language/languages.json");
const excelJS = require("exceljs");
const xlsx = require('xlsx');
const multer = require('multer');

router.get("/view", auth,  async(req, res) => {
    try{
        const {username, email, role} = req.user
        const role_data = req.user

        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        console.log("master" , master);

        const find_data = await customer.find();
        // console.log(find_data);

        const customer_data = await customer.aggregate([
            {
                $lookup:
                {
                    from: "c_payments",
                    localField: "name",
                    foreignField: "customer",
                    as: "customer_docs"
                }
            }
            
        ]);
        console.log(customer_data);

        const payment_data = customer_data.map(data => {
            console.log("data" , data);
            var sale = 0
            var sale_return = 0

            data.customer_docs.forEach(element => {
                console.log("element" , element);
                if (element.reason == "Sale") {
                    sale += element.amount
                } else {
                    sale_return += element.amount
                }
            });

            data.sale = parseFloat(sale) + 0 
            data.sale_return = parseFloat(sale_return) + 0

            return data
        })
        console.log("payment_data" , payment_data);

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

        res.render("customer", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            user : find_data,
            role : role_data,
            profile : profile_data,
            payment: payment_data,
            master_shop : master,
            language : lan_data
        })
    }catch(error){
        console.log(error);
    }
})

router.post("/view", auth, async(req, res) => {
    try{
        const {name, address, mobile, email, receivable, payable, contactperson, landline} = req.body;
        
        const data = new customer({name, address, mobile, email, receivable, payable, contactperson, landline})

        const userdata = await data.save();
        // console.log(userdata);
    
        req.flash('success', `customer add successfully`)
        res.redirect("/customer/view")
    }catch(error){  
        console.log(error);
    }
})

router.get("/view/:id", auth, async(req, res) => {
    try{
        const {username, email, role} = req.user
        const role_data = req.user

        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        console.log("master" , master);

        const _id = req.params.id;
        // console.log(_id);
        const user_id = await customer.findById(_id)

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

        res.render("customer", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            user : user_id,
            master_shop : master,
            language : lan_data
        })
    }catch(error){
        console.log(error);
    }
})

router.post("/view/:id", auth, async(req, res) => {
    try{
        const _id = req.params.id;
        const data = await customer.findById(_id);
        const {name, address, mobile, email, receivable, payable, contactperson, landline} = req.body;

        data.name = name
        data.address = address
        data.mobile = mobile
        data.email = email
        data.receivable = receivable
        data.payable = payable
        data.contactperson = contactperson
        data.landline = landline

        const new_data = await data.save();
        req.flash('success', `customer update successfully`)
        res.redirect("/customer/view")
    }catch(error){
        console.log(error);
    }   
})

// -------- customer payment ------- //

router.get("/view/payment/:id", auth, async (req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user

        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        console.log("master" , master);

        console.log(req.params.id);

        const customer_data = await customer.findOne({ _id: req.params.id })
        console.log("customer_data" , customer_data);

        const payment_data = await c_payment_data.find({ customer: customer_data.name })
        console.log(payment_data);

        const payable_sum = await c_payment_data.aggregate([
            {
                $match: { "customer": customer_data.name }
            },
            {
                $match: { "reason": "Sale" }
            },
            {
                $group: {
                    _id: "$reason",
                    sum: { $sum: "$amount" }
                }
            },
        ])
        console.log("payable_sum", payable_sum);


        const receivable_sum = await c_payment_data.aggregate([
            {
                $match: { "customer": customer_data.name }
            },
            {
                $match: { "reason": "Sale Return" }
            },
            {
                $group: {
                    _id: "$reason",
                    sum: { $sum: "$amount" }
                }
            },
        ])
        console.log("receivable_sum", receivable_sum);

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


        res.render("customer_payment", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            payment: payment_data,
            payable: payable_sum,
            receivable: receivable_sum,
            master_shop : master,
            language : lan_data
        })
    } catch (error) {
        console.log(error);
    }
})



router.get("/products_export_migrate_file", auth, async (req, res) => {
    
    try{
        const workbook = new excelJS.Workbook();  // Create a new workbook
        const worksheet = workbook.addWorksheet("Customers"); // New Worksheet
         worksheet.columns = [
            { header: "ID", key: "PName", width: 10 }, 
            { header: "Name", key: "PBrands", width: 10 },
            { header: "SalesmanCode", key: "PUnits", width: 10 },
            { header: "SalesmanName", key: "SalesmanName", width: 10 },
            { header: "address", key: "address", width: 10 },
            { header: "mobile", key: "mobile", width: 10 },
            { header: "email", key: "email", width: 10 },

        ];
        
        res.setHeader(
        	"Content-Type",
        	"application/vnd.openxmlformats-officedocument.spreadsheatml.sheet"
        );


        res.setHeader("Content-Disposition", 'attachment; filename=customer_Migration_File.xlsx');

        return workbook.xlsx.write(res).then(() =>{
        	res.status(200);
        })
        
        
    }catch(error){
        res.status(400).send({ errors: error.message });
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

router.post("/customer_import_migrate_file", auth, uploadMigrate.single("customer_product_fule"), async (req, res) => {
    
    const excelFile = req.file.filename
    const workbook = await xlsx.readFile("public/Migration/"+excelFile);  // Step 2
    let workbook_sheet = workbook.SheetNames;                // Step 3
    let workbook_response = xlsx.utils.sheet_to_json(        // Step 4
      workbook.Sheets[workbook_sheet[0]]
    );
    // res.json(workbook_response)
    // return
    for (const item of workbook_response) {
      const ID = item["ID"];
      const Name = item.Name;
      const SalesmanCode = item.SalesmanCode;
      const SalesmanName = item.SalesmanName;
      const address = item.address;
      const mobile = item.mobile;
      const email = item.email;
      
    
      try {
        let customers_data = await customer.findOne({ name: Name });
        if (!customers_data) {
          const data1 = new customer({ name: Name, ID: ID, SalesmanCode: SalesmanCode, SalesmanName: SalesmanName, address: address, mobile: mobile, email:email });
          customers_data = await data1.save();
          req.flash('success', `${Name} added successfully`);
        }  else {
            req.flash('error', `${Name} Failed`);
        }
      } catch (error) {
        res.status(500).json({ proderror: error.message, aproduct: ProductName });
      }
    }

    
    
    res.redirect("/customer/view");

    
    
})

module.exports = router;