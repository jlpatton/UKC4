const express = require('express');
const stripe = require('stripe')('sk_test_SasXC23L1OOf0pR3pKl2JCZ4');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const session = require('express-session');
const mongoose = require('mongoose');
//const passport = require('passport');

const port = process.env.PORT || 5000;

const app = express();
const amt = "";

// Passport config
//require('./config/passport')(passport);

// Map global promise to get rid of warning
mongoose.Promise = global.Promise;
// Connect to mongoose
mongoose.connect('mongodb://localhost/unknown-dev')
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

// Load Donor Model
require('./models/Donor');
const Donor = mongoose.model('donors');

// Load Donotion Model
require('./models/Donation');
const Donation = mongoose.model('donations');

// Load Honoree Model
require('./models/Honoree');
const Honoree = mongoose.model('honorees');

// Load Child Model
require('./models/Child');
const Child = mongoose.model('childs');

// Handlebars Middleware
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ estended: false }));


app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

//app.use(passport.initialize());
//app.use(passport.session());

// Passport session setup.
//passport.serializeUser(function(user, done) {
//console.log("serializing " + user.username);
//done(null, user);
//});

//passport.deserializeUser(function(obj, done) {
//console.log("deserializing " + obj);
//done(null, obj);
//});

// Set Static Folder
app.use(express.static(`${__dirname}/public`));

// Route security
function isAuthenticated(req, res, next) {
    // do any checks you want to in here

    Donor.findOne({ email: req.session.email }, function (err, donor) {
        if (err) { return err; }
        if (!donor) { res.redirect('/'); }
        // if (!donor.verifyPassword(password)) { return done(null, false); }
        else {
            if (donor.id != req.session.user) {
                res.redirect('/');
            } else {
                return next();
            }
        }
    });

    /* req.session.user.authenticated = true;
    // CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
    // you can do this however you want with whatever variables you set up
    if (req.session.user.authenticated)
        return next();

    // IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
    res.redirect('/'); */
}

/* app.use(function (req, res, next) {
    res.locals.amt2 = "";
    next();
}); */

// Index Route
app.get('/', (req, res) => {
    res.render('index');
});


// Donate Route
app.get('/donate', (req, res) => {
    res.render('layouts/donate');
});

// Memorials Route
app.get('/memorial', isAuthenticated, (req, res) => {
    res.render('layouts/memorial');
});

// Subscription Route
app.post('/subscript', (req, res) => {
    console.log(req.body);
    res.render('layouts/subscript', {
        option: req.body.option,
        dntAmount: req.body.dntAmount,
        quantity: req.body.quantity
    }
    );
});

// Children Route
app.get('/children', isAuthenticated, (req, res) => {
    console.log(req.body);
    Child.find({})
    .then(childs => {
        res.render('layouts/children', {
            childs:childs
        });

    });
});

// Completion Route
app.post('/completion', (req,res) => {
    const newHonoree = {
        title: req.body.title,
        name: req.body.name,
        address: {
            addr1: req.body.address1,
            addr2: req.body.address2,
            city: req.body.city,
            state: req.body.state,
            zip: req.body.zip
        },
        email: req.body.email,
        cardSent: req.body.cardSent,
        deceased: req.body.deceased,
        anonymous: req.body.anonymous
    }

    new Honoree(newHonoree)
    .save()
    .then(honoree => {
        //console.log(honoree);
        req.session.honoree = honoree;
        res.redirect('/');
    })
    .catch(err => {
        console.log('honoree');
        return;
    })
})

// Charge Route
app.post('/charge', (req, res) => {
    console.log('Body: ' + req.body);
    src = "https://checkout.stripe.com/checkout.js";
    // res.send('Test');
    // console.log('donateAmt = ' + req.body.donateAmt);
    var amount = req.body.dntAmount;
    var plan = "";
    var quantity = req.body.quantity;
    var custid;

    switch (req.body.option) {
        case "monthly":
            plan = "plan_Cp1b4I6uJRTMcJ";
            break;
        case "quarterly":
            plan = "plan_Cp1bx2QKvX2551";
            break;
        case "annually":
            plan = "plan_Cp1chVAREc7wiQ";
            break;
        default:
            plan = "once";
    }

    if (req.body.option === "once" || req.body.option === "penny") {
        stripe.customers.create({
            email: req.body.email,
            source: req.body.stripeToken
        })
            .then(customer => stripe.charges.create({
                amount: amount * 100,
                description: 'donation',
                currency: 'usd',
                customer: customer.id
            }))
            .then(charge => {

                const newDonor = {
                    stripeId: charge.customer,
                    name: req.body.cardName,
                    address: {
                        addr1: req.body.address1,
                        city: req.body.city,
                        state: req.body.state,
                        zip: req.body.zip
                    },
                    email: req.body.email
                }

                Donor.findOneAndUpdate({ email: req.body.email },
                    { $push: { stripeId: charge.customer } },
                    { new: true },
                    function (err, donor) {
                        if (err) return handleError(err);
                        if (donor) {
                            req.session.donor = donor;
                            req.session.user = donor.id;
                            req.session.email = donor.email;
                            /* passport.authenticate('local-signin', {
                                successRedirect: 'layouts/memorial',
                                failureRedirect: '/'
                                }); */
                            res.redirect('/children');
                            // doc may be null if no document matched
                            console.log('found a donor');
                            console.log('returned updated donor: ' + donor);
                        } else {
                            new Donor(newDonor)
                                .save()
                                .then(donor => {
                                    //console.log(donor);
                                    req.session.donor = donor;
                                    req.session.user = donor.id;
                                    req.session.email = donor.email;
                                    /* passport.authenticate('local-signin', {
                                        successRedirect: 'layouts/memorial',
                                        failureRedirect: '/'
                                        }); */
                                    res.redirect('/children');
                                    //res.send('thanks'); // redirect to memorial page
                                })
                                .catch(err => {
                                    console.log('rejected');
                                    return;
                                })
                        }
                    });

                // res.render('layouts/memorial',req.body);

            })
    } else {
        stripe.customers.create({
            email: req.body.email,
            source: req.body.stripeToken
        }).then(customer => stripe.subscriptions.create({
            customer: customer.id,
            items: [
                {
                    plan,
                    quantity
                }
            ]
        }, function (err, subscription) {
            // asynchronously called
            console.log(err);
        }
        )
        .then(subscription => {

            const newDonor = {
                stripeId: customer.id,
                name: req.body.cardName,
                address: {
                    addr1: req.body.address1,
                    city: req.body.city,
                    state: req.body.state,
                    zip: req.body.zip
                },
                email: req.body.email
            }

            Donor.findOneAndUpdate({ email: req.body.email },
                { $push: { stripeId: customer.id } },
                { new: true },
                function (err, donor) {
                    if (err) return;// handleError(err);
                    if (donor) {
                        req.session.donor = donor;
                        req.session.user = donor.id;
                        req.session.email = donor.email;
                        res.redirect('/memorial');
                        // doc may be null if no document matched
                        console.log('found a donor');
                        console.log('returned updated donor: ' + donor);
                    } else {
                        new Donor(newDonor)
                            .save()
                            .then(donor => {
                                req.session.donor = donor;
                                req.session.user = donor.id;
                                req.session.email = donor.email;
                                res.redirect('/memorial');
                                // res.render('/memorial',req.body);
                                console.log(donor);
                                //res.send('thanks'); // redirect to memorial page
                            })
                            .catch(err => {
                                console.log('rejected');
                            })
                    }
                });
            // res.render('layouts/memorial',req.body);

        }));
    }
})

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})


