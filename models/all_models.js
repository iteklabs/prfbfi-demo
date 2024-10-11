const mongoose = require('mongoose');


// ========= sing_up ========= //

const sing_up_data = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
    },
    role: {
        type: String,
        require: true
    },
    code: {
        type: String
    },
    isUsed: {
        type: String,
        default: "False"
    }
})

const sing_up = new mongoose.model("sing_up", sing_up_data);


// ======== profile ======== //

const profile_data = new mongoose.Schema({
    firstname: {
        type: String,
    },
    lastname: {
        type: String,
    },
    email: {
        type: String,
    },
    image: {
        type: String
    }
})

const profile = new mongoose.model("profile", profile_data);


// ======== categories ========== //

const categories_data = new mongoose.Schema({
    name: {
        type: String,
    },
    products: {
        type: Number,
    }
})

const categories = new mongoose.model("categories", categories_data);

// ========= brands =========== //

const brands_data = new mongoose.Schema({
    name: {
        type: String,
    },
    products: {
        type: Number,
    }
})

const brands = new mongoose.model("brands", brands_data);



// ========= units =========== //

const units_data = new mongoose.Schema({
    name: {
        type: String,
    },
    secondary_unit:{
        type: String
    },
    products: {
        type: Number,
    }
})

const units = new mongoose.model("units", units_data);


// ========= products =========== //

const product_data = new mongoose.Schema({
    image: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        // unique : true
    },
    category: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    sku: {
        type: String,
        // required: true
    },
    unit: {
        type: String,
        required: true
    },
    second_unit:{
        type: String
    },
    stock: {
        type: Number
    },
    alertquantity: {
        type: Number
    },
    product_code: {
        type: String,
        unique: true
    },
    warehouse: {
        type: String
    },
    secondary_unit:{
        type: String
    },
    sub_category:{
        type: String
    },
    primary_code:{
        type: String
    },
    secondary_code:{
        type: String
    },
    maxStocks:{
        type: Number,
        default: 9999
    },
    maxProdPerUnit:{
        type: Number
    },
    product_category:{
        type: String
    }
    
})

const product = new mongoose.model("product", product_data);


// ========= warehouse =========== //

const warehouse_data = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    room: {
        type: String
    },
    status: {
        type: String,
        default: "Enabled"
    },
    main_category:{
        type: String
    },
    category: {
        type: String
    },
    warehouse_category:{
        type: String
    },
    product_details: [
        {
            product_name: {
                type: String,
                default: "no product"
            },
            product_stock: {
                type: Number,
                min: 0,
                default: 0
            },
            primary_code: {
                type: String
            },
            secondary_code: {
                type: String
            },
            product_code: {
                type: String
            },
            storage:{
                type: String
            },
            rack:{
                type: String
            },
            bay:{
                type: Number
            },
            bin:{
                type: mongoose.Schema.Types.Mixed
            },
            type:{
                type: String
            },
            floorlevel:{
                type: Number
            },
            maxProducts:{
                type: Number,
                default: 9999
            },
            unit:{
                type: String
            },
            secondary_unit: {
                type: String
            },
            expiry_date:{
                type: String
            },
            production_date: {
                type: String
            },
            maxPerUnit:{
                type: Number
            },
            batch_code: {
                type: String
            },
            alertQTY:{
                type: Number
            },
            production_date:{
                type: String
            },
            delivery_date:{
                type: String
            },
            delivery_code:{
                type: String
            },
            product_cat:{
                type: String
            },
            invoice: {
                type: String
            },
            out_invoice: {
                type: String
            },
            adj_invoice: {
                type: String
            },
            trf_invoice: {
                type: String
            },
            actual_qty:{
                type: String
            },
            actual_uom:{
                type: String
            },
            id_incoming: {
                type: String
            },
            date_data: {
                type: String
            }
        }
    ]
})

const warehouse = new mongoose.model("warehouse", warehouse_data);


// ========= staff =========== //

const staff_data = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: "Enabled"
    },
    warehouse:{
        type: String
    },
    position:{
        type: String
    },
    warehouse_category:{
        type: String 
    }
})

