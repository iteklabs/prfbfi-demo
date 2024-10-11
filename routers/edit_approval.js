const express = require("express");
const app = express();
const router = express.Router();
const auth = require("../middleware/auth");
const {profile, master_shop, sales_finished, adjustment_finished, transfers_finished, sales, adjustment,transfers  } = require("../models/all_models");
const users = require("../public/language/languages.json");
const nodemailer = require('nodemailer');


router.get("/view", auth, async(req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user
        const profile_data = await profile.findOne({email : role_data.email})
        const master = await master_shop.find()

        const sales_data = await sales.find({ finalize: "False"});
        const adjustment_data = await adjustment.find({ finalize: "False"});
        const transfer_data = await transfers.find({ finalize: "False"});

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
        res.render("edit_approvals_view", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            master_shop : master,
            language : lan_data,
            sales : sales_data,
            adjustment : adjustment_data,
            transfer : transfer_data
        })
    } catch (error) {
        console.log(error);
    }
    
})


router.get("/outgoing", auth, async(req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user
        const profile_data = await profile.findOne({email : role_data.email})
        const master = await master_shop.find()

        const sales_data = await sales.find({ finalize: "False"});
        const title = { name: "Outgoing Raw materials", code: "out" }
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
        res.render("approvals_view", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            master_shop : master,
            language : lan_data,
            data : sales_data,
            titleName : title
        })
    } catch (error) {
        console.log(error);
    }
    
})


router.post("/outgoing", auth, async(req, res) => {
    try {

        const { id, invoice, value} = req.body;
        const save_data = await sales.findOne({ _id: id, invoice: invoice });
        save_data.isAllowEdit = value;
        const new_data = await save_data.save()

        res.json({
            status : 200,
            data: {
                BoolData: new_data.isAllowEdit,
                InvoiceNum: new_data.invoice
            }
        })
    } catch (error) {
        console.log(error);
        return {
            status : 404,
            data: error.message
        }
    }
    
})


router.get("/adjustment", auth, async(req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user
        const profile_data = await profile.findOne({email : role_data.email})
        const master = await master_shop.find()

        const adjustment_data = await adjustment.find({ finalize: "False"});
        const title = { name: "Adjustment Raw materials", code: "adj"}
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
        res.render("approvals_view", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            master_shop : master,
            language : lan_data,
            data : adjustment_data,
            titleName : title
        })
    } catch (error) {
        console.log(error);
    }
    
})


router.post("/adjustment", auth, async(req, res) => {
    try {

        const { id, invoice, value} = req.body;
        const save_data = await adjustment.findOne({ _id: id, invoice: invoice });
        save_data.isAllowEdit = value;
        const new_data = await save_data.save()

        res.json({
            status : 200,
            data: {
                BoolData: new_data.isAllowEdit,
                InvoiceNum: new_data.invoice
            }
        })
    } catch (error) {
        return {
            status : 404,
            data: error.message
        }
    }
    
})


router.get("/transfer", auth, async(req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user
        const profile_data = await profile.findOne({email : role_data.email})
        const master = await master_shop.find()

        const transfer_data = await transfers.find({ finalize: "False"});
        const title = { name: "Transfer Raw materials", code: "trf"}
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
        res.render("approvals_view", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            master_shop : master,
            language : lan_data,
            data : transfer_data,
            titleName : title
        })
    } catch (error) {
        console.log(error);
    }
    
})


router.post("/transfer", auth, async(req, res) => {
    try {

        const { id, invoice, value} = req.body;
        const save_data = await transfers.findOne({ _id: id, invoice: invoice });
        save_data.isAllowEdit = value;
        const new_data = await save_data.save()

        res.json({
            status : 200,
            data: {
                BoolData: new_data.isAllowEdit,
                InvoiceNum: new_data.invoice
            }
        })
    } catch (error) {
        return {
            status : 404,
            data: error.message
        }
    }
    
})




router.get("/outgoing_finished", auth, async(req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user
        const profile_data = await profile.findOne({email : role_data.email})
        const master = await master_shop.find()

        const sales_data = await sales_finished.find({ finalize: "False"});
        const title = { name: "Outgoing Finished Goods", code: "outF" }
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
        res.render("approvals_view", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            master_shop : master,
            language : lan_data,
            data : sales_data,
            titleName : title
        })
    } catch (error) {
        console.log(error);
    }
    
})


router.post("/outgoing_finished", auth, async(req, res) => {
    try {

        const { id, invoice, value} = req.body;
        const save_data = await sales_finished.findOne({ _id: id, invoice: invoice });
        save_data.isAllowEdit = value;
        const new_data = await save_data.save()

        res.json({
            status : 200,
            data: {
                BoolData: new_data.isAllowEdit,
                InvoiceNum: new_data.invoice
            }
        })
    } catch (error) {
        console.log(error);
        return {
            status : 404,
            data: error.message
        }
    }
    
})



router.get("/adjustment_finished", auth, async(req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user
        const profile_data = await profile.findOne({email : role_data.email})
        const master = await master_shop.find()

        const adjustment_data = await adjustment_finished.find({ finalize: "False"});
        const title = { name: "Adjustment Finished Goods", code: "adjf"}
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
        res.render("approvals_view", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            master_shop : master,
            language : lan_data,
            data : adjustment_data,
            titleName : title
        })
    } catch (error) {
        console.log(error);
    }
    
})


router.post("/adjustment_finished", auth, async(req, res) => {
    try {

        const { id, invoice, value} = req.body;
        const save_data = await adjustment_finished.findOne({ _id: id, invoice: invoice });
        save_data.isAllowEdit = value;
        const new_data = await save_data.save()

        res.json({
            status : 200,
            data: {
                BoolData: new_data.isAllowEdit,
                InvoiceNum: new_data.invoice
            }
        })
    } catch (error) {
        return {
            status : 404,
            data: error.message
        }
    }
    
})



router.get("/transfer_finished", auth, async(req, res) => {
    try {
        const {username, email, role} = req.user
        const role_data = req.user
        const profile_data = await profile.findOne({email : role_data.email})
        const master = await master_shop.find()

        const transfer_data = await transfers_finished.find({ finalize: "False"});
        const title = { name: "Transfer Finished Goods", code: "trff"}
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
        res.render("approvals_view", {
            success: req.flash('success'),
            errors: req.flash('errors'),
            role : role_data,
            profile : profile_data,
            master_shop : master,
            language : lan_data,
            data : transfer_data,
            titleName : title
        })
    } catch (error) {
        console.log(error);
    }
    
})


router.post("/transfer_finished", auth, async(req, res) => {
    try {

        const { id, invoice, value} = req.body;
        const save_data = await transfers_finished.findOne({ _id: id, invoice: invoice });
        save_data.isAllowEdit = value;
        const new_data = await save_data.save()

        res.json({
            status : 200,
            data: {
                BoolData: new_data.isAllowEdit,
                InvoiceNum: new_data.invoice
            }
        })
    } catch (error) {
        return {
            status : 404,
            data: error.message
        }
    }
    
})


module.exports = router;