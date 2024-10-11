function myFunction_Stocks(){
    var dropdown = document.getElementById("stock_report_warehouse");
      var selectedChoice = dropdown.value;
        // alert(selectedChoice)
      var primaryTextbox = document.getElementById("primary-textbox");
      var secondaryTextbox = document.getElementById("secondary-textbox");

      if (selectedChoice === "warehouse") {
        primaryTextbox.style.display = "block";
        secondaryTextbox.style.display = "none";
      } else if (selectedChoice === "product") {
        primaryTextbox.style.display = "none";
        secondaryTextbox.style.display = "block";
      } else {
        primaryTextbox.style.display = "none";
        secondaryTextbox.style.display = "none";
      }
}




function SelectRoom(){
        
    var varibale = document.getElementById("warehouse").value;
    var selectRoom = $('#room');
    var AVal = document.getElementById("A").value;
    var BVal = document.getElementById("B").value;

    $.ajax({
        url: '/warehousemap_Income/Rooms_data', 
        method: 'POST',
        data: { warehouse_name: varibale, A:AVal, B:BVal  }, 
        success: function(response) {

        
            selectRoom.empty();
            if(AVal == "finish"){
              var defaultOption = $('<option>').text("All").val("All").attr('roomcode', "All");
              selectRoom.append(defaultOption);
            }else if(AVal == "All"){
                var defaultOption = $('<option>').text("All").val("All").attr('roomcode', "All");
                selectRoom.append(defaultOption);
            }
            
                $.each(response, function(index, data) {
                    var roomName = data.room_name;
                    var roomCode = data.room_name
                    var option = $('<option>').text(roomName).val(roomName).attr('roomcode', roomCode);;
                    selectRoom.append(option);
                    // LogicDropdown();

                })
            
        }
    })
    
}

function SelectRoomSelect(){

var selectRoom = $('#warehouse');
var A = document.getElementById("A");
var BVal = document.getElementById("B").value;

  var CatVal = '';
  var IndiVal = '';
  if(A.value == "raw"){
    CatVal = "Raw Materials"; 
  }else if(A.value == "finish"){
    CatVal = "Finished Goods";
  }else{
    CatVal = "All";
  }

  $.ajax({
        url: '/warehousemap_Income/Rooms_data2', 
        method: 'POST',
        data: { cat: CatVal, valNew: BVal }, 
        success: function(response) {

        
            selectRoom.empty();
            if(CatVal == "All"){
                var defaultOption = $('<option>').text("All").val("All").attr('roomcode', "All");
                selectRoom.append(defaultOption);
            }
                $.each(response, function(index, data) {
                    var roomName = data.room_name;
                    var roomCode = data.room_name
                    
                    
                    var option = $('<option>').text(roomName).val(roomName).attr('roomcode', roomCode);
                      // alert(option)
                      console.log(option)
                    selectRoom.append(option);


                })
                SelectRoom()
        }
    })

  
}