const staff = new mongoose.model("staff", staff_data);


// ========= customer =========== //

const customer_data = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        // required: true
    },
    mobile: {
        type: Number,
        // required: true
    },
    email: {
        type: String,
        // required: true
    },
    receivable: {
        type: Number,
    },
    payable: {
        type: Number,
    },
    ID: {
        type: String
    },
    SalesmanCode: {
        type: String
    },SalesmanName: {
        type: String
    },
    contactperson:{
        type: String
    },
    landline:{
        type: String
    }
})

const customer = new mongoose.model("customer", customer_data);


// ========= c_payment_data =========== //

const c_payment = new mongoose.Schema({
    invoice: {
        type: String,
    },
    date: {
        type: String,
    },
    customer: {
        type: String,
    },
    reason: {
        type: String,
    },
    amount: {
        type: Number,
    }
})

const c_payment_data = new mongoose.model("c_payment", c_payment);


// ========= c_payment_data end =========== //



// ========= customer payment =========== //

const customer_payment_data = new mongoose.Schema({
    invoice: {
        type: String,
    },
    date: {
        type: String,
    },
    customer: {
        type: String,
    },
    reason: {
        type: String,
    },
    amount: {
        type: Number,
    }
})

const customer_payment = new mongoose.model("customer_payment", customer_payment_data);



// ========= suppliers =========== //

const suppliers_data = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true
    },
    company: {
        type: String,
    },
    address: {
        type: String,
    },
    receivable: {
        type: Number,
    },
    payable: {
        type: Number,
    },
    suppliers_code: {
        type: String,
    },
    contactperson:{
        type: String
    },
    landline:{
        type: String
    }
})

const suppliers = new mongoose.model("suppliers", suppliers_data);

// ========= suppliers end =========== //


// ========= s_payment_data =========== //

const s_payment = new mongoose.Schema({
    invoice: {
        type: String,
    },
    date: {
        type: String,
    },
    suppliers: {
        type: String,
    },
    reason: {
        type: String,
    },
    amount: {
        type: Number,
    }
})

const s_payment_data = new mongoose.model("s_payment", s_payment);


// ========= s_payment_data end =========== //



// ========= suppliers payment =========== //

const suppliers_payment_data = new mongoose.Schema({
    invoice: {
        type: String,
    },
    date: {
        type: String,
    },
    suppliers: {
        type: String,
    },
    reason: {
        type: String,
    },
    amount: {
        type: Number,
    }
})

const suppliers_payment = new mongoose.model("suppliers_payment", suppliers_payment_data);

// ========= suppliers payment end =========== //



// ========= purchases =========== //

const purchases_data = new mongoose.Schema({
    invoice: {
        type: String,
    },
    suppliers: {
        type: String,
    },
    date: {
        type: String,
    },
    warehouse_name: {
        type: String,
    },
    product:[{
        product_name: {
            type: String
        },
        product_code: {
            type: String
        },
        quantity: {
            type: Number
        },
        standard_unit: {
            type: String
        },
        secondary_unit:{
            type: String
        },
        storage:{
            type: String
        },
        rack:{
            type: String
        },
        bay:{
           type: Number 
        },
        bin:{
            type: mongoose.Schema.Types.Mixed
        },
        type:{
            type: String
        },
        floorlevel:{
            type: Number
        },
        primary_code:{
            type: String
        },
        secondary_code:{
            type: String
        },
        maxStocks:{
            type: Number
        },
        batch_code: {
            type: String
        },
        expiry_date: {
            type: String
        },
        maxperunit:{
            type: Number
        },
        alertQTY:{
            type: Number
        },
        production_date:{
            type: String
        },
        product_cat:{
            type: String
        },
        room_name: {
            type: String
        },
        delivery_code: {
            type: String
        },
        invoice: {
            type: String
        },
        actual_qty:{
            type: String
        },
        actual_uom:{
            type: String
        },
        date_data: {
            type: String
        }
    }],
    note: {
        type: String
    },
    batch_code: {
        type: String
    },
    paid_amount: {
        type: Number,
        default: 0
    },
    due_amount: {
        type: Number,
    },
    return_data: {
        type: String,
        default: "False"
    },
    room:{
        type: String
    },
    POnumber:{
        type: String
    },
    SCRN: {
        type: String
    },
    JO_number: {
        type: String
    },
    finalize: {
        type: String,
        default: "False"
    },
    isAllowEdit: {
        type: String,
        default: "False"
    },
    roomList:[{
        room_name: {
            type: String
        }
    }]
})



