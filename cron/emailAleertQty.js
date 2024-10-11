require('dotenv').config({ path: '../.env' });
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const fs = require('fs');
const { profile, master_shop, categories, brands, units, product, warehouse, staff, customer, suppliers, purchases, purchases_return, suppliers_payment, s_payment_data, email_settings } = require("../models/all_models");


const logFilePath = './emailNotifLogs.log';


function logToFile(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${message}\n`;
  
    fs.appendFile(logFilePath, logMessage, (err) => {
      if (err) {
        console.error('Error writing to log file:', err);
      }
    });
  }


mongoose.connect(process.env.DATABASE_STRING,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  ).then(() => {
    logToFile("Database connected!");
  }).catch((error) => {
    logToFile("Error connecting to database: " + error);
  });



  async function fetchData() {
    try {
      const warehouse_data = await warehouse.find({ status: 'Enabled' });
        var dataItem = '';
        var dataItem1 = '';
      warehouse_data.forEach(element => {
   
        if(element.product_details.length > 0){
          
            dataItem += '<div style="color:black;"><span>Warehouse Name: <b>'+ element.name+'</b></span></div>';
            dataItem += '<div style="color:black;"><span>Room Name: <b>'+ element.room +'</b></span></div>';
            dataItem += '<table style="width: 100% !important;">';
            dataItem += '<thead style="width: 100% !important;">';
            dataItem += '<tr>';
            dataItem += '<th style="border: 1px solid black;"> Product Code </th>';
            dataItem += '<th style="border: 1px solid black;"> Product Name </th>';
            dataItem += '<th style="border: 1px solid black;"> Primary Barcode </th>';
            dataItem += '<th style="border: 1px solid black;"> Secondary Barcode </th>';
            dataItem += '<th style="border: 1px solid black;"> Product Stock</th>';
            dataItem += '<th style="border: 1px solid black;"> Unit </th>';
            dataItem += '<th style="border: 1px solid black;"> Expiry Date </th>';
            dataItem += '<th style="border: 1px solid black;"> Bin Location </th>';
            dataItem += '</tr>';
            dataItem += '</thead>';
            dataItem += '<tbody style="text-align: center;">';

            element.product_details.forEach((data) => {

                if(data.product_stock < data.alertQTY){
   
                    dataItem += '<tr>';
                    dataItem += '<td>' + data.product_code + '</td>';
                    dataItem += '<td>' + data.product_name + '</td>';
                    dataItem += '<td>' + data.primary_code + '</td>';
                    dataItem += '<td>' + data.secondary_code + '</td>';
                    dataItem += '<td>' + data.product_stock + '</td>';
                    dataItem += '<td>' + data.unit + '</td>';
                    dataItem += '<td>' + data.expiry_date+ '</td>';
                    // dataItem += '<td>' +  + '</td>';
                    dataItem += '</tr>';
                    
                }
            })
           
            
            dataItem += '</tbody>';
            dataItem += '</table>';


            
        }
        
      });



      logToFile('Data : ' + dataItem);

    } catch (error) {
      console.error('error : ' + error);
    }
  }
  
  // Call the async function
  fetchData();
  
  