const express = require("express");
const app = express();
const router = express.Router();
const { profile, master_shop, categories, brands, units, product, warehouse, staff, customer, suppliers, purchases, suppliers_payment, s_payment_data } = require("../models/all_models");
const auth = require("../middleware/auth");
const users = require("../public/language/languages.json");
const excelJS = require("exceljs");
const xlsx = require('xlsx');
const multer = require('multer');



router.get("/view", auth, async (req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user
        
        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        console.log("master" , master);


        const find_data = await suppliers.find();
        console.log(find_data);

        const suppliers_data = await suppliers.aggregate([
            {
                $lookup:
                {
                    from: "s_payments",
                    localField: "name",
                    foreignField: "suppliers",
                    as: "suppliers_docs"
                }
            }
            
        ]);

       const payment_data = suppliers_data.map(data => {
            console.log("data", data);
            var purchase = 0
            var purchase_return = 0

            data.suppliers_docs.forEach((doc)=>{
                console.log("doc" , doc);
                if (doc.reason == "Purchase") {
                    purchase += doc.amount
                }else{
                    purchase_return += doc.amount
                }
            })

           data.purchase= purchase
           data.purchase_return = purchase_return

           return data
        })
        console.log("supplier.js payment_data", payment_data);

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

        res.render("supplier", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            user: find_data,
            profile : profile_data,
            master_shop : master,
            role : role_data,
            payment: payment_data,
            language : lan_data
        })

    } catch (error) {
        console.log(error);
    }
})


router.post("/view", auth, async (req, res) => {
    try {
        // console.log(req.body.name);
        const { name, email, mobile, company, address, receivable, payable, code, contactperson,landline } = req.body;
        const data = new suppliers({ name, email, mobile, company, address, receivable, payable, suppliers_code:code, contactperson,landline })

        const userdata = await data.save();
        // console.log(userdata);
        req.flash('success', `supplier data add successfully`)
        res.redirect("/supplier/view")
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

        const _id = req.params.id;
        // console.log(_id);
        const user_id = await suppliers.findById(_id)
        console.log(user_id);

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

        res.render("supplier", {
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

router.post("/view/:id", auth, async (req, res) => {
    try {
        const _id = req.params.id;
        const data = await suppliers.findById(_id);
        const { name, email, mobile, company, address, receivable, payable, code, contactperson,landline } = req.body;
        
        data.name = name
        data.email = email
        data.mobile = mobile
        data.company = company
        data.address = address
        data.receivable = receivable
        data.payable = payable
        data.suppliers_code = code
        data.contactperson = contactperson
        data.landline = landline

        const new_data = await data.save();
        req.flash('success', `supplier data update successfully`)
        res.redirect("/supplier/view")
    } catch (error) {
        console.log(error);
    }
})


// -------- supplier payment ------- //

router.get("/view/payment/:id", auth, async (req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user
        
        const profile_data = await profile.findOne({email : role_data.email})
        
        const master = await master_shop.find()
        console.log("master" , master);

        console.log(req.params.id);

        const suppliers_data = await suppliers.findOne({ _id: req.params.id })
        console.log(suppliers_data);

        const payment_data = await s_payment_data.find({ suppliers: suppliers_data.name })
        console.log(payment_data);

        const payable_sum = await s_payment_data.aggregate([
            {
                $match: { "suppliers": suppliers_data.name }
            },
            {
                $match: { "reason": "Purchase" }
            },
            {
                $group: {
                    _id: "$reason",
                    sum: { $sum: "$amount" }
                }
            },
        ])
        console.log("payable_sum", payable_sum);


        const receivable_sum = await s_payment_data.aggregate([
            {
                $match: { "suppliers": suppliers_data.name }
            },
            {
                $match: { "reason": "Purchase Return" }
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

        res.render("supplier_payment", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            master_shop : master,
            payment: payment_data,
            payable: payable_sum,
            receivable: receivable_sum,
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
            { header: "Name", key: "PBrands", width: 10 },
            { header: "Supplier_Code", key: "PUnits", width: 10 },
            { header: "Email", key: "SalesmanName", width: 10 },
            { header: "Mobile_number", key: "address", width: 10 },
            { header: "Company_Name", key: "mobile", width: 10 },
            { header: "address", key: "email", width: 10 },

        ];
        
        res.setHeader(
        	"Content-Type",
        	"application/vnd.openxmlformats-officedocument.spreadsheatml.sheet"
        );


        res.setHeader("Content-Disposition", 'attachment; filename=supplier_Migration_File.xlsx');

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

router.post("/supplier_import_migrate_file", auth, uploadMigrate.single("supplier_product_file"), async (req, res) => {
    
    const excelFile = req.file.filename
    const workbook = await xlsx.readFile("public/Migration/"+excelFile);  // Step 2
    let workbook_sheet = workbook.SheetNames;                // Step 3
    let workbook_response = xlsx.utils.sheet_to_json(        // Step 4
      workbook.Sheets[workbook_sheet[0]]
    );
    // res.json(workbook_response)
    // return
    for (const item of workbook_response) {

      const Name = item.Name;
      const SuppliersCode= item.Supplier_Code;
      const address = item.address;
      const mobile = item.Mobile_number;
      const email = item.Email;
      const CompanyName = item.Company_Name;
      
    
      try {
        let suppliers_data = await suppliers.findOne({ name: Name });
        if (!suppliers_data) {
          const data1 = new suppliers({ name: Name, suppliers_code: SuppliersCode, address: address, mobile: mobile, email:email, company: CompanyName });
          suppliers_data = await data1.save();
          req.flash('success', `${Name} added successfully`);
        }  else {
            req.flash('error', `${Name} Failed`);
        }
      } catch (error) {
        res.status(500).json({ proderror: error.message, aproduct: ProductName });
      }
    }

    
    
    res.redirect("/supplier/view");

    
    
})



module.exports = router;