const purchases = new mongoose.model("purchases", purchases_data);
// ========= purchases finished goods========= //
const purchases_data_finished = new mongoose.Schema({
    invoice: {
        type: String,
    },
    suppliers: {
        type: String,
    },
    date: {
        type: String,
    },
    warehouse_name: {
        type: String,
    },
    product:[{
        product_name: {
            type: String
        },
        product_code: {
            type: String
        },
        quantity: {
            type: Number
        },
        standard_unit: {
            type: String
        },
        secondary_unit:{
            type: String
        },
        storage:{
            type: String
        },
        rack:{
            type: String
        },
        bay:{
           type: Number 
        },
        primary_code:{
            type: String
        },
        secondary_code:{
            type: String
        },
        maxStocks:{
            type: Number
        },
        batch_code: {
            type: String
        },
        expiry_date: {
            type: String
        },
        production_date: {
            type: String
        },
        maxperunit:{
            type: Number
        },
        alertQTY:{
            type: Number
        },
        product_cat: {
            type: String
        },
        room_name: {
            type: String
        },
        invoice: {
            type: String
        },
        date_data: {
            type: String
        }
    }],
    note: {
        type: String
    },
    batch_code: {
        type: String
    },
    paid_amount: {
        type: Number,
        default: 0
    },
    due_amount: {
        type: Number,
    },
    return_data: {
        type: String,
        default: "False"
    },
    room:{
        type: String
    },
    POnumber:{
        type: String
    },
    SCRN: {
        type: String
    },
    JO_number: {
        type: String
    },
    isAllowEdit: {
        type: String,
        default: "False"
    },
})




const purchases_finished = new mongoose.model("purchases_finished", purchases_data_finished);


// ========= return purchases =========== //

const purchases_return_data = new mongoose.Schema({
    invoice: {
        type: String,
    },
    suppliers: {
        type: String,
    },
    date: {
        type: String,
    },
    warehouse_name: {
        type: String,
    },
    room: {
        type: String
    },
    to_warehouse_name: {
        type: String,
    },
    to_room: {
        type: String
    },
    return_product:[{
        product_name: {
            type: String
        },
        purchase_quantity: {
            type: Number
        },
        return_qty: {
            type: Number
        },
        stock_quantity: {
            type: Number
        },
        bay: {
            type: Number
        },
        bin: {
            type: mongoose.Schema.Types.Mixed
        },
        type: {
            type: String
        },
        floorlevel: {
            type: Number
        },
        primary_code: {
            type: String
        },
        secondary_code: {
            type: String
        },
        product_code: {
            type: String
        },
        maxProducts:{
            type: Number,
            default: 9999
        },
        unit:{
            type: String
        },
        secondary_unit: {
            type: String
        },
        expiry_date:{
            type: String
        }
    }],
    note: {
        type: String
    }
})

const purchases_return = new mongoose.model("return_purchases", purchases_return_data);

// ============== return purchases end =============== //



// ========= return purchases =========== //

const purchases_return_data_finished = new mongoose.Schema({
    invoice: {
        type: String,
    },
    suppliers: {
        type: String,
    },
    date: {
        type: String,
    },
    warehouse_name: {
        type: String,
    },
    room: {
        type: String
    },
    to_warehouse_name: {
        type: String,
    },
    to_room: {
        type: String
    },
    return_product:[{
        product_name: {
            type: String
        },
        purchase_quantity: {
            type: Number
        },
        return_qty: {
            type: Number
        },
        stock_quantity: {
            type: Number
        },
        bay: {
            type: Number
        },
        secondary_code: {
            type: String
        },
        product_code: {
            type: String
        },
        maxProducts:{
            type: Number,
            default: 9999
        },
        unit:{
            type: String
        },
        secondary_unit: {
            type: String
        },
        expiry_date:{
            type: String
        }
    }],
    note: {
        type: String
    }
})

