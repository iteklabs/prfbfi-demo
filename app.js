require('dotenv').config();
const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const path = require("path");
const ejs = require('ejs');
const port = process.env.PORT || 5000;
const mongoose = require('mongoose');
const flash = require('connect-flash');
var session = require('express-session');
const mongoDbsession = require('connect-mongodb-session')(session);
const cookieParser = require('cookie-parser');

let databaseString, sessionString, sessionCollection;

if(process.env.NODE_ENV == "production"){
   databaseString = process.env.DATABASE_STRING
   sessionString = process.env.SESSION_STRING
   sessionCollection = process.env.SESSION_COLLECTION

}else if(process.env.NODE_ENV == "dev"){
   databaseString = process.env.DATABASE_STRING_TEST
   sessionString = process.env.SESSION_STRING_TEST
   sessionCollection = process.env.SESSION_COLLECTION_TEST
}

mongoose.connect(databaseString,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
).then(() => {
  console.log("db connected !!!!!");
}).catch((error) => {
  console.log(error);
});

//****setup for flash message */
const store = new mongoDbsession({
  uri: sessionString,
  collection: sessionCollection,
});

app.use(session({
  secret: 'this is my secretkey',
  resave: false,
  cookie: { maxAge: 1000 * 60 },
  saveUninitialized: true,
  store: store,
}));

app.use(flash());



app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json());

app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));


// ========== required router =========== //

const index_router = require("./routers/index");
const products_router = require("./routers/products");
const warehouse_router = require("./routers/warehouse");
const staff_router = require("./routers/staff");
const customer_router = require("./routers/customer");
const supplier_router = require("./routers/supplier");
const all_purchases_router = require("./routers/all_purchases");
const purchases_return_router = require("./routers/purchases_return");
const all_sales_router = require("./routers/all_sales");
const sales_return_router = require("./routers/sales_return");
const adjustment_router = require("./routers/adjustment");
const transfer_router = require("./routers/transfer");
const all_expenses_router = require("./routers/expenses");
const stock_report_router = require("./routers/stock_report");
const payment_report = require("./routers/payment_report");
const all_report = require("./routers/report");
const master_shop = require("./routers/master_settings");
const warehousemap_incoming = require("./routers/warehousemap_income");
const warehousemap_outgoing = require("./routers/warehousemap_outgoing");
const transaction_reports_finished = require("./routers/transaction_reports_finished")

const profile_router = require("./routers/profile");

const sing_up_router = require("./routers/sing_up");
const login_router = require("./routers/login");




// Finished Goods
const all_purchases_router_finished = require("./routers/all_purchases_finished");
const all_sales_router_finished = require("./routers/all_sales_finsished");
const adjustment_router_finished = require("./routers/adjustment_finished");
const transfer_router_finished = require("./routers/transfer_finished");
const purchases_return_finished = require("./routers/purchase_return_finished");
const sales_return_finished = require("./routers/sales_return_finished")
const pdfOutReport = require("./routers/pickinglist");
const edit_approver_router = require("./routers/edit_approval");


const passwordChanger = require("./routers/password_reset");


const Tester = require("./routers/test/removeNegative");




// ========== define router =========== //
app.use("/TEST", Tester);
app.use("/forgotPassword", passwordChanger);
app.use("/edit_approval", edit_approver_router);
app.use("/", index_router);
app.use("/products", products_router);
app.use("/warehouse", warehouse_router);
app.use("/staff", staff_router);
app.use("/customer", customer_router);
app.use("/supplier", supplier_router);
app.use("/all_purchases", all_purchases_router);
app.use("/purchases_return", purchases_return_router);
app.use("/all_sales", all_sales_router);
app.use("/sales_return", sales_return_router);
app.use("/adjustment", adjustment_router);
app.use("/transfer", transfer_router);
app.use("/all_expenses", all_expenses_router);
app.use("/stock_report", stock_report_router);
app.use("/payment_report", payment_report);
app.use("/report", all_report);
app.use("/master_shop", master_shop);
app.use("/warehousemap_Income", warehousemap_incoming);
app.use("/warehousemap_Outcome", warehousemap_outgoing);

// for finised Goods routes
app.use("/all_purchases_finished", all_purchases_router_finished);
app.use("/all_sales_finished", all_sales_router_finished);
app.use("/purchases_return_finished", purchases_return_finished);
app.use("/sales_return_finished", sales_return_finished);
app.use("/picking_list", pdfOutReport);

app.use("/adjustment_finished", adjustment_router_finished);
app.use("/transfer_finished", transfer_router_finished);


app.use("/transaction_reports", transaction_reports_finished);

app.use("/profile", profile_router);
app.use("/", sing_up_router);
app.use("/", login_router);



//Mobile
const mobile_login = require("./mobile_routers/login");
const mobile_rw_inc = require("./mobile_routers/rw_inc");
const mobile_warehouse = require("./mobile_routers/warehouse");
app.use("/mobile_login", mobile_login);
app.use("/mobile_rw_inc", mobile_rw_inc);
app.use("/mobile_warehouse", mobile_warehouse);


app.listen(port, () => {
  console.log(`server running on port ${port}`);
});