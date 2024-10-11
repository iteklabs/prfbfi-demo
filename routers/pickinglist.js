const express = require("express");
const res = require("express/lib/response");
const app = express();
const router = express.Router();
const multer = require('multer');
const { profile, master_shop, categories, brands, units, product, purchases, warehouse, sales_finished, sales, transfers_finished, adjustment_finished, purchases_finished, sales_return_finished, adjustment, transfers } = require("../models/all_models");
const auth = require("../middleware/auth");
const users = require("../public/language/languages.json");
const excelJS = require("exceljs");
const xlsx = require('xlsx');
const PDFDocument = require('pdfkit-table');
const fs = require('fs');
const blobStream  = require('blob-stream');
const JsBarcode = require('jsbarcode');
const { Canvas } = require("canvas");


// router.get("/PDF/:id", auth, async (req, res) => {
//     try {
//         const {username, email, role} = req.user
//         const role_data = req.user

//         const profile_data = await profile.findOne({email : role_data.email})

//         const master = await master_shop.find()
//         console.log("master" , master);

//         const _id = req.params.id;
//         const user_id = await sales_finished.findById(_id)



//         // Create a new PDF document
//         const doc = new PDFDocument();

//         // Create a write stream to save the PDF to a file
//         const writeStream = fs.createWriteStream('sample.pdf');

//         // Pipe the PDF content to the write stream
//         doc.pipe(writeStream);

//         // Add content to the PDF
//         doc.fontSize(20).text('Sample PDF created using pdfkit', 100, 100);
//         doc.fontSize(14).text('This is a basic example of rendering a PDF in Node.js using pdfkit.', 100, 150);

//         // Finalize the PDF
//         doc.end();

//         // Once the PDF is created, you can start a simple web server to serve the PDF file
//         const http = require('http');

//         const server = http.createServer((req, res) => {
//         res.setHeader('Content-Type', 'application/pdf');
//         const stream = fs.createReadStream('sample.pdf');
//         stream.pipe(res);
//         });

        

//     } catch (error) {
//         console.log(error);
//     }
// })



router.get("/PDF/:id", auth, async (req, res) => {
    try {
        const { username, email, role } = req.user;
        const role_data = req.user;

        const profile_data = await profile.findOne({ email: role_data.email });

        const master = await master_shop.find();

        const _id = req.params.id;
        const user_id = await sales_finished.findById(_id);
        var Title;
        Title = "PICKING LIST";
        if(user_id.finalize == "True"){
         Title = "DELIVERY RECEIPT";

        }
        const doc = new PDFDocument({ margin: 30, size: 'A4', bufferPages: true });


        res.setHeader('Content-disposition', 'inline; filename="'+user_id.invoice+'.pdf"');
        res.setHeader('Content-type', 'application/pdf');
        var x=20;
        var y=60;

        doc.pipe(res);


        doc.image('./public/upload/'+master[0].image, 20, 0, {fit: [100, 100]})

        doc
        .fontSize(20)
        .text('DELI MONDO FOOD SPECIALTIES INC.', x, y);
        doc
        .fontSize(10)
        .text('BRGY.HALAYHAY, TANZA CAVITE', x, y+=15);

        doc
        .fontSize(15)
        .text(Title, x, y+=50);

        doc
        .fontSize(10)
        .text("(OUTGOING)", x, y+=20);

        doc
        .fontSize(9)
        .text('Warehouse ', x, y+=40);

        doc
        .fontSize(9)
        .text(' : '+user_id.warehouse_name, x+63, y);
        
        doc
        .fontSize(9)
        .text('Customer : ' + user_id.customer, x+380, y, { underline: true });
        // doc
        // .fontSize(9)
        // .text('Picked By ', x, y+=11);

        // doc
        // .fontSize(9)
        // .text(' : ', x+63, y);

        doc
        .fontSize(9)
        .text('Date ', x, y+=11);

        doc
        .fontSize(9)
        .text(' : '+user_id.date, x+63, y);

        doc
        .fontSize(9)
        .text('Control Number ', x, y+=11);

        doc
        .fontSize(9)
        .text(' : '+user_id.invoice, x+63, y);


        const table = {
            headers: [
              { label: "Item Code", property: 'itemcode', width: 60, renderer: null },
              { label: "Item Description", property: 'itemdescription', width: 165, renderer: null },
              { label: "Quantity", property: 'qty', width: 60, renderer: null },
              { label: "UOM", property: 'unit', width: 60, renderer: null },
              // { label: "Quantity", property: 'unitConversion', width: 60, renderer: null },
              { label: "Production Date", property: 'proddate', width: 80, renderer: null },
              { label: "Batch No", property: 'batchno', width: 63, renderer: null },
              { label: "Bin Location", property: 'binloc', width: 63, renderer: null },
            ],
            datas: [],
          };
          var totalQTY = 0; 
          let warecode = "";
          var totalPerUnit =0;
          if(user_id.warehouse_name == "DRY GOODS"){
            warecode = "DG";
          }else{
            warecode = "FG";
          }
          var rowCheck = 0;
          user_id.sale_product.forEach((ProductDetl) => {
            console.log(ProductDetl)
            let dataUnit = '';
            
            const qtydata = ProductDetl.quantity;
            for (let index = 1; index <= qtydata; index++) {
              
              if(qtydata == index){
                dataUnit += ProductDetl.maxperunit;
              }else{
                dataUnit += ProductDetl.maxperunit+',';
              }
              
              
              totalPerUnit +=ProductDetl.maxperunit;
            }
            dataUnit += ' / ' + ProductDetl.secondary_unit ;
            const rowData = {

              
              itemcode: ProductDetl.product_code,
              itemdescription: ProductDetl.product_name,
              qty: ProductDetl.quantity,
              unit: ProductDetl.unit,
              // unitConversion:dataUnit,
              proddate: ProductDetl.production_date,
              batchno: ProductDetl.batch_code,
              binloc: warecode+ProductDetl.bay,
              
            };
            totalQTY += ProductDetl.quantity 
            rowCheck +=1;
            table.datas.push(rowData);
          });

                    

        doc.table(table, {
            x: 20,
            y: 300,
            prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
            prepareRow: (row, indexColumn, indexRow, rectRow) => doc.font("Helvetica").fontSize(8),
            
           
          });
          var lastTableY = doc.y
          var lastTableX = doc.x
 
         
        doc
        .fontSize(10)
        .text("*********************** NOTHING TO FOLLOWS ***********************", lastTableX+125, lastTableY);
        console.log("x: " + lastTableX + " y: " + lastTableY + " row: " + rowCheck);
        const lessY = lastTableX*rowCheck;
        doc
        .fontSize(10)
        .text("TOTAL QTY: ", lastTableX, lastTableY+=(350-lessY));

        doc
        .fontSize(10)
        .text(totalQTY, lastTableX+220, lastTableY,{ underline: true});
      
        doc
        .fontSize(10)
        .text('Picked By   : ', lastTableX, lastTableY+=25);
  
  
        doc
        .fontSize(10)
        .text(" ".repeat(60), lastTableX+62, lastTableY,{ underline: true});

        doc
        .fontSize(10)
        .text("Checked By: ", lastTableX, lastTableY+=50);

        // doc
        // .fontSize(10)
        // .text("ARMAN CRUZ", lastTableX+60, lastTableY,{ underline: true});


        doc
        .fontSize(10)
        .text("          ARMAN CRUZ                          ", lastTableX+60, lastTableY,{ underline: true});
        
        doc
        .fontSize(10)
        .text("Finished Good Warehouse Supervisor", lastTableX+60, lastTableY+12);
        // const pageNumber = doc.bufferedPageRange().start + 1; 
        let pages = doc.bufferedPageRange();

        // let pages = doc.bufferedPageRange();
        for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);

        //Footer: Add page number
        let oldBottomMargin = doc.page.margins.bottom;
        doc.page.margins.bottom = 0 //Dumb: Have to remove bottom margin in order to write into it
        doc
            .text(
            `Page: ${i + 1} of ${pages.count}`,
            0,
            doc.page.height - (oldBottomMargin/2), // Centered vertically in bottom margin
            { align: 'center' }
            );
        doc.page.margins.bottom = oldBottomMargin; // ReProtect bottom margin
        }
      
        
        const lasttextY = doc.y
        const lasttextX = doc.x
        // doc
        // .fontSize(10)
        // .text("X: " + lasttextX + " Y : " + lasttextY, lasttextX, lasttextY);

        // Finalize the PDF
        doc.end();
    } catch (error) {
        console.log(error);
        res.status(500).send("An error occurred while generating the PDF.");
    }
});