const purchases_return_finished = new mongoose.model("return_purchases_finish", purchases_return_data_finished);

// ============== return purchases end =============== //


// ============ sales =============== //

const sales_data = new mongoose.Schema({
    invoice: {
        type: String,
    },
    customer: {
        type: String,
    },
    date: {
        type: String,
    },
    warehouse_name: {
        type: String,
    },
    room:{
        type: String
    },
    ToWarehouse:{
        type: String
    },
    Toroom:{
        type: String
    },
    sale_product:[{
        product_name: {
            type: String
        },
        quantity: {
            type: Number
        },
        stock: {
            type: Number
        },
        primary_code: {
            type: String
        },
        secondary_code: {
            type: String
        },
        product_code: {
            type: String
        },
        storage:{
            type: String
        },
        rack:{
            type: String
        },
        bay:{
           type: Number 
        },
        bin:{
            type: mongoose.Schema.Types.Mixed
        },
        type:{
            type: String
        },
        floorlevel:{
            type: Number
        }, 
        unit: {
            type : String
        },
        secondary_unit:{
            type: String
        },
        batch_code:{
            type: String
        }, 
        expiry_date: {
            type: String
        },
        maxperunit:{
            type: Number
        },
        alertQTY:{
            type: Number
        },
        production_date:{
            type: String
        },
        requested_qty:{
            type: Number
        },
        delivery_date:{
            type: String
        },
        delivery_code:{
            type: String
        },
        prod_cat:{
            type: String
        },
        room_name: {
            type: String
        },
        invoice: {
            type: String
        },
        actual_qty:{
            type: String
        },
        actual_uom:{
            type: String
        },
        id_transaction_from : {
            type: String
        },
        date_data: {
            type: String
        }
    }],
    note: {
        type: String
    },
    return_data: {
        type: String,
        default: "False"
    },
    SCRN: {
        type: String
    },
    finalize: {
        type: String,
        default: "False"
    },
    isAllowEdit: {
        type: String,
        default: "False"
    },
})
const sales = new mongoose.model("sales", sales_data);

// ============ sales end =============== //


// ============ sales finished =============== //

const sales_data_finished = new mongoose.Schema({
    invoice: {
        type: String,
    },
    customer: {
        type: String,
    },
    date: {
        type: String,
    },
    warehouse_name: {
        type: String,
    },
    room:{
        type: String
    },
    ToWarehouse:{
        type: String
    },
    Toroom:{
        type: String
    },
    sale_product:[{
        product_name: {
            type: String
        },
        quantity: {
            type: Number
        },
        stock: {
            type: Number
        },
        primary_code: {
            type: String
        },
        secondary_code: {
            type: String
        },
        product_code: {
            type: String
        },
        storage:{
            type: String
        },
        rack:{
            type: String
        },
        bay:{
           type: Number 
        },
        bin:{
            type: mongoose.Schema.Types.Mixed
        },
        type:{
            type: String
        },
        floorlevel:{
            type: Number
        }, 
        unit: {
            type : String
        },
        secondary_unit:{
            type: String
        },
        batch_code:{
            type: String
        }, 
        expiry_date: {
            type: String
        },
        production_date: {
            type: String
        },
        maxperunit:{
            type: Number
        },
        alertQTY:{
            type: Number
        },
        prod_cat:{
            type: String
        },
        room_name: {
            type: String
        },
        invoice: {
            type: String
        },
        id_transaction_from: {
            type: String
        },
        date_data: {
            type: String
        }
    }],
    note: {
        type: String
    },
    return_data: {
        type: String,
        default: "False"
    },
    SCRN: {
        type: String
    },
    finalize:{
        type: String,
        default: "False"
    },
    isAllowEdit: {
        type: String,
        default: "False"
    },
    mode_transpo: {
        type: String
    },
    name_driver: {
        type: String
    }
})


