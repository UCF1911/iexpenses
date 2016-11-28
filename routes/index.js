var express = require('express');
var router = express.Router();
var Item = require('../models/item');
var Category = require('../models/category');
var Buyer = require('../models/buyer');
var Transaction = require('../models/transaction');
var moment = require('moment');


/* GET home page. */
router.get('/', function(req, res, next) {

    //get all buyers

    //get all categories in array categories when the home page loads
    Buyer.find()
        .then(function(docsbuy) {
        Category.find()
            .then(function (docscat) {
                Item.find()
                    .then(function (docsitem) {
                        res.render('index',
                            {
                                title: 'My Expenses',
                                categories: docscat,
                                items: docsitem,
                                buyers: docsbuy,
                                buyerSession:req.session.buyer,
                                newCategoryInserted: req.flash('newCategoryInserted'),
                                newCategoryNotInserted: req.flash('newCategoryNotInserted'),
                                CategoryDeleted: req.flash('CategoryDeleted'),
                                CategoryNotDeleted: req.flash('CategoryNotDeleted'),
                                newBuyerInserted: req.flash('newBuyerInserted'),
                                newBuyerNotInserted: req.flash('newBuyerNotInserted'),
                                BuyerRemoved: req.flash('BuyerRemoved'),
                                BuyerNotRemoved: req.flash('BuyerNotRemoved'),
                                newItemInserted: req.flash('newItemInserted'),
                                newItemNotInserted: req.flash('newItemNotInserted'),
                                ItemDeleted: req.flash('ItemDeleted'),
                                ItemNotDeleted: req.flash('ItemNotDeleted'),
                                newPaymentInserted: req.flash('newPaymentInserted'),
                                newPaymentNotInserted: req.flash('newPaymentNotInserted')
                            });
                    });
            });
    });


});




//querying not parameterizing .. req.query not .params
//parameterizing would be:    router.get('/allPayments/buyer/:buyerName', function (req, res, next) { ......
//then inside req.params.buyerName
//and it helps in more static things like trakt not queries

router.get('/allPayments', function (req, res, next) {

    var conditions = {};

    //ma3ada el date w  ne3mel case tanya leldate
    for (var key in req.query) {
        if (key=='date'){
            ///////////////////////////////////////////////// date condition
            var datemonthyear = new Date(req.query[key]);
            var theyear = datemonthyear.getFullYear();
            var themonth = datemonthyear.getMonth()+1;

            var biggerDate = new Date(theyear,themonth,1);
            var smallerDate = new Date(theyear,themonth-1,1);

            conditions[key]= {$lt: biggerDate , $gte: smallerDate };



        }else {
            if (req.query.hasOwnProperty(key)) {
                conditions[key] = req.query[key];
            }
        }
    }

    //console.log(conditions);

    Category.find()
        .then(function (docscat) {
            Buyer.find()
                .then(function (docsbuy) {
                    Item.find()
                        .then(function (docsitem) {
                            Transaction.find(conditions).sort({'date':'asc'})
                                .then(function (docsPay) {
                                    //get total amount
                                    var sum = 0;
                                    for (var i in docsPay) {
                                        sum += docsPay[i].priceWhole;
                                    }

                                    res.render('allPayments', {
                                        title: 'My Expenses',
                                        titlePage: 'Latest Payments',
                                        payments: docsPay,
                                        categories: docscat,
                                        buyers:docsbuy,
                                        items: docsitem,
                                        totalAmount: Math.round(sum),
                                        length: docsPay.length,
                                        PaymentDeleted: req.flash('PaymentDeleted'),
                                        PaymentNotDeleted: req.flash('PaymentNotDeleted'),
                                        PaymentUpdated: req.flash('PaymentUpdated')
                                    });
                                });
                        });
                });
        });
});






router.post('/allPayments', function(req, res, next) {

    var buyerName = req.body.selchoosebuy;

    var dateString = req.body.hiddenDate;
    var momentObj = moment(dateString, 'MM/YYYY');
    var momentString = momentObj.utc().format();
    var date="";
    //check if date entered is a date then add to the database
    if(moment(momentString).isValid()){
         date = momentString;
    }//else do nothing so the date.now by the mongoose schema is the one saved


    var categoryName = req.body.selsort1;
    var itemName = req.body.selsort2;

    //parameterizing would be :   res.redirect('/allPayments/buyer'+buyerName+'/...');


    if(date=="" && itemName==null && categoryName==null && buyerName==null){
        res.redirect("/allPayments");
    }
    else{
        //res.redirect('/allPayments/?buyerName=' + buyerName+'&itemName=' +itemName);
        var linkToRedirect = "/allPayments/?"+((buyerName)?'&buyerName='+buyerName:'')+((itemName)?'&itemName='+itemName:'')+((categoryName)?'&categoryName='+categoryName:'')+((date)?'&date='+date:'');
        res.redirect(linkToRedirect);
    }


});