router.get("/PDF_transfer/:id", auth, async (req, res) => {
  try {
      const { username, email, role } = req.user;
      const role_data = req.user;

      const profile_data = await profile.findOne({ email: role_data.email });

      const master = await master_shop.find();

      const _id = req.params.id;
      const user_id = await transfers_finished.findById(_id);
      var Title;
      var SubTitle;
      Title = "Picking List";
      SubTitle = "(STOCKS TRANSFER)";
      if(user_id.finalize == "True"){
       Title = "STOCKS TRANSFER";
       SubTitle ="";

      }
      const doc = new PDFDocument({ margin: 30, size: 'A4', bufferPages: true });


      res.setHeader('Content-disposition', 'inline; filename="OUT-'+ _id+'.pdf"');
      res.setHeader('Content-type', 'application/pdf');
      var x=20;
      var y=60;

      doc.pipe(res);


      doc.image('./public/upload/'+master[0].image, 20, 0, {fit: [100, 100]})

      doc
      .fontSize(20)
      .text('DELI MONDO FOOD SPECIALTIES INC.', x, y);
      doc
      .fontSize(10)
      .text('BRGY.HALAYHAY, TANZA CAVITE', x, y+=15);

      doc
      .fontSize(15)
      .text(Title, x, y+=50);

      doc
      .fontSize(10)
      .text(SubTitle, x, y+=20);

      doc
      .fontSize(9)
      .text('From Warehouse ', x, y+=40);

      doc
      .fontSize(9)
      .text('   : '+user_id.from_warehouse, x+63, y);

      doc
      .fontSize(9)
      .text('To Warehouse ', x, y+=15);

      doc
      .fontSize(9)
      .text('   : '+user_id.to_warehouse, x+63, y);
      
      // doc
      // .fontSize(9)
      // .text('Customer : ' + user_id.customer, 400, 210, { underline: true });
      // doc
      // .fontSize(9)
      // .text('Pick By : ', x, y+=11);

      doc
      .fontSize(9)
      .text('Date ', x, y+=11);


      doc
      .fontSize(9)
      .text('   : '+user_id.date, x+63, y);

      doc
      .fontSize(9)
      .text('Control Number ', x, y+=11);

      doc
      .fontSize(9)
      .text('   : '+user_id.invoice, x+63, y);

      const table1 = {
        headers: [
          { label: "", property: 'itemcode', width: 443, renderer: null, textCenter: true },
          { label: "  FROM", property: 'itemcode', width: 63, renderer: null, textCenter: true },
          { label: "  TO", property: 'itemdescription', width: 63, renderer: null, textCenter: true  },
         
        ],
        datas: [],
      };

      doc.table(table1, {
        x: 5,
        y: 263,
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
        prepareRow: (row, indexColumn, indexRow, rectRow) => doc.font("Helvetica").fontSize(8),
        
        
       
      });


      const table = {
          headers: [
            { label: "Item Code", property: 'itemcode', width: 60, renderer: null },
            { label: "Item Description", property: 'itemdescription', width: 150, renderer: null },
            { label: "Quantity", property: 'qty', width: 40, renderer: null },
            { label: "UOM", property: 'unit', width: 55, renderer: null },
            { label: "Production Date", property: 'proddate', width: 75, renderer: null },
            { label: "Batch No", property: 'batchno', width: 63, renderer: null },
            { label: "Bin Location", property: 'binlocFrom', width: 63, renderer: null },
            { label: "Bin Location", property: 'binloc', width: 63, renderer: null },
          ],
          datas: [],
        };
        var totalQTY = 0; 
        let warecode = "";
        var totalPerUnit =0;
        if(user_id.from_warehouse == "DRY GOODS"){
          warecode = "DG";
        }else if(user_id.from_warehouse == "FROZEN GOODS"){
          warecode = "FG";
        }
        user_id.product.forEach((ProductDetl) => {
          var prod_cat = ProductDetl.prod_cat;
          var Unit, TotalQTYS ;
          Unit = ProductDetl.unit;
          TotalQTYS = ProductDetl.to_quantity;
          if(prod_cat == "S"){
            
            Unit = ProductDetl.secondary_unit;
            TotalQTYS = ProductDetl.to_quantity * ProductDetl.maxPerUnit
          }
          const rowData = {

            
            itemcode: ProductDetl.product_code,
            itemdescription: ProductDetl.product_name,
            qty: TotalQTYS,
            unit: Unit,
            proddate: ProductDetl.production_date,
            batchno: ProductDetl.batch_code,
            binloc: warecode+ProductDetl.to_bay,
            qtyFrom: ProductDetl.from_quantity,
            binlocFrom: warecode+ProductDetl.from_bay,
          };
          totalQTY += TotalQTYS
          
          table.datas.push(rowData);
        });

                  

      doc.table(table, {
          x: 5,
          y: 280,
          prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
          prepareRow: (row, indexColumn, indexRow, rectRow) => doc.font("Helvetica").fontSize(8),
          
         
        });
        var lastTableY = doc.y
        var lastTableX = doc.x

        doc
        .fontSize(10)
        .text("*********************** NOTHING TO FOLLOWS ***********************", lastTableX+125, lastTableY);

      doc
      .fontSize(10)
      .text("TOTAL QTY: ", lastTableX, lastTableY+=350);

      doc
      .fontSize(10)
      .text(totalQTY, lastTableX+215, lastTableY,{ underline: true});

      doc
      .fontSize(10)
      .text('Picked By   : ', lastTableX, lastTableY+=25);


      doc
      .fontSize(10)
      .text(" ".repeat(60), lastTableX+62, lastTableY,{ underline: true});

      


      doc
      .fontSize(10)
      .text("Checked By: ", lastTableX, lastTableY+=50);

      doc
        .fontSize(10)
        .text("          ARMAN CRUZ                          ", lastTableX+60, lastTableY,{ underline: true});
        
        doc
        .fontSize(10)
        .text("Finished Good Warehouse Supervisor", lastTableX+60, lastTableY+12);

      // doc
      // .fontSize(10)
      // .text("ARMAN CRUZ", lastTableX+60, lastTableY+30,{ underline: true});
      // const pageNumber = doc.bufferedPageRange().start + 1; 
      let pages = doc.bufferedPageRange();

      // let pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);

      //Footer: Add page number
      let oldBottomMargin = doc.page.margins.bottom;
      doc.page.margins.bottom = 0 //Dumb: Have to remove bottom margin in order to write into it
      doc
          .text(
          `Page: ${i + 1} of ${pages.count}`,
          0,
          doc.page.height - (oldBottomMargin/2), // Centered vertically in bottom margin
          { align: 'center' }
          );
      doc.page.margins.bottom = oldBottomMargin; // ReProtect bottom margin
      }
    
      
      const lasttextY = doc.y
      const lasttextX = doc.x
      // doc
      // .fontSize(10)
      // .text("X: " + lasttextX + " Y : " + lasttextY, lasttextX, lasttextY);

      // Finalize the PDF
      doc.end();
  } catch (error) {
      console.log(error);
      res.status(500).send("An error occurred while generating the PDF.");
  }
});