const sales_finished = new mongoose.model("sales_finished", sales_data_finished);

// ============ sales end =============== //


// ========= return sales =========== //

const sales_return_data = new mongoose.Schema({
    invoice: {
        type: String,
    },
    customer: {
        type: String,
    },
    date: {
        type: String,
    },
    warehouse_name: {
        type: String,
    },
    room:{
        type: String
    },
    ToWarehouse:{
        type: String
    },
    ToRoom:{
        type: String
    },
    return_sale:[{
        product_name: {
            type: String
        },
        sale_qty: {
            type: Number
        },
        return_qty: {
            type: Number
        },
        primary_code:{
            type: String
        },
        secondary_code:{
            type: String
        },
        product_code:{
            type: String
        },
        bay: {
            type: Number
        },
        bin: {
            type: mongoose.Schema.Types.Mixed
        },
        type:{
            type: String
        },
        floorlevel:{
            type: Number
        }

    }],
    note: {
        type: String
    }
})

const sales_return = new mongoose.model("return_sales", sales_return_data);

// ============== return sales end =============== //


// ========= return sales =========== //

const sales_return_data_finished = new mongoose.Schema({
    invoice: {
        type: String,
    },
    customer: {
        type: String,
    },
    date: {
        type: String,
    },
    warehouse_name: {
        type: String,
    },
    room:{
        type: String
    },
    warehouse_cat:{
        type: String
    },
    ToWarehouse:{
        type: String
    },
    ToRoom:{
        type: String
    },
    return_sale:[{
        product_name: {
            type: String
        },
        sale_qty: {
            type: Number
        },
        return_qty: {
            type: Number
        },
        primary_code:{
            type: String
        },
        secondary_code:{
            type: String
        },
        product_code:{
            type: String
        },
        bay:{
            type: String
        },
        production_date:{
            type: String
        },
        expiry_date:{
            type: String
        },
        batch_code:{
            type: String
        },
        maxPerUnit:{
            type: Number
        },
        maxProducts:{
            type: Number
        },
        secondary_unit:{
            type: String
        },
        unit:{
            type: String
        }

    }],
    return_sale_QA:[{
        product_name: {
            type: String
        },
        sale_qty: {
            type: Number
        },
        return_qty: {
            type: Number
        },
        primary_code:{
            type: String
        },
        secondary_code:{
            type: String
        },
        product_code:{
            type: String
        },
        production_date:{
            type: String
        },
        expiry_date:{
            type: String
        },
        batch_code:{
            type: String
        },
        maxPerUnit:{
            type: Number
        },
        maxProducts:{
            type: Number
        },
        secondary_unit:{
            type: String
        },
        unit:{
            type: String
        },
        bay:{
            type: Number,
            default: 1
        }

    }],
    note: {
        type: String
    }
})

const sales_return_finished = new mongoose.model("return_sales_finished", sales_return_data_finished);

// ============== return sales end =============== //


// ========= All Transfers =========== //