//find if an entry is a number or not
function isNumber(n){
    return !isNaN(parseFloat(n)) && isFinite(n);
}





router.post('/newPayment', function(req, res, next){

    var dateString = req.body.hiddenDate;
    var momentObj = moment(dateString, 'DD-MM-YYYY HH:mm');
    var momentString = momentObj.utc().format();
    //console.log(moment.utc().format());




    var Pay = {
        itemName:req.body.selnewpayment2,
        categoryName:req.body.selnewpayment1,
        quantity:Number(req.body.quantity1),
        priceEach:Number(req.body.price1),
        priceWhole:Number(req.body.price2),
        buyerName: req.session.buyer
    };
    //check if date entered is a date then add to the database
    if(moment(momentString).isValid()){
        Pay.date = momentString;
    }//else do nothing so the date.now by the mongoose schema is the one saved



    var data = new Transaction(Pay);


    if(!isNumber(Pay.quantity) || !isNumber(Pay.priceEach) || !isNumber(Pay.priceWhole) || Pay.quantity<0 || Pay.priceEach <0 || Pay.priceWhole<0.5){

        req.flash('newPaymentNotInserted', 'Something wrong happened');
        res.redirect('/');

    }else {
        data.save(function (err) {
                if (err) {
                    req.flash('newPaymentNotInserted', 'something wrong happened');
                    res.redirect('/');
                } else if (!err) {
                    req.flash('newPaymentInserted', 'new payment was added');
                    res.redirect('/');
                }
            }
        );
    }

});





router.post('/chooseBuyer', function(req, res, next) {

    req.session.buyer = req.body.selchoosebuy;
    res.redirect('/');
});





router.get('/destroyBuyer', function(req, res, next) {

    req.session.buyer = null;
    res.redirect('/');
});





router.get('/updatePayment/:id', function (req, res, next) {

    var updateid = req.params.id;

    Transaction.findOne({'_id' : updateid})
    .then(function(docPay) {
        Category.find()
            .then(function(docscat){
                Buyer.find()
                    .then(function (docsbuy) {
                        Item.find()
                            .then(function (docsitem) {
                                res.render('update',
                                    {
                                        payment: docPay,
                                        buyers:docsbuy,
                                        items: docsitem,
                                        categories:docscat,
                                        title: 'My Expenses',
                                        titlePage: 'Update and View a Transaction',
                                        PaymentNotUpdated: req.flash('PaymentNotUpdated')
                                    });
                            });
                    });
            });

    });

});





router.post('/updatePayment', function(req, res, next){

    var dateString = req.body.hiddenDate;
    var momentObj = moment(dateString, 'DD-MM-YYYY HH:mm');
    var momentString = momentObj.utc().format();
    //console.log(moment.utc().format());




    var Pay = {
        itemName:req.body.selnewpayment2,
        categoryName:req.body.selnewpayment1,
        quantity:Number(req.body.quantity1),
        priceEach:Number(req.body.price1),
        priceWhole:Number(req.body.price2),
        buyerName: req.body.selchoosebuy
    };



    var uid = req.body.updateid;


    if(!isNumber(Pay.quantity) || !isNumber(Pay.priceEach) || !isNumber(Pay.priceWhole) || Pay.quantity<0 || Pay.priceEach <0 || Pay.priceWhole<0.5){

        req.flash('PaymentNotUpdated', 'Something wrong happened');
        res.redirect('/updatePayment/'+uid);

    }else {
        Transaction.findById(uid,function (err , docup) {
                if (err) {
                    req.flash('PaymentNotUpdated', 'something wrong happened');
                    res.redirect('/updatePayment/'+uid);
                } else if (!err) {

                    docup.itemName = Pay.itemName;
                    docup.categoryName = Pay.categoryName;
                    docup.quantity = Pay.quantity;
                    docup.priceEach = Pay.priceEach;
                    docup.priceWhole = Pay.priceWhole;
                    docup.buyerName = Pay.buyerName;
                    //check if date entered is a date then add to the database
                    if(moment(momentString).isValid()){
                        docup.date = momentString;
                    }//else do nothing so the date.now by the mongoose schema is the one saved


                    docup.save(function(err2){
                        if(err2){
                            req.flash('PaymentNotUpdated', 'something wrong happened');
                            res.redirect('/updatePayment/'+uid);
                        }else if(!err2){
                            req.flash('PaymentUpdated', 'payment was updated successfully');
                            res.redirect('/allPayments');
                        }
                    });


                }
            }

        );
    }

});





router.post('/newCategory', function(req,res,next){
  var Cat = {
      categoryName: req.body.newcat
  };

  var data = new Category(Cat);

  catRemovedSpaces = Cat.categoryName.replace(/\s/g, ''); // removed spaces to handle "   " entries

    if(!catRemovedSpaces){

        req.flash('newCategoryNotInserted', 'something wrong happened');
        res.redirect('/');

    }else {
        data.save(function (err) {
                if (err) {
                    req.flash('newCategoryNotInserted', 'something wrong happened');
                    res.redirect('/');
                } else if (!err) {
                    req.flash('newCategoryInserted', 'new category was added');
                    res.redirect('/');
                }
            }
        );
    }

});





router.post('/newItem', function(req,res,next){
    var It = {
        categoryName: req.body.selnewitem,
        itemName: req.body.newitem
    };

    var data = new Item(It);

    itRemovedSpaces = It.itemName.replace(/\s/g, ''); // removed spaces to handle "   " entries

    if(!itRemovedSpaces){

        req.flash('newItemNotInserted', 'something wrong happened');
        res.redirect('/');

    }else {
        data.save(function (err) {
                if (err) {
                    req.flash('newItemNotInserted', 'something wrong happened');
                    res.redirect('/');
                } else if (!err) {
                    req.flash('newItemInserted', 'new item was added');
                    res.redirect('/');
                }
            }
        );
    }

});






router.post('/newBuyer', function(req,res,next){
    var Buy = {
        buyerName: req.body.newbuyer
    };

    var data = new Buyer(Buy);

    buyRemovedSpaces = Buy.buyerName.replace(/\s/g, ''); // removed spaces to handle "   " entries

    if(!buyRemovedSpaces){

        req.flash('newBuyerNotInserted', 'something wrong happened');
        res.redirect('/');

    }else {
        data.save(function (err) {
                if (err) {
                    req.flash('newBuyerNotInserted', 'something wrong happened');
                    res.redirect('/');
                } else if (!err) {
                    req.flash('newBuyerInserted', 'new Buyer was added');
                    res.redirect('/');
                }
            }
        );
    }

});






router.post('/deleteCategory', function(req,res,next){
    var catname = req.body.seldeletecat;


    if(!catname){

        req.flash('CategoryNotDeleted', 'something wrong happened');
        res.redirect('/');

    }else {
        Category.findByIdAndRemove(catname, function (err) {
            if (err) {
                req.flash('CategoryNotDeleted', 'something wrong happened');
                res.redirect('/');
            } else if (!err) {
                req.flash('CategoryDeleted', 'category was deleted');
                res.redirect('/');
            }
        }).exec();
    }
});






router.post('/deleteItem', function(req,res,next){
    var itemid = req.body.seldeleteitem2;

    if(!itemid){

        req.flash('ItemNotDeleted', 'something wrong happened');
        res.redirect('/');

    }else {
        Item.findByIdAndRemove(itemid, function (err) {
            if (err) {
                req.flash('ItemNotDeleted', 'something wrong happened');
                res.redirect('/');
            } else if (!err) {
                req.flash('ItemDeleted', 'item was deleted');
                res.redirect('/');
            }
        }).exec();
    }
});






router.post('/removeBuyer', function(req,res,next){
    var buyerid = req.body.seldeletebuy;


    if(!buyerid){

        req.flash('BuyerNotRemoved', 'something wrong happened');
        res.redirect('/');

    }else {
        Buyer.findByIdAndRemove(buyerid, function (err) {
            if (err) {
                req.flash('BuyerNotRemoved', 'something wrong happened');
                res.redirect('/');
            } else if (!err) {
                req.flash('BuyerRemoved', 'Buyer was Removed');
                res.redirect('/');
            }
        }).exec();
    }
});






router.post('/deletePayment/:id', function(req,res,next){


    var payid = req.params.id;

    if(!payid){

        req.flash('PaymentNotDeleted', 'something wrong happened');
        res.redirect('/allPayments');

    }else {
        Transaction.findByIdAndRemove(payid, function (err) {
            if (err) {
                req.flash('PaymentNotDeleted', 'something wrong happened');
                res.redirect('/allPayments');
            } else if (!err) {
                req.flash('PaymentDeleted', 'payment was deleted');
                res.redirect('/allPayments');
            }
        }).exec();
    }
});








module.exports = router;