router.get("/PDF_adjustment/:id", auth, async (req, res) => {
  try {
      const { username, email, role } = req.user;
      const role_data = req.user;

      const profile_data = await profile.findOne({ email: role_data.email });

      const master = await master_shop.find();

      const _id = req.params.id;
      const user_id = await adjustment_finished.findById(_id);
      var Title;
      var SubTitle;
      Title = "PICKING LIST";
      SubTitle = "(INVENTORY ADJUSTMENT)";
      if(user_id.finalize == "True"){
        Title = "INVENTORY ADJUSTMENT";
        SubTitle = "";

      }
      const doc = new PDFDocument({ margin: 30, size: 'A4', bufferPages: true });


      res.setHeader('Content-disposition', 'inline; filename="OUT-'+ _id+'.pdf"');
      res.setHeader('Content-type', 'application/pdf');
      var x=20;
      var y=60;

      doc.pipe(res);


      doc.image('./public/upload/'+master[0].image, 20, 0, {fit: [100, 100]})

      doc
      .fontSize(20)
      .text('DELI MONDO FOOD SPECIALTIES INC.', x, y);
      doc
      .fontSize(10)
      .text('BRGY.HALAYHAY, TANZA CAVITE', x, y+=15);

      doc
      .fontSize(15)
      .text(Title, x, y+=50);

      doc
      .fontSize(10)
      .text(SubTitle, x, y+=20);

      doc
      .fontSize(9)
      .text('Warehouse ', x, y+=40);

      doc
        .fontSize(9)
        .text(' : '+user_id.warehouse_name, x+63, y);
      
      // doc
      // .fontSize(9)
      // .text('Customer : ' + user_id.customer, 400, 210, { underline: true });
      // doc
      // .fontSize(9)
      // .text('Pick By : ', x, y+=11);

      doc
      .fontSize(9)
      .text('Date ', x, y+=11);

      doc
        .fontSize(9)
        .text(' : '+user_id.date, x+63, y);

      doc
      .fontSize(9)
      .text('Control Number ', x, y+=11);

      doc
      .fontSize(9)
      .text(' : '+user_id.invoice, x+63, y);


      const table = {
          headers: [
            { label: "Item Code", property: 'itemcode', width: 60, renderer: null },
            { label: "Item Description", property: 'itemdescription', width: 150, renderer: null },
            { label: "Quantity", property: 'qty', width: 60, renderer: null },
            { label: "UOM", property: 'unit', width: 60, renderer: null },
            // { label: "Quantity", property: 'unitConversion', width: 60, renderer: null },
            { label: "Production Date", property: 'proddate', width: 80, renderer: null },
            { label: "Batch No", property: 'batchno', width: 63, renderer: null },
            { label: "Bin Location", property: 'binloc', width: 63, renderer: null },
          ],
          datas: [],
        };
        var totalQTY = 0; 
        let warecode = "";
        var totalPerUnit =0;
        if(user_id.warehouse_name == "DRY GOODS"){
          warecode = "DG";
        }else{
          warecode = "FG";
        }
        user_id.product.forEach((ProductDetl) => {
       
        console.log(ProductDetl)
            
            var prod_cat = ProductDetl.prod_cat;
            var Unit, TotalQTYS ;
            Unit = ProductDetl.unit;
            TotalQTYS = ProductDetl.adjust_qty;
            if(prod_cat == "S"){
              
              Unit = ProductDetl.secondary_unit;
              TotalQTYS = ProductDetl.adjust_qty * ProductDetl.maxPerUnit
            }
          const rowData = {

            
            itemcode: ProductDetl.product_code,
            itemdescription: ProductDetl.product_name,
            qty: TotalQTYS,
            unit: Unit,
            // unitConversion:dataUnit,
            proddate: ProductDetl.production_date,
            batchno: ProductDetl.batch_code,
            binloc: warecode+ProductDetl.bay,
          };
          totalQTY += TotalQTYS
          
          table.datas.push(rowData);
        });

                  

      doc.table(table, {
          x: 20,
          y: 280,
          prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
          prepareRow: (row, indexColumn, indexRow, rectRow) => doc.font("Helvetica").fontSize(8),
          
         
        });
        var lastTableY = doc.y
        var lastTableX = doc.x


        doc
        .fontSize(10)
        .text("*********************** NOTHING TO FOLLOWS ***********************", lastTableX+125, lastTableY);

      doc
      .fontSize(10)
      .text("TOTAL QTY : ", lastTableX, lastTableY+=350);

      doc
      .fontSize(10)
      .text(totalQTY, lastTableX+200, lastTableY);

      // doc
      // .fontSize(10)
      // .text(totalPerUnit, lastTableX+280, lastTableY,{ underline: true});

      doc
      .fontSize(10)
      .text('Picked By   : ', lastTableX, lastTableY+=25);


      doc
      .fontSize(10)
      .text(" ".repeat(60), lastTableX+62, lastTableY,{ underline: true});


      doc
      .fontSize(10)
      .text("Checked By ", lastTableX, lastTableY+=50);


      doc
      .fontSize(10)
      .text(" : ", lastTableX + 55, lastTableY);

      doc
      .fontSize(10)
      .text("          ARMAN CRUZ                          ", lastTableX+60, lastTableY,{ underline: true});
        
        doc
        .fontSize(10)
        .text("Finished Good Warehouse Supervisor", lastTableX+60, lastTableY+12);

      // doc
      // .fontSize(10)
      // .text("ARMAN CRUZ", lastTableX+60, lastTableY+30,{ underline: true});
      // const pageNumber = doc.bufferedPageRange().start + 1; 
      let pages = doc.bufferedPageRange();

      // let pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);

      //Footer: Add page number
      let oldBottomMargin = doc.page.margins.bottom;
      doc.page.margins.bottom = 0 //Dumb: Have to remove bottom margin in order to write into it
      doc
          .text(
          `Page: ${i + 1} of ${pages.count}`,
          0,
          doc.page.height - (oldBottomMargin/2), // Centered vertically in bottom margin
          { align: 'center' }
          );
      doc.page.margins.bottom = oldBottomMargin; // ReProtect bottom margin
      }
    
      
      const lasttextY = doc.y
      const lasttextX = doc.x
      // doc
      // .fontSize(10)
      // .text("X: " + lasttextX + " Y : " + lasttextY, lasttextX, lasttextY);

      // Finalize the PDF
      doc.end();
  } catch (error) {
      console.log(error);
      res.status(500).send("An error occurred while generating the PDF.");
  }
});

router.get("/pdf_puchases_fin/:id", auth, async (req, res) => {
  try {
      const { username, email, role } = req.user;
      const role_data = req.user;

      const profile_data = await profile.findOne({ email: role_data.email });

      const master = await master_shop.find();

      const _id = req.params.id;
      const user_id = await purchases_finished.findById(_id);

      const doc = new PDFDocument({ margin: 30, size: 'A4', bufferPages: true });


      res.setHeader('Content-disposition', 'inline; filename="OUT-'+ _id+'.pdf"');
      res.setHeader('Content-type', 'application/pdf');
      var x=20;
      var y=60;

      doc.pipe(res);


      doc.image('./public/upload/'+master[0].image, 20, 0, {fit: [100, 100]})

      doc
      .fontSize(20)
      .text('DELI MONDO FOOD SPECIALTIES INC.', x, y);
      doc
      .fontSize(10)
      .text('BRGY.HALAYHAY, TANZA CAVITE', x, y+=15);

      doc
      .fontSize(15)
      .text('FINISHED GOODS TRANSFER SLIP', x, y+=50);

      doc
      .fontSize(10)
      .text("(INCOMING)", x, y+=20);

      doc
      .fontSize(9)
      .text('Warehouse ', x, y+=40);

      doc
      .fontSize(9)
      .text(' : ' + user_id.warehouse_name, x+63, y);
      
      doc
      .fontSize(9)
      .text('FTGS Number : ' + user_id.POnumber, x+380, y);
      

      doc
      .fontSize(9)
      .text('Date ', x, y+=11);

      doc
      .fontSize(9)
      .text(' : ' + user_id.date, x+63, y);

      doc
      .fontSize(9)
      .text('Control Number ', x, y+=11);

      doc
      .fontSize(9)
      .text(' : ' + user_id.invoice, x+63, y);


      const table = {
          headers: [
            { label: "Item Code", property: 'itemcode', width: 60, renderer: null },
            { label: "Item Description", property: 'itemdescription', width: 200, renderer: null },
            { label: "Quantity", property: 'qty', width: 60, renderer: null },
            { label: "UOM", property: 'unit', width: 60, renderer: null },
            // { label: "Quantity", property: 'unitConversion', width: 60, renderer: null },
            { label: "Expiration Date", property: 'expdate', width: 80, renderer: null },
            { label: "Batch No", property: 'batchno', width: 63, renderer: null },
            { label: "Bin Location", property: 'binloc', width: 63, renderer: null },
          ],
          datas: [],
        };
        var totalQTY = 0; 
        let warecode = "";

        if(user_id.warehouse_name == "DRY GOODS"){
          warecode = "DG";
        }else{
          warecode = "FG";
        }
   
        user_id.product.forEach((ProductDetl) => {

          let dataUnit = '';
          var totalPerUnit =  0;
          // const qtydata = ProductDetl.quantity;
            // for (let index = 1; index <= qtydata; index++) {
              
            //   if(qtydata == index){
            //     dataUnit += ProductDetl.maxperunit;
            //   }else{
            //     dataUnit += ProductDetl.maxperunit+',';
            //   }
              
              
            //   totalPerUnit +=ProductDetl.maxperunit;
            // }
            // dataUnit += ' / ' + ProductDetl.secondary_unit ;
          
          const rowData = {
            itemcode: ProductDetl.product_code,
            itemdescription: ProductDetl.product_name,
            qty: ProductDetl.quantity,
            unit: ProductDetl.standard_unit,
            // unitConversion:dataUnit,
            expdate: ProductDetl.expiry_date,
            batchno: ProductDetl.batch_code,
            // binloc: ProductDetl.storage+ProductDetl.rack+ProductDetl.bay+ProductDetl.bin+ProductDetl.type[0]+ProductDetl.floorlevel,
            binloc: warecode+ProductDetl.bay,
          };
          totalQTY += ProductDetl.quantity
          table.datas.push(rowData);
        });

                  

      doc.table(table, {
          x: 20,
          y: 280,
          prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
          prepareRow: (row, indexColumn, indexRow, rectRow) => doc.font("Helvetica").fontSize(8),
          
         
        });
        var lastTableY = doc.y
        var lastTableX = doc.x

        doc
        .fontSize(10)
        .text("*********************** NOTHING TO FOLLOWS ***********************", lastTableX+125, lastTableY);

      doc
      .fontSize(10)
      .text("TOTAL QTY: ", lastTableX, lastTableY+=350);

      doc
      .fontSize(10)
      .text(totalQTY, lastTableX+250, lastTableY);

      doc
      .fontSize(10)
      .text('Picked By    : ', lastTableX, lastTableY+=25);

      doc
      .fontSize(10)
      .text('                                              ', lastTableX+55, lastTableY,{ underline: true});


      doc
      .fontSize(10)
      .text("Check By    : ", lastTableX, lastTableY+50);

      doc
      .fontSize(10)
      .text("          ARMAN CRUZ                          ", lastTableX+50, lastTableY+50,{ underline: true});
      
      doc
      .fontSize(10)
      .text("Finished Good Warehouse Supervisor", lastTableX+50, lastTableY+60);
      // const pageNumber = doc.bufferedPageRange().start + 1; 
      let pages = doc.bufferedPageRange();

      // let pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);

      //Footer: Add page number
      let oldBottomMargin = doc.page.margins.bottom;
      doc.page.margins.bottom = 0 //Dumb: Have to remove bottom margin in order to write into it
      doc
          .text(
          `Page: ${i + 1} of ${pages.count}`,
          0,
          doc.page.height - (oldBottomMargin/2), // Centered vertically in bottom margin
          { align: 'center' }
          );
      doc.page.margins.bottom = oldBottomMargin; // ReProtect bottom margin
      }
    
      
      const lasttextY = doc.y
      const lasttextX = doc.x
      // doc
      // .fontSize(10)
      // .text("X: " + lasttextX + " Y : " + lasttextY, lasttextX, lasttextY);

      // Finalize the PDF
      doc.end();
  } catch (error) {
      console.log(error);
      res.status(500).send("An error occurred while generating the PDF.");
  }
}); 


router.get("/pdf_sales_return_fin/:id", auth, async (req, res) => {
  try {
      const { username, email, role } = req.user;
      const role_data = req.user;

      const profile_data = await profile.findOne({ email: role_data.email });

      const master = await master_shop.find();

      const _id = req.params.id;
      const user_id = await sales_return_finished.findById(_id);

      const doc = new PDFDocument({ margin: 30, size: 'A4', bufferPages: true });


      res.setHeader('Content-disposition', 'inline; filename="OUT-'+ _id+'.pdf"');
      res.setHeader('Content-type', 'application/pdf');
      var x=20;
      var y=100;

      doc.pipe(res);


      doc.image('./public/upload/'+master[0].image, 20, 0, {fit: [100, 100]})

      doc
      .fontSize(20)
      .text('DELI MONDO FOOD SPECIALTIES INC.', x, y);
      doc
      .fontSize(10)
      .text('BRGY.HALAYHAY, TANZA CAVITE', x, y+=15);

      doc
      .fontSize(15)
      .text('PICKING LIST', x, y+=50);

      doc
      .fontSize(10)
      .text("(RETURN)", x, y+=30);

      doc
      .fontSize(9)
      .text('Warehouse : ' + user_id.ToWarehouse, x, y+=40);
      
      doc
      .fontSize(9)
      .text('Customer : ' + user_id.customer, 400, 210, { underline: true });
      doc
      .fontSize(9)
      .text('Pick By : ', x, y+=11);

      doc
      .fontSize(9)
      .text('Date : ' + user_id.date, x, y+=11);

      doc
      .fontSize(9)
      .text('Control Number : ' + user_id.invoice, x, y+=11);


     

        
        var table = '';
        var rowData ='';
        var totalQTY = 0; 
        var warcode;
        console.log(user_id.warehouse_cat)
        if(user_id.warehouse_cat == "GS"){
          
          if(user_id.warehouse_name == "DRY GOODS"){
            warecode = "DG";
          }else{
            warecode = "FG";
          }


          table = {
            headers: [
              { label: "Item Code", property: 'itemcode', width: 60, renderer: null },
              { label: "Item Description", property: 'itemdescription', width: 200, renderer: null },
              { label: "Quantity", property: 'qty', width: 60, renderer: null },
              { label: "UOM", property: 'unit', width: 60, renderer: null },
              // { label: "Quantity", property: 'unitConversion', width: 60, renderer: null },
              { label: "Expiration Date", property: 'expdate', width: 80, renderer: null },
              { label: "Batch No", property: 'batchno', width: 63, renderer: null },
              { label: "Bin Location", property: 'binloc', width: 63, renderer: null },
            ],
            datas: [],
          };
          
          // let warecode = "";

          user_id.return_sale.forEach((ProductDetl) => {

            let dataUnit = '';
            var totalPerUnit =  0;
            
            rowData = {
              itemcode: ProductDetl.product_code,
              itemdescription: ProductDetl.product_name,
              qty: ProductDetl.return_qty,
              unit: ProductDetl.unit,
              // unitConversion:dataUnit,
              expdate: ProductDetl.expiry_date,
              batchno: ProductDetl.batch_code,
              binloc: warecode+ProductDetl.bay,
            };
            totalQTY += ProductDetl.return_qty

            console.log(ProductDetl)
            table.datas.push(rowData);
          });

        }else{
          table = {
            headers: [
              { label: "Item Code", property: 'itemcode', width: 60, renderer: null },
              { label: "Item Description", property: 'itemdescription', width: 200, renderer: null },
              { label: "Quantity", property: 'qty', width: 60, renderer: null },
              { label: "UOM", property: 'unit', width: 60, renderer: null },
              // { label: "Quantity", property: 'unitConversion', width: 60, renderer: null },
              { label: "Expiration Date", property: 'expdate', width: 80, renderer: null },
              { label: "Batch No", property: 'batchno', width: 63, renderer: null },
              // { label: "Bin Location", property: 'binloc', width: 63, renderer: null },
            ],
            datas: [],
          };


          user_id.return_sale_QA.forEach((ProductDetl) => {

            let dataUnit = '';
            var totalPerUnit =  0;
            
            rowData = {
              itemcode: ProductDetl.product_code,
              itemdescription: ProductDetl.product_name,
              qty: ProductDetl.return_qty,
              unit: ProductDetl.unit,
              expdate: ProductDetl.expiry_date,
              batchno: ProductDetl.batch_code,
              // binloc: ProductDetl.bay,
            };
            totalQTY += ProductDetl.return_qty
            console.log(totalQTY + " <> " + ProductDetl.return_qty)
            table.datas.push(rowData);
          });

        }
        

                  

      doc.table(table, {
          x: 20,
          y: 280,
          prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
          prepareRow: (row, indexColumn, indexRow, rectRow) => doc.font("Helvetica").fontSize(8),
          
         
        });
        var lastTableY = doc.y
        var lastTableX = doc.x

        doc
        .fontSize(10)
        .text("*********************** NOTHING TO FOLLOWS ***********************", lastTableX+125, lastTableY);

      doc
      .fontSize(10)
      .text("TOTAL QTY: ", lastTableX, lastTableY+=400);

      doc
      .fontSize(10)
      .text(totalQTY, lastTableX+55, lastTableY,{ underline: true});


      doc
      .fontSize(10)
      .text("Check By: ", lastTableX, lastTableY+30);

      doc
      .fontSize(10)
      .text("ARMAN CRUZ", lastTableX+50, lastTableY+30,{ underline: true});

      
      
      let pages = doc.bufferedPageRange();

 
      for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);

      //Footer: Add page number
      let oldBottomMargin = doc.page.margins.bottom;
      doc.page.margins.bottom = 0 //Dumb: Have to remove bottom margin in order to write into it
      doc
          .text(
          `Page: ${i + 1} of ${pages.count}`,
          0,
          doc.page.height - (oldBottomMargin/2), // Centered vertically in bottom margin
          { align: 'center' }
          );
      doc.page.margins.bottom = oldBottomMargin; // ReProtect bottom margin
      }
    
      
      const lasttextY = doc.y
      const lasttextX = doc.x
      // doc
      // .fontSize(10)
      // .text("X: " + lasttextX + " Y : " + lasttextY, lasttextX, lasttextY);

      // Finalize the PDF
      doc.end();
  } catch (error) {
      console.log(error);
      res.status(500).send("An error occurred while generating the PDF.");
  }
}); 







router.get("/pdf_puchases/:id", auth, async (req, res) => {
  try {
      const { username, email, role } = req.user;
      const role_data = req.user;

      const profile_data = await profile.findOne({ email: role_data.email });

      const master = await master_shop.find();

      const _id = req.params.id;
      const user_id = await purchases.findById(_id);

      const doc = new PDFDocument({ margin: 30, size: 'A4', bufferPages: true });


      res.setHeader('Content-disposition', 'inline; filename="OUT-'+ _id+'.pdf"');
      res.setHeader('Content-type', 'application/pdf');
      var x=20;
      var y=60;

      doc.pipe(res);


      doc.image('./public/upload/'+master[0].image, 20, 0, {fit: [100, 100]})

      doc
      .fontSize(20)
      .text('DELI MONDO FOOD SPECIALTIES INC.', x, y);
      doc
      .fontSize(10)
      .text('BRGY.HALAYHAY, TANZA CAVITE', x, y+=15);

      doc
      .fontSize(15)
      .text('RAW MATERIALS RECEIVING REPORT', x, y+=50);

      doc
      .fontSize(10)
      .text("(INCOMING)", x, y+=20);

      doc
      .fontSize(9)
      .text('Warehouse ', x, y+=45);

      doc
      .fontSize(9)
      .text(' : ' + user_id.warehouse_name, x+63, y);
      
      doc
      .fontSize(9)
      .text('Supplier : ' + user_id.suppliers, x+380, y, { underline: true });


      // doc
      // .fontSize(9)
      // .text('Pick By : ', x, y+=11);

      doc
      .fontSize(9)
      .text('Date ', x, y+=11);

      doc
      .fontSize(9)
      .text(' : ' + user_id.date, x+63, y);

      doc
      .fontSize(9)
      .text('Control Number ', x, y+=11);


      doc
      .fontSize(9)
      .text(' : ' + user_id.invoice, x+63, y);


      const table = {
          headers: [
            { label: "Item Code", property: 'itemcode', width: 60, renderer: null },
            { label: "Item Description", property: 'itemdescription', width: 150, renderer: null },
            { label: "QTY", property: 'qty', width: 45, renderer: null },
            { label: "UOM", property: 'unit', width: 60, renderer: null },
            // { label: "Quantity", property: 'unitConversion', width: 60, renderer: null },
            { label: "Expiration Date", property: 'expdate', width: 70, renderer: null },
            { label: "Batch No", property: 'batchno', width: 60, renderer: null },
            { label: "Bin Location", property: 'binloc', width: 60, renderer: null },
            { label: "Delivery Code", property: 'DelCode', width: 63, renderer: null },
          ],
          datas: [],
        };
        var totalQTY = 0; 
        let warecode = "";
   
        user_id.product.forEach((ProductDetl) => {

          let dataUnit = '';
          var totalPerUnit =  0;
          // const qtydata = ProductDetl.quantity;
            // for (let index = 1; index <= qtydata; index++) {
              
            //   if(qtydata == index){
            //     dataUnit += ProductDetl.maxperunit;
            //   }else{
            //     dataUnit += ProductDetl.maxperunit+',';
            //   }
              
              
            //   totalPerUnit +=ProductDetl.maxperunit;
            // }
            // dataUnit += ' / ' + ProductDetl.secondary_unit ;
            var totalQty = 0;
            var UOMData = '';
            if (ProductDetl.product_cat == "S") {
              if(ProductDetl.maxperunit > 0){
                totalQty = ProductDetl.quantity*ProductDetl.maxperunit;
              }else{
                totalQty = ProductDetl.quantity*1;
              }
              UOMData= ProductDetl.secondary_unit;
            }else{
                totalQty = ProductDetl.quantity*1;
                UOMData= ProductDetl.standard_unit;
            }
          
          const rowData = {

            
            itemcode: ProductDetl.product_code,
            itemdescription: ProductDetl.product_name,
            qty: totalQty,
            unit: UOMData,
            // unitConversion:dataUnit,
            expdate: ProductDetl.expiry_date,
            batchno: ProductDetl.batch_code,
            binloc: ProductDetl.storage+ProductDetl.rack+ProductDetl.bay+ProductDetl.bin+ProductDetl.type[0]+ProductDetl.floorlevel,
            DelCode: ProductDetl.delivery_code,
          };
          totalQTY += totalQty
          table.datas.push(rowData);
        });

                  

      doc.table(table, {
          x: 20,
          y: 280,
          prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
          prepareRow: (row, indexColumn, indexRow, rectRow) => doc.font("Helvetica").fontSize(8),
          
         
        });
        var lastTableY = doc.y
        var lastTableX = doc.x


        doc
        .fontSize(10)
        .text("*********************** NOTHING TO FOLLOWS ***********************", lastTableX+125, lastTableY);

      doc
      .fontSize(10)
      .text("TOTAL QTY: ", lastTableX, lastTableY+=350);

      doc
      .fontSize(10)
      .text(totalQTY, lastTableX+240, lastTableY,{ underline: true});

      // doc
      // .fontSize(10)
      // .text('Picked By       : ', lastTableX, lastTableY+=25);


      // doc
      // .fontSize(10)
      // .text(" ".repeat(60), lastTableX+64, lastTableY,{ underline: true});


      // doc
      // .fontSize(10)
      // .text("Check By: ", lastTableX, lastTableY+30);

      // doc
      // .fontSize(10)
      // .text("                                                                           ", lastTableX+50, lastTableY+30,{ underline: true});


      doc
      .fontSize(10)
      .text("Checked By   : ", lastTableX, lastTableY+40);

      doc
      .fontSize(10)
      .text("               RICHARD BAET                   ", lastTableX+64, lastTableY+40,{ underline: true});
      
      doc
      .fontSize(10)
      .text("Raw Materials Warehouse Supervisor", lastTableX+64, lastTableY+50);


      // const pageNumber = doc.bufferedPageRange().start + 1; 
      let pages = doc.bufferedPageRange();

      // let pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);

      //Footer: Add page number
      let oldBottomMargin = doc.page.margins.bottom;
      doc.page.margins.bottom = 0 //Dumb: Have to remove bottom margin in order to write into it
      doc
          .text(
          `Page: ${i + 1} of ${pages.count}`,
          0,
          doc.page.height - (oldBottomMargin/2), // Centered vertically in bottom margin
          { align: 'center' }
          );
      doc.page.margins.bottom = oldBottomMargin; // ReProtect bottom margin
      }
    
      
      const lasttextY = doc.y
      const lasttextX = doc.x
      // doc
      // .fontSize(10)
      // .text("X: " + lasttextX + " Y : " + lasttextY, lasttextX, lasttextY);

      // Finalize the PDF
      doc.end();
  } catch (error) {
      console.log(error);
      res.status(500).send("An error occurred while generating the PDF.");
  }
}); 


router.get("/PDF_Sales/:id", auth, async (req, res) => {
  try {
      const { username, email, role } = req.user;
      const role_data = req.user;

      const profile_data = await profile.findOne({ email: role_data.email });

      const master = await master_shop.find();

      const _id = req.params.id;
      const user_id = await sales.findById(_id);

      const doc = new PDFDocument({ margin: 30, size: 'A4', bufferPages: true });


      var Title;
      Title = "PICKING LIST";
      if(user_id.finalize == "True"){
        Title = "DELIVERY RECEIPT";

      }


      res.setHeader('Content-disposition', 'inline; filename="OUT-'+ _id+'.pdf"');
      res.setHeader('Content-type', 'application/pdf');
      var x=20;
      var y=100;

      doc.pipe(res);


      doc.image('./public/upload/'+master[0].image, 20, 0, {fit: [100, 100]})

      doc
      .fontSize(20)
      .text('DELI MONDO FOOD SPECIALTIES INC.', x, y);
      doc
      .fontSize(10)
      .text('BRGY.HALAYHAY, TANZA CAVITE', x, y+=15);

      doc
      .fontSize(15)
      .text(Title, x, y+=50);

      doc
      .fontSize(10)
      .text("(OUTGOING)", x, y+=20);

      doc
      .fontSize(9)
      .text('Date ', x, y+=25);

      doc
      .fontSize(9)
      .text(' : ' + user_id.date, x+63, y);
      

      doc
      .fontSize(9)
      .text('REF MRIS# ', x, y+=11);

      doc
      .fontSize(9)
      .text(' : ' + user_id.invoice, x+63, y);



      const table = {
          headers: [
            { label: "ITEM CODE", property: 'itemcode',  align: "center", width: 45, renderer: null },
            { label: "MATERIAL DESCRIPTION", property: 'itemdescription',  align: "center", width: 100, renderer: null },
            { label: "REQUESTED QUANTITY", property: 'rqty',  align: "center", width: 40, renderer: null },
            { label: "QUANTITY ISSUED", property: 'iqty',  align: "center", width: 40, renderer: null },
            { label: "UOM", property: 'unit',  align: "center", width: 40, renderer: null },
            { label: "LOCATION", property: 'blocation',  align: "center", width: 50, renderer: null },
            { label: "PRODUCTION DATE", property: 'proddate',  align: "center", width: 60, renderer: null },
            { label: "EXPIRATION DATE", property: 'expdate',  align: "center", width: 60, renderer: null },
            { label: "DELIVERY DATE", property: 'del_date',  align: "center", width: 63, renderer: null },
            { label: "DELIVERY CODE", property: 'del_code',  align: "center", width: 63, renderer: null },
          ],
          datas: [],
        };
        var totalQTY = 0; 
        let warecode = "";
        var totalPerUnit =0;
      
        var x=1;
        user_id.sale_product.forEach((ProductDetl) => {
          
          const d = new Date(ProductDetl.production_date);
          const options = { year: 'numeric', month: 'short', day: 'numeric' };
          const formattedDate = d.toLocaleDateString('en-US', options);

          const ed = new Date(ProductDetl.expiry_date);
          const optionsed = { year: 'numeric', month: 'short', day: 'numeric' };
          const formattedDateed = ed.toLocaleDateString('en-US', optionsed);
          
          
          const dd = new Date(ProductDetl.delivery_date);
          const optionsdd = { year: 'numeric', month: 'short', day: 'numeric' };
          var formattedDatedd = dd.toLocaleDateString('en-US', optionsdd);

          if(typeof ProductDetl.delivery_date == "undefined"){
            formattedDatedd = "";
          }

          console.log(ProductDetl)

          var totalQty = 0;
            var UOMData = '';
            if (ProductDetl.prod_cat == "S") {
              if(ProductDetl.maxperunit > 0){
                totalQty = ProductDetl.quantity*ProductDetl.maxperunit;
              }else{
                totalQty = ProductDetl.quantity*1;
              }
              UOMData= ProductDetl.secondary_unit;
            }else{
                totalQty = ProductDetl.quantity*1;
                UOMData= ProductDetl.unit;
            }
          const rowData = {
            
            
            itemcode: ProductDetl.product_code,
            itemdescription: ProductDetl.product_name,
            rqty: ProductDetl.requested_qty,
            iqty: totalQty,
            unit: UOMData,
            blocation: ProductDetl.storage+ProductDetl.rack+ProductDetl.bay+ProductDetl.bin+ProductDetl.type[0]+ProductDetl.floorlevel,
            proddate: formattedDate,
            expdate: formattedDateed,
            del_date: formattedDatedd,
            del_code: ProductDetl.delivery_code
          };
     
          x++;
          table.datas.push(rowData);
        });

                  
        // console.log(x)
      doc.table(table, {
          x: x+17,
          y: y+=30,
          prepareHeader: () => doc.font("Helvetica-Bold").fontSize(6.5),
          // prepareRow: (row, indexColumn, indexRow, rectRow) => doc.font("Helvetica").fontSize(8),
          prepareRow: (row, indexColumn, indexRow, rectRow, rectCell) => {
            const {x, y, width, height} = rectCell;
            doc.font("Helvetica").fontSize(8),
            doc
            .lineWidth(.5)
            .moveTo(x, y)
            .lineTo(x, y + height)
            .stroke(); 
          },
          
         
        });
        

        

        
        var lastTableY = doc.y
        var lastTableX = doc.x

       
        var lineTable = lastTableY-=8
        doc.lineWidth(5);
        doc.lineCap('butt')
        .moveTo(576, lineTable)
        .lineTo(17, lineTable)
        .stroke();


        doc
        .fontSize(10)
        .text("*********************** NOTHING TO FOLLOWS ***********************", lastTableX+125, lastTableY+=15);


        
 
        doc
        .fontSize(11)
        .text('PREPARED BY : ', lastTableX, lastTableY+=(doc.x+lastTableX));

        

        doc
      .fontSize(10)
      .text("                                                            ", lastTableX+82, lastTableY,{ underline: true});


      doc
      .fontSize(10)
      .text('Picked By', lastTableX, lastTableY+=25);

      doc
      .fontSize(10)
      .text(" : ", lastTableX + 75, lastTableY);


      doc
      .fontSize(10)
      .text(" ".repeat(60), lastTableX+80, lastTableY,{ underline: true});


      doc
      .fontSize(10)
      .text("Noted By ", lastTableX, lastTableY+=50);


      doc
      .fontSize(10)
      .text(" : ", lastTableX + 75, lastTableY);

      doc
      .fontSize(10)
      .text("              RICHARD BAET                   ", lastTableX+80, lastTableY,{ underline: true});
        
        doc
        .fontSize(10)
        .text("Raw Materials Warehouse Supervisor", lastTableX+80, lastTableY+12);
        
      // const pageNumber = doc.bufferedPageRange().start + 1; 
      let pages = doc.bufferedPageRange();

      // let pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);

      //Footer: Add page number
      let oldBottomMargin = doc.page.margins.bottom;
      doc.page.margins.bottom = 0 //Dumb: Have to remove bottom margin in order to write into it
      doc
          .text(
          `Page: ${i + 1} of ${pages.count}`,
          0,
          doc.page.height - (oldBottomMargin/2), // Centered vertically in bottom margin
          { align: 'center' }
          );
      doc.page.margins.bottom = oldBottomMargin; // ReProtect bottom margin
      }
    
      
      const lasttextY = doc.y
      const lasttextX = doc.x
      doc.end();
  } catch (error) {
      console.log(error);
      res.status(500).send("An error occurred while generating the PDF.");
  }
});

router.get("/PDF_adjustment_rm/:id", auth, async (req, res) => {
  try {
      const { username, email, role } = req.user;
      const role_data = req.user;

      const profile_data = await profile.findOne({ email: role_data.email });

      const master = await master_shop.find();

      const _id = req.params.id;
      const user_id = await adjustment.findById(_id);
      var Title;
      var SubTitle;
      Title = "PICKING LIST";
      SubTitle = "(INVENTORY ADJUSTMENT)";
      if(user_id.finalize == "True"){
        Title = "INVENTORY ADJUSTMENT";
        SubTitle = "";

      }
      const doc = new PDFDocument({ margin: 30, size: 'A4', bufferPages: true });


      res.setHeader('Content-disposition', 'inline; filename="OUT-'+ _id+'.pdf"');
      res.setHeader('Content-type', 'application/pdf');
      var x=20;
      var y=60;

      doc.pipe(res);


      doc.image('./public/upload/'+master[0].image, 20, 0, {fit: [100, 100]})

      doc
      .fontSize(20)
      .text('DELI MONDO FOOD SPECIALTIES INC.', x, y);
      doc
      .fontSize(10)
      .text('BRGY.HALAYHAY, TANZA CAVITE', x, y+=15);

      doc
      .fontSize(15)
      .text(Title, x, y+=50);

      doc
      .fontSize(10)
      .text(SubTitle, x, y+=20);

      doc
      .fontSize(9)
      .text('Warehouse ', x, y+=40);

      doc
        .fontSize(9)
        .text(' : '+user_id.warehouse_name, x+63, y);
      
      // doc
      // .fontSize(9)
      // .text('Customer : ' + user_id.customer, 400, 210, { underline: true });
      // doc
      // .fontSize(9)
      // .text('Pick By : ', x, y+=11);

      doc
      .fontSize(9)
      .text('Date ', x, y+=11);

      doc
        .fontSize(9)
        .text(' : '+user_id.date, x+63, y);

      doc
      .fontSize(9)
      .text('Control Number ', x, y+=11);

      doc
      .fontSize(9)
      .text(' : '+user_id.invoice, x+63, y);


      const table = {
          headers: [
            { label: "Item Code", property: 'itemcode', width: 60, renderer: null },
            { label: "Item Description", property: 'itemdescription', width: 150, renderer: null },
            { label: "Quantity", property: 'qty', width: 60, renderer: null },
            { label: "UOM", property: 'unit', width: 60, renderer: null },
            // { label: "Quantity", property: 'unitConversion', width: 60, renderer: null },
            { label: "Production Date", property: 'proddate', width: 80, renderer: null },
            { label: "Batch No", property: 'batchno', width: 63, renderer: null },
            { label: "Bin Location", property: 'binloc', width: 63, renderer: null },
          ],
          datas: [],
        };
        var totalQTY = 0; 
    
        var totalPerUnit =0;
      
        user_id.product.forEach((ProductDetl) => {
    
          let dataUnit = '';
          
          const qtydata = ProductDetl.to_quantity;
          for (let index = 1; index <= qtydata; index++) {
            
            if(qtydata == index){
              dataUnit += ProductDetl.maxperunit;
            }else{
              dataUnit += ProductDetl.maxperunit+',';
            }
            
            
            totalPerUnit +=ProductDetl.maxperunit;
          }
          dataUnit += ' / ' + ProductDetl.secondary_unit ;
          const rowData = {

            
            itemcode: ProductDetl.product_code,
            itemdescription: ProductDetl.product_name,
            qty: ProductDetl.new_adjust_qty,
            unit: ProductDetl.unit,
            // unitConversion:dataUnit,
            proddate: ProductDetl.production_date,
            batchno: ProductDetl.batch_code,
            binloc: ProductDetl.storage+ProductDetl.rack+ProductDetl.bay+ProductDetl.bin+ProductDetl.type[0]+ProductDetl.floorlevel,
          };
          totalQTY += ProductDetl.new_adjust_qty 
          
          table.datas.push(rowData);
        });

                  

      doc.table(table, {
          x: 20,
          y: 280,
          prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
          prepareRow: (row, indexColumn, indexRow, rectRow) => doc.font("Helvetica").fontSize(8),
          
         
        });
        var lastTableY = doc.y
        var lastTableX = doc.x


        doc
        .fontSize(10)
        .text("*********************** NOTHING TO FOLLOWS ***********************", lastTableX+125, lastTableY);

      doc
      .fontSize(10)
      .text("TOTAL QTY : ", lastTableX, lastTableY+=310);

      doc
      .fontSize(10)
      .text(totalQTY, lastTableX+200, lastTableY);     
      
      doc
      .fontSize(10)
      .text('Picked By     : ', lastTableX, lastTableY+=25);


      doc
      .fontSize(10)
      .text(" ".repeat(60), lastTableX+62, lastTableY,{ underline: true});


      doc
      .fontSize(10)
      .text("Checked By ", lastTableX, lastTableY+=50);


      doc
      .fontSize(10)
      .text(" : ", lastTableX + 55, lastTableY);

      doc
      .fontSize(10)
      .text("              RICHARD BAET                   ", lastTableX+60, lastTableY,{ underline: true});
        
        doc
        .fontSize(10)
        .text("Raw Materials Warehouse Supervisor", lastTableX+60, lastTableY+12);

      // doc
      // .fontSize(10)
      // .text("ARMAN CRUZ", lastTableX+60, lastTableY+30,{ underline: true});
      // const pageNumber = doc.bufferedPageRange().start + 1; 
      let pages = doc.bufferedPageRange();

      // let pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);

      //Footer: Add page number
      let oldBottomMargin = doc.page.margins.bottom;
      doc.page.margins.bottom = 0 //Dumb: Have to remove bottom margin in order to write into it
      doc
          .text(
          `Page: ${i + 1} of ${pages.count}`,
          0,
          doc.page.height - (oldBottomMargin/2), // Centered vertically in bottom margin
          { align: 'center' }
          );
      doc.page.margins.bottom = oldBottomMargin; // ReProtect bottom margin
      }
    
      
      const lasttextY = doc.y
      const lasttextX = doc.x
      // doc
      // .fontSize(10)
      // .text("X: " + lasttextX + " Y : " + lasttextY, lasttextX, lasttextY);

      // Finalize the PDF
      doc.end();
  } catch (error) {
      console.log(error);
      res.status(500).send("An error occurred while generating the PDF.");
  }
});