const transfers_data = new mongoose.Schema({
    date: {
        type: String,
    },
    invoice: {
        type: String,
    },
    from_warehouse: {
        type: String,
    },
    from_room:{
        type: String
    },
    to_warehouse: {
        type: String
    },
    to_room: {
        type: String
    },
    product:[{
        product_name: {
            type: String
        },
        primary_code:{
            type: String
        },
        secondary_code:{
            type: String
        },
        product_code:{
            type: String
        },
        from_quantity:{
          type: Number  
        },
        from_bay:{
            type: Number  
        },
        from_bin:{
          type: mongoose.Schema.Types.Mixed  
        },
        from_types: {
            type: String
        },
        from_floorlevel:{
            type: Number
        },
        to_quantity:{
            type: Number
        },
        to_bay:{
            type: Number
        },
        to_bin:{
            type: mongoose.Schema.Types.Mixed 
        },
        to_types: {
            type: String
        },
        to_floorlevel:{
            type: Number
        },
        maxProducts: {
            type: Number,
            default: 9999
        },
        unit:{
            type: String
        },
        secondary_unit:{
            type: String
        },
        batch_code:{
            type: String
        },
        expiry_date: {
            type: String
        },
        storage:{
            type: String
        },
        rack:{
            type: String
        },
        from_storage:{
            type: String
        },
        from_rack:{
            type: String
        },
        maxperunit: {
            type: Number
        },
        alertQTY:{
            type: Number
        },
        production_date:{
            type: String
        },
        prod_cat:{
            type: String
        },
        from_room_name:{
            type:String
        },
        to_room_name:{
            type:String
        },
        from_invoice: {
            type: String
        },
        To_invoice: {
            type: String
        },
        id_transaction_id : {
            type: String
        }
    }],
    note: {
        type: String
    },
    expiry_date:{
        type: String
    },
    finalize:{
        type: String,
        default: "False"
    },
    isAllowEdit: {
        type: String,
        default: "False"
    },
})

const transfers = new mongoose.model("transfer", transfers_data);

// ========= All Transfers end =========== //


// ========= All Transfers =========== //

const transfers_data_finished = new mongoose.Schema({
    date: {
        type: String,
    },
    invoice: {
        type: String,
    },
    from_warehouse: {
        type: String,
    },
    from_room:{
        type: String
    },
    to_warehouse: {
        type: String
    },
    to_room: {
        type: String
    },
    product:[{
        product_name: {
            type: String
        },
        primary_code:{
            type: String
        },
        secondary_code:{
            type: String
        },
        product_code:{
            type: String
        },
        from_quantity:{
          type: Number  
        },
        from_bay:{
            type: Number  
        },
        to_quantity:{
            type: Number
        },
        to_bay:{
            type: Number
        },
        maxProducts: {
            type: Number,
            default: 9999
        },
        unit:{
            type: String
        },
        secondary_unit:{
            type: String
        },
        batch_code:{
            type: String
        },
        expiry_date: {
            type: String
        },
        production_date: {
            type: String
        },
        maxProducts:{
            type: Number
        },
        maxPerUnit:{
            type: Number
        },
        alertQTY:{
            type: Number
        },
        prod_cat: {
            type: String
        },
        from_room_name:{
            type:String
        },
        to_room_name:{
            type:String
        },
        from_invoice: {
            type: String
        },
        To_invoice: {
            type: String
        },
        id_transaction:{
            type: String
        }
    }],
    note: {
        type: String
    },
    expiry_date:{
        type: String
    },
    finalize:{
        type: String,
        default: "False"
    },
    isAllowEdit: {
        type: String,
        default: "False"
    },
})

const transfers_finished = new mongoose.model("transfer_finished", transfers_data_finished);

// ========= All Transfers end =========== //


// ========= Expenses Type =========== //

const expenses = new mongoose.Schema({
    name: {
        type: String,
    }
})

const expenses_type = new mongoose.model("expenses_type", expenses);

// ========= Expenses Type end =========== //


// ========= Expenses =========== //

const expenses_data = new mongoose.Schema({
    type: {
        type: String,
    },
    date: {
        type: String,
    },
    amount: {
        type: Number,
    },
    note: {
        type: String,
    },
})

const all_expenses = new mongoose.model("expenses", expenses_data);

// ========= Expenses end =========== //


// ========= Adjustment =========== //

const adjustment_data = new mongoose.Schema({
    warehouse_name: {
        type: String
    },
    room: {
        type : String
    },
    date: {
        type: String
    },
    product:[{
        product_name:{
            type: String
        },
        product_code:{
            type: String
        },
        storage:{
            type: String
        },
        rack:{
            type: String
        },
        bay:{
            type: Number
        },
        bin:{
            type: mongoose.Schema.Types.Mixed
        },
        type:{
            type: String
        },
        floorlevel:{
            type: Number
        },
        stockBefore:{
            type: Number
        },
        types:{
            type: String
        },
        adjust_qty:{
            type : Number
        },
        new_adjust_qty:{
            type: Number
        },
        unit:{
            type: String
        },
        secondary_unit:{
            type: String
        },
        batch_code:{
            type: String
        },
        expiry_date: {
            type: String
        },
        production_date: {
            type: String
        },
        alertQTY:{
            type: Number
        },
        prod_cat:{
            type: String
        },
        room_names:{
            type: String
        },
        primary_code: {
            type: String
        },
        secondary_code: {
            type: String
        },
        invoice: {
            type: String
        },
        id_transaction_from : {
            type: String
        },
        date_data: {
            type: String
        }
    }],
    note:{
        type: String,
    },
    invoice: {
        type: String
    },
    JO_number:{
        type: String
    },
    finalize: {
        type: String,
        default: "False"
    },
    isAllowEdit: {
        type: String,
        default: "False"
    },
})

const adjustment = new mongoose.model("adjustment", adjustment_data);


// ========= Adjustment end =========== //


// ========= Adjustment =========== //

const adjustment_data_finished = new mongoose.Schema({
    warehouse_name: {
        type: String
    },
    room: {
        type : String
    },
    date: {
        type: String
    },
    product:[{
        product_name:{
            type: String
        },
        product_code:{
            type: String
        },
        bay:{
            type: Number
        },
        stockBefore:{
            type: Number
        },
        types:{
            type: String
        },
        adjust_qty:{
            type : Number
        },
        new_adjust_qty:{
            type: Number
        },
        unit:{
            type: String
        },
        secondary_unit:{
            type: String
        },
        batch_code:{
            type: String
        },
        expiry_date: {
            type: String
        },
        production_date: {
            type: String
        },
        alertQTY:{
            type: Number
        },
        prod_cat:{
            type: String
        },
        room_names:{
            type: String
        },
        maxPerUnit: {
            type: Number
        },
        invoice: {
            type: String
        },
        id_transaction:{
            type: String
        },
        date_data: {
            type: String
        }
    }],
    note:{
        type: String,
    },
    invoice: {
        type: String
    },
    JO_number:{
        type: String
    },
    finalize:{
        type: String,
        default: "False"
    },
    isAllowEdit: {
        type: String,
        default: "False"
    },
})

const adjustment_finished = new mongoose.model("adjustment_finished", adjustment_data_finished);


// ========= Adjustment end =========== //


// ========= master_settings =========== //

const master_settings_data = new mongoose.Schema({
    site_title: {
        type: String,
    },
    image: {
        type: String,
    },
    currency: {
        type: String,
        default: "$"
    },
    currency_placement: {
        type: String,
        default: 2
    },
    timezone: {
        type: String,
    },
    language: {
        type: String,
        default: "English"
    },
})

const master_shop = new mongoose.model("master_shop", master_settings_data);

// ========= master_settings end =========== //


// ========= master_settings =========== //

const supervisor_settings_data = new mongoose.Schema({
    RMSName: {
        type: String,
    },
    RMSEmail: {
        type: String,
    },
    RMSnumber: {
        type: String,
    },
    FGSName: {
        type: String,
    },
    FGSEmail: {
        type: String,
    },
    FGSnumber: {
        type: String,
    },
})

const supervisor_settings = new mongoose.model("supervisor_setup", supervisor_settings_data);

// ========= master_settings end =========== //



// ========= email_settings =========== //

const email_settings_data = new mongoose.Schema({
    host: {
        type: String,
    },
    port: {
        type: String,
    },
    email: {
        type: String,
    },
    password: {
        type: String,
    },
})

const email_settings = new mongoose.model("email_settings", email_settings_data);

// ========= email_settings end =========== //



module.exports = { sing_up, profile, categories, brands, units, product, warehouse, staff, customer,
                    suppliers, suppliers_payment, s_payment_data, purchases, purchases_return, sales, sales_return,
                    customer_payment, c_payment_data, transfers, expenses_type, all_expenses, adjustment, master_shop, email_settings, purchases_finished, sales_finished, adjustment_finished, transfers_finished, purchases_return_finished, sales_return_finished, supervisor_settings };