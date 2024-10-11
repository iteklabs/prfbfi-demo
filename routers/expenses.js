const express = require("express");
const app = express();
const router = express.Router();
const { profile, master_shop, categories, brands, units, product, warehouse, staff, customer, suppliers, purchases, suppliers_payment, expenses_type, all_expenses} = require("../models/all_models");
const auth = require("../middleware/auth");
const users = require("../public/language/languages.json");

// =========== expenses type ============== //
router.get("/type", auth, async(req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user
        const profile_data = await profile.findOne({email : role_data.email})
        const master = await master_shop.find()
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

const expensesTypes = await expenses_type.find({})

const expensesData = await Promise.all(expensesTypes.map(async (expenseType) => {
  const count = await all_expenses.countDocuments({ type: expenseType.name })
  return { ...expenseType.toJSON(), count }
}))

        res.render("expenses_type", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            master_shop : master,
            language : lan_data,
            expensesData
        }) 
    } catch (error) {
        console.log(error);
    }
})

router.post("/type", auth, async(req, res) => {
    try {
        const{name} = req.body
        
        const data = new expenses_type({ name })

        const expenses_type_data = await expenses_type.findOne({name:name})
        if(expenses_type_data){
            req.flash("errors", `${name} expenses is alredy added. please choose another`)
            
        }else{
            req.flash("success", `${name} expenses is add successfully`)
            const userdata = await data.save();
        }

        res.redirect("/all_expenses/type")

    } catch (error) {
        console.log(error);
    }
})

router.post("/type/:id", auth, async (req, res) => {
    try {
        const _id = req.params.id;

        const old_expenses_type = await expenses_type.findById(_id)
        
        const update_expenses_type= await expenses_type.findByIdAndUpdate(_id, req.body);

        const expenses = await all_expenses.updateMany({type:old_expenses_type.name}, {$set:{type: req.body.name}})

        req.flash('success', `expenses data update successfully`)
        res.redirect("/all_expenses/type")
    } catch (error) {
        console.log(error);
    }
})

router.get("/type/delete/:id", auth, async (req, res) => {
    try {
        const _id = req.params.id;
        const delete_data = await expenses_type.findByIdAndDelete(_id);

        req.flash("success", `Expenses data delete successfully`)
        res.redirect("/all_expenses/type")
    } catch (error) {
        console.log(error);
    }
})


// =========== expenses type end ============== //



// =========== expenses ============== //


router.get("/view", auth, async(req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user

        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        console.log("master" , master);

        const expenses_type_data = await expenses_type.find({}) 
        const expenses = await all_expenses.find({})
        console.log(expenses);

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

        res.render("expenses", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            data : expenses_type_data,
            expenses_data : expenses,
            master_shop : master,
            language : lan_data
        })
    } catch (error) {
        console.log(error);
    }
})


router.get("/view/add_expenses", auth, async(req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user

        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        console.log("master" , master);

        const expenses_type_data = await expenses_type.find({}) 

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

        res.render("add_expenses", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            data : expenses_type_data,
            master_shop : master,
            language : lan_data
        })
    } catch (error) {
        console.log(error);
    }
})

router.post("/view/add_expenses", auth, async(req, res) => {
    try{
        const {type, date, amount, note} = req.body
        
        const expenses = new all_expenses({type, date, amount, note})

        const userdata = await expenses.save();
        
        res.redirect("/all_expenses/view")

    }catch(error){
        console.log(error);
    }
})

router.get("/view/:id", auth, async(req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user

        const profile_data = await profile.findOne({email : role_data.email})

        const master = await master_shop.find()
        console.log("master" , master);
        
        const expenses_type_data = await expenses_type.find({}) 
        console.log(expenses_type_data);

        const expenses = await all_expenses.findById(req.params.id)
        console.log(expenses);

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

        res.render("edit_expenses", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            data : expenses_type_data,
            expenses_data : expenses,
            master_shop : master,
            language : lan_data
        })
    } catch (error) {
        console.log(error);
    }
})

router.post("/view/:id", auth, async(req, res) => {
    try {
        const _id = req.params.id;
        console.log(_id);
        const expenses = await all_expenses.findByIdAndUpdate(_id, req.body);
        console.log(expenses);

        req.flash('success', `expenses data update successfully`)
        res.redirect("/all_expenses/view")
    } catch (error) {
        console.log(error);
    }
})


// =========== expenses end ============== //

module.exports = router;