router.get("/PDF_transfer_rm/:id", auth, async (req, res) => {
  try {
      const { username, email, role } = req.user;
      const role_data = req.user;

      const profile_data = await profile.findOne({ email: role_data.email });

      const master = await master_shop.find();

      const _id = req.params.id;
      const user_id = await transfers.findById(_id);
      var Title;
      var SubTitle;
      Title = "Picking List";
      SubTitle = "(STOCKS TRANSFER)";
      if(user_id.finalize == "True"){
       Title = "STOCKS TRANSFER";
       SubTitle ="";

      }
      const doc = new PDFDocument({ margin: 30, size: 'A4', bufferPages: true });


      res.setHeader('Content-disposition', 'inline; filename="OUT-'+ _id+'.pdf"');
      res.setHeader('Content-type', 'application/pdf');
      var x=20;
      var y=60;

      doc.pipe(res);


      doc.image('./public/upload/'+master[0].image, 20, 0, {fit: [100, 100]})

      doc
      .fontSize(20)
      .text('DELI MONDO FOOD SPECIALTIES INC.', x, y);
      doc
      .fontSize(10)
      .text('BRGY.HALAYHAY, TANZA CAVITE', x, y+=15);

      doc
      .fontSize(15)
      .text(Title, x, y+=50);

      doc
      .fontSize(10)
      .text(SubTitle, x, y+=20);

      doc
      .fontSize(9)
      .text('From Warehouse ', x, y+=40);

      doc
      .fontSize(9)
      .text('   : '+user_id.from_warehouse, x+63, y);

      doc
      .fontSize(9)
      .text('To Warehouse ', x, y+=10);

      doc
      .fontSize(9)
      .text('   : '+user_id.to_warehouse, x+63, y);
      
      // doc
      // .fontSize(9)
      // .text('Customer : ' + user_id.customer, 400, 210, { underline: true });
      // doc
      // .fontSize(9)
      // .text('Pick By : ', x, y+=11);

      doc
      .fontSize(9)
      .text('Date ', x, y+=11);


      doc
      .fontSize(9)
      .text('   : '+user_id.date, x+63, y);

      doc
      .fontSize(9)
      .text('Control Number ', x, y+=11);

      doc
      .fontSize(9)
      .text('   : '+user_id.invoice, x+63, y);


      const table1 = {
        headers: [
          { label: "", property: 'itemcode', width: 443, renderer: null, textCenter: true },
          { label: "     FROM", property: 'itemcode', width: 63, renderer: null, textCenter: true },
          { label: "     TO", property: 'itemdescription', width: 63, renderer: null, textCenter: true  },
         
        ],
        datas: [],
      };

      doc.table(table1, {
        x: 5,
        y: 263,
        prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
        prepareRow: (row, indexColumn, indexRow, rectRow) => doc.font("Helvetica").fontSize(8),

      });


      const table = {
          headers: [
            { label: "Item Code", property: 'itemcode', width: 60, renderer: null },
            { label: "Item Description", property: 'itemdescription', width: 150, renderer: null },
            { label: "Quantity", property: 'qty', width: 40, renderer: null },
            { label: "UOM", property: 'unit', width: 55, renderer: null },
            { label: "Production Date", property: 'proddate', width: 75, renderer: null },
            { label: "Batch No", property: 'batchno', width: 63, renderer: null },
            { label: "Bin Location", property: 'binlocFrom', width: 63, renderer: null },
            { label: "Bin Location", property: 'binloc', width: 63, renderer: null },
          ],
          datas: [],
        };
        
        var totalQTY = 0; 
        let warecode = "";
        var totalPerUnit =0;
   
        user_id.product.forEach((ProductDetl) => {
          // console.log(ProductDetl)
          var prod_cat = ProductDetl.prod_cat;
          var Unit ;
          Unit = ProductDetl.unit;
          if(prod_cat == "S"){
            
            Unit = ProductDetl.secondary_unit;
          }
          
          const rowData = {
            itemcode: ProductDetl.product_code,
            itemdescription: ProductDetl.product_name,
            qty: ProductDetl.to_quantity,
            unit: Unit,
            proddate: ProductDetl.production_date,
            batchno: ProductDetl.batch_code,
            binloc: ProductDetl.storage+ProductDetl.rack+ProductDetl.to_bay+ProductDetl.to_bin+ProductDetl.to_types[0]+ProductDetl.to_floorlevel,
            qtyFrom: ProductDetl.from_quantity,
            binlocFrom: ProductDetl.from_storage+ProductDetl.from_rack+ProductDetl.from_bay+ProductDetl.from_bin+ProductDetl.from_types[0]+ProductDetl.from_floorlevel,
          };
          totalQTY += ProductDetl.to_quantity 
          
          table.datas.push(rowData);
        });

                  

      doc.table(table, {
          x: 5,
          y: 280,
          prepareHeader: () => doc.font("Helvetica-Bold").fontSize(8),
          prepareRow: (row, indexColumn, indexRow, rectRow) => doc.font("Helvetica").fontSize(8),
          
         
        });
        var lastTableY = doc.y
        var lastTableX = doc.x

        doc
        .fontSize(10)
        .text("*********************** NOTHING TO FOLLOWS ***********************", lastTableX+125, lastTableY);

      doc
      .fontSize(10)
      .text("TOTAL QTY: ", lastTableX, lastTableY+=300);

      doc
      .fontSize(10)
      .text(totalQTY, lastTableX+215, lastTableY,{ underline: true});   
      




      doc
      .fontSize(10)
      .text("Checked By: ", lastTableX, lastTableY+=50);

      doc
        .fontSize(10)
        .text("              RICHARD BAET                  ", lastTableX+60, lastTableY,{ underline: true});
        
        doc
        .fontSize(10)
        .text("Raw Materials Warehouse Supervisor", lastTableX+60, lastTableY+12);

      let pages = doc.bufferedPageRange();

      // let pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);

      //Footer: Add page number
      let oldBottomMargin = doc.page.margins.bottom;
      doc.page.margins.bottom = 0 //Dumb: Have to remove bottom margin in order to write into it
      doc
          .text(
          `Page: ${i + 1} of ${pages.count}`,
          0,
          doc.page.height - (oldBottomMargin/2), // Centered vertically in bottom margin
          { align: 'center' }
          );
      doc.page.margins.bottom = oldBottomMargin; // ReProtect bottom margin
      }
    
      
      const lasttextY = doc.y
      const lasttextX = doc.x
      // doc
      // .fontSize(10)
      // .text("X: " + lasttextX + " Y : " + lasttextY, lasttextX, lasttextY);

      // Finalize the PDF
      doc.end();
  } catch (error) {
      console.log(error);
      res.status(500).send("An error occurred while generating the PDF.");
  }
});



router.get("/barcode_generator/", auth, async (req, res) => {
  try {
   

    const inchesToPoints = inches => inches * 72; // Convert inches to points (1 inch = 72 points)

    const sizeInInches = { width: 3, height: 1 }; // Size in inches

    const dataProduct = await product.find();

    // Create PDF document
    const doc = new PDFDocument({
        margin: inchesToPoints(0.75), // 0.75 inches margin on all sides (30 mm)
        size: [inchesToPoints(sizeInInches.width), inchesToPoints(sizeInInches.height)], // Set document size to 3 inches wide and 1 inch tall
        bufferPages: true
    });

    const intdata = dataProduct.length;
    for(let i = 0; i <= intdata; i++){


      if(i != dataProduct.length){
        const ProductName = dataProduct[i].name;
        const primary_code = dataProduct[i].primary_code;
        const secondary_code = dataProduct[i].secondary_code;
        const products_code = dataProduct[i].product_code;

        const canvas = new Canvas();
        JsBarcode(canvas, primary_code, {
            format: "CODE128", height: 50,
            displayValue: true,
            text: primary_code
        });

        // doc
        // .fontSize(8)
        // .text(ProductName, 0, 0);
        doc.image(canvas.toBuffer(), 0, 0, { width: 210 });

        doc.addPage();
      }

    }
    
    
    // Pipe the generated PDF to the response
    doc.pipe(res);
    doc.end();
  } catch (error) {
    console.error("An error occurred while generating the PDF:", error);
    res.status(500).send("An error occurred while generating the PDF.");
  }
});













module.exports = router;