function LogicDropdown(){
    var A = document.getElementById("A")
    var B = document.getElementById("B")

    A.addEventListener("change", function() {
    var selectedOptionText = A.options[A.selectedIndex].textContent;
    // console.log(selectedOptionText)
      

    });


    if(A.value == "raw"){
      B.innerHTML = "<option value='ingre'>Ingredients</option><option value='pack'>Packaging</option>"
      $("#LevelTpes").show();
    }else if(A.value == "finish"){
      B.innerHTML = "<option value='All'>All</option>"
      $("#LevelTpes").hide();
      
    }else{
        B.innerHTML = "<option value='All'>All</option><option value='ingre'>Ingredients</option><option value='pack'>Packaging</option>"
    }
    SelectRoomSelect();
  }


  function printDiv() {
    var printContents = document.getElementById("stock_report_table").innerHTML;
    // var originalContents = document.body.innerHTML;
    // document.body.innerHTML = printContents;
    // window.print();
    // document.body.innerHTML = originalContents;

    var printWindow = window.open('', '_blank');
  
    printWindow.document.open();
    printWindow.document.write('<html><head><title>Print</title> ');

    printWindow.document.write('<link href="../../../vendor/datatables/css/jquery.dataTables.min.css" rel="stylesheet">');
    printWindow.document.write('<link href="../../../css/style2.css" rel="stylesheet"></link>');
    
    printWindow.document.write('</head><body>');
    printWindow.document.write(printContents);
    printWindow.document.write('</body></html>');
    
    printWindow.document.close();
    setTimeout(function() {
        printWindow.print();
      }, 1500); 
    // printWindow.print();
    }

  function json2Array(response){

    var data = [];
    response.forEach(element => {

        var warehouse_cat = element.warehouse_category;
        var warehouse_name = element.name;
        var warehouse_room = element.room;
        var itemcode = element.product_details.product_code;
        var itemdesc = element.product_details.product_name;
        var primarycode = element.product_details.primary_code;
        var secondarycode = element.product_details.secondary_code;
        var expirydate = element.product_details.expiry_date;
        var productiondate = element.product_details.production_date;
        if(warehouse_cat == "Raw Materials"){
            var binlocation = element.product_details.storage+element.product_details.rack+element.product_details.bay+element.product_details.bin+element.product_details.type[0]+element.product_details.floorlevel;
        }else{
            var binlocation = element.product_details.bay;
        }
        data["warehouse_cat"] = warehouse_cat
        // var binlocation

        // console.log(element)
        // data["warehouse_cat"][element.warehouse_category] = element.warehouse_category
    });
    // console.log(response)
    return data;
  }

  $('#filter').click(function(){

    var warehouse_value = $('#warehouse').val();
    var room_value = $('#room').val();
    var Type_value = $('#Type').val();
    var A_value = $('#A').val();
    var B_value = $('#B').val();
    var stock_report_warehouse = $('#stock_report_warehouse').val();
    var link;
    if(stock_report_warehouse == "warehouse"){
        link = '/stock_report/Reports';
    }else{
        link = '/stock_report/Reports_product';
    }
    $.ajax({
      
        url: link,
        type: 'POST',
        data: { warehouseNew: warehouse_value, rooms: room_value, Type: Type_value, process_cat: A_value, room_cat: B_value },
        success: function(response) {
        

            // var array_data = json2Array(response);
            // console.log("result: ", array_data)

           
            let dataItem = '';
            let dataItem2 = '';

            if(stock_report_warehouse == "warehouse"){
                dataItem +='<div class="card-body">';
                dataItem +='<table id="example" class="table  text-center">';
                dataItem +='<thead>';
                dataItem +='<tr class="table-dark">';
                dataItem +='<th scope="col"><h5>Product Category </h5></th>';
                dataItem +='<th scope="col"><h5>Name</h5></th>';
                dataItem +='<th scope="col"><h5>Room</h5></th>';
                dataItem +='<th scope="col"><h5>Item Code</h5></th>';
                dataItem +='<th><h5>Item Description</h5></th>';
                dataItem +='<th><h5>Primary Barcode</h5></th>';
                dataItem +='<th><h5>Secondary barcode</h5></th>';
                dataItem +='<th><h5>Unit of Measure</h5></th>';
                dataItem +='<th><h5>Secondary Unit</h5></th>';
                dataItem +='<th><h5>Batch Code</h5></th>';
                dataItem +='<th><h5>Production Date</h5></th>';
                dataItem +='<th><h5>Expiry Date</h5></th>';
                dataItem +='<th><h5>Stock Quantity</h5></th>';
                dataItem +='<th><h5>Actual Quantity</h5></th>';
                dataItem +='<th><h5>Actual UNIT OF MEASURE</h5></th>';
                dataItem +='<th><h5>Bin Location</h5></th>';
                dataItem +='</tr>';
                dataItem +='</thead>';
                dataItem +='<tbody>';

                
                response.forEach(element => {
                    console.log(element)
                    

                    if(element.warehouse_category == "Raw Materials"){
                        var binlocation = element.product_details.storage+element.product_details.rack+element.product_details.bay+element.product_details.bin+element.product_details.type[0]+element.product_details.floorlevel;
                    }else{
                        var cat;
                        if(element.name == "DRY GOODS"){
                            cat = "DG"
                        }else{
                            cat = "FG"
                        }
                        var binlocation = cat+element.product_details.bay;
                    }

                    var warehouse_cat = element.warehouse_category !== undefined ? element.warehouse_category : 0;
                    var warehouse_name = element.name !== undefined ? element.name : "";
                    var warehouse_room = element.room !== undefined ? element.room :"";
                    var itemcode = element.product_details.product_code !== undefined ? element.product_details.product_code :"";
                    var itemdesc = element.product_details.product_name !== undefined ? element.product_details.product_name :"";
                    var primarycode = element.product_details.primary_code !== undefined ? element.product_details.primary_code :"";
                    var secondarycode = element.product_details.secondary_code !== undefined ? element.product_details.secondary_code :"";
                    var expirydate = element.product_details.expiry_date !== undefined ? element.product_details.expiry_date :"";
                    var productiondate = element.product_details.production_date !== undefined ? element.product_details.production_date :"";

                    var UOM = element.product_details.unit !== undefined ? element.product_details.unit :"";
                    var SndUOM = element.product_details.secondary_unit !== undefined ? element.product_details.secondary_unit :"";
                    var BatchCodes = element.product_details.batch_code !== undefined ? element.product_details.batch_code :"";

                    var actual_qty = element.product_details.actual_qty !== undefined ? element.product_details.actual_qty :"";
                    var actual_uom = element.product_details.actual_uom !== undefined ? element.product_details.actual_uom :"";

                
                    dataItem +='<tr>';
                    dataItem +='<td class="text-nowrap" ><h5>'+ warehouse_cat+'</h5></td>';
                    dataItem +='<td class="text-nowrap" ><h5>'+ warehouse_name +'</h5></td>';
                    dataItem +='<td class="text-nowrap" ><h5>'+ warehouse_room +'</h5></td>';
                    dataItem +='<td class="text-nowrap" ><h5>'+ itemcode +'</h5></td>';
                    dataItem +='<td class="text-nowrap"><h5>'+ itemdesc +'</h5></td>';
                    dataItem +='<td class="text-nowrap"><h5>'+ primarycode +'</h5></td>';
                    dataItem +='<td class="text-nowrap"><h5>'+ secondarycode +'</h5></td>';
                    dataItem +='<td class="text-nowrap"><h5>'+ UOM +'</h5></td>';
                    dataItem +='<td class="text-nowrap"><h5>'+ SndUOM +'</h5></td>';
                    dataItem +='<td class="text-nowrap"><h5>'+ BatchCodes +'</h5></td>';
                    dataItem +='<td class="text-nowrap"><h5>'+ productiondate +'</h5></td>';
                    dataItem +='<td class="text-nowrap"><h5>'+ expirydate +'</h5></td>';
                    dataItem +='<td class="text-nowrap"><h5>'+ element.product_details.product_stock.toFixed(3); +'</h5></td>';
                    dataItem +='<td class="text-nowrap"><h5>'+ actual_qty +'</h5></td>';
                    dataItem +='<td class="text-nowrap"><h5>'+ actual_uom +'</h5></td>';
                    dataItem +='<td class="text-nowrap"><h5>'+ binlocation +'</h5></td>';
                    dataItem +='</tr>';
                    

                });

                dataItem +='</tbody>';
                dataItem +='</table>';

                dataItem +='</div>';
            }else{
                console.log(response)
                dataItem +='<div class="card-body">';
                dataItem +='<table id="example" class="table  text-center">';
                dataItem +='<thead>';
                dataItem +='<tr class="table-dark">';
                dataItem +='<th scope="col"><h5>Name</h5></th>';
                dataItem +='<th scope="col"><h5>Brand</h5></th>';
                dataItem +='<th scope="col"><h5>Category</h5></th>';
                dataItem +='<th><h5>Unit</h5></th>';
                dataItem +='<th><h5>Secondary Unit</h5></th>';
                dataItem +='<th><h5>Primary barcode</h5></th>';
                dataItem +='<th><h5>Secondary barcode</h5></th>';
                dataItem +='<th><h5>Product barcode</h5></th>';
                dataItem +='</tr>';
                dataItem +='</thead>';
                dataItem +='<tbody>';


                response.forEach(element => {
                    var name = element.name !== undefined ? element.name : "";
                    var brand = element.brand !== undefined ? element.brand : "";
                    var category = element.category !== undefined ? element.category : "";
                    var unit = element.unit !== undefined ? element.unit : "";
                    var secondary_unit = element.secondary_unit !== undefined ? element.secondary_unit : "";
                    var primary_code = element.primary_code !== undefined ? element.primary_code : "";
                    var secondary_code = element.secondary_code !== undefined ? element.secondary_code : "";
                    var product_code = element.product_code !== undefined ? element.product_code : "";

                    dataItem +='<tr>';
                    dataItem +='<td class="text-nowrap" ><h5>'+ name +'</h5></td>';
                    dataItem +='<td class="text-nowrap" ><h5>'+ brand +'</h5></td>';
                    dataItem +='<td class="text-nowrap" ><h5>'+ category +'</h5></td>';
                    dataItem +='<td class="text-nowrap" ><h5>'+ unit +'</h5></td>';
                    dataItem +='<td class="text-nowrap"><h5>'+ secondary_unit +'</h5></td>';
                    dataItem +='<td class="text-nowrap"><h5>'+ primary_code +'</h5></td>';
                    dataItem +='<td class="text-nowrap"><h5>'+ secondary_code +'</h5></td>';
                    dataItem +='<td class="text-nowrap"><h5>'+ product_code +'</h5></td>';
                    dataItem +='</tr>';
                })


                dataItem +='</tbody>';
                dataItem +='</table>';

                dataItem +='</div>';

            }
            


            
            
            document.getElementById("stock_report_table").innerHTML = dataItem;

            dataItem2 +='<div class="card-header">';
            dataItem2 +='<button class="btn btn-info float-right" id="barcode_print1" onclick="printDiv()">';
            dataItem2 +='<i class="fas fa-print"></i> Print';
            dataItem2 +='</button>';


            dataItem2 +='<button class="btn btn-info" id="barcode_print1" onclick="ExportToExcel()">';
            dataItem2 +='<i class="fa fa-file-excel-o"></i> Download Excel';
            dataItem2 +='</button>';

            
            dataItem2 +='</div>';
            document.getElementById("stock_report_table_print").innerHTML = dataItem2;
            
        }
    })
  })

