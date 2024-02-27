// This is your test secret API key.
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_KEY);
const express = require('express');
const app = express();
const cors = require("cors");
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());


const YOUR_DOMAIN = 'http://localhost:3000';

app.post('/create-checkout-session', async (req, res) => {
  const prices = await stripe.prices.list({
    product: "prod_PciNmbFZXjoX9B"
  });
  const session = await stripe.checkout.sessions.create({
    billing_address_collection: 'auto',
    line_items: [
      {
        price: prices.data[0].id,
        // For metered billing, do not pass quantity
        quantity: 1,

      },
    ],
    phone_number_collection: {
      enabled: true,
    },
    mode: 'subscription',
    //   ${YOUR_DOMAIN}/success.html?session_id={CHECKOUT_SESSION_ID}
    success_url: `${YOUR_DOMAIN}`,
    cancel_url: `${YOUR_DOMAIN}/`,
  });

  res.json({ url: session.url });
});

app.post('/create-portal-session', async (req, res) => {
  // For demonstration purposes, we're using the Checkout session to retrieve the customer ID.
  // Typically this is stored alongside the authenticated user in your database.
  const session_id = "cs_test_a1HD7WUyA0xA39DIHHjVXOIazxBE5WpPIl29vKamoktXUTS7ATqaOibX13"
  const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

  // This is the url to which the customer will be redirected when they are done
  // managing their billing with the portal.
  const returnUrl = YOUR_DOMAIN;

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: checkoutSession.customer,
    return_url: returnUrl,
  });

  res.redirect(303, portalSession.url);
});

app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (request, response) => {
    console.log("webhook::::::::")
    let event = request.body;
    // Replace this endpoint secret with your endpoint's unique secret
    // If you are testing with the CLI, find the secret by running 'stripe listen'
    // If you are using an endpoint defined with the API or dashboard, look in your webhook settings
    // at https://dashboard.stripe.com/webhooks
    const endpointSecret = 'whsec_Jqxuplf35ab0W4t56tuVw2Oj4t8tpPi7';
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    let subscription;
    let status;
    // Handle the event
    switch (event.type) {
      case 'customer.subscription.trial_will_end':
        subscription = event.data.object;
        status = subscription.status;
        //  console.log(`Subscription status is ${status}.`);
        // Then define and call a method to handle the subscription trial ending.
        // handleSubscriptionTrialEnding(subscription);
        break;
      case 'customer.subscription.deleted':
        subscription = event.data.object;
        //  status = subscription.status;
        console.log(`Subscription status is ${status}.`);
        // Then define and call a method to handle the subscription deleted.
        // handleSubscriptionDeleted(subscriptionDeleted);
        break;
      case 'customer.subscription.created':
        subscription = event.data.object;
        status = subscription.status;
        console.log(`Subscription status is ${status}.`);
        // console.log(event);
        const customerId = event.data.object.customer;
        const customer = await stripe.customers.retrieve(customerId);
        sendMail(customer.email, `Hello ${customer.name} you are now subscribed on Butt Talks TV`);


        // Then define and call a method to handle the subscription created.
        // handleSubscriptionCreated(subscription);
        break;
      case 'customer.subscription.updated':
        subscription = event.data.object;
        status = subscription.status;
        // console.log(`Subscription status is ${status}.`);
        // Then define and call a method to handle the subscription update.
        // handleSubscriptionUpdated(subscription);
        break;
      default:
      // Unexpected event type
      //console.log(`Unhandled event type ${event.type}.`);
    }
    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);
const sendMail = (mail_adress, html,) => {
  var mail = mail_adress;
  var nodemailer = require('nodemailer');
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'butttalksads@gmail.com ',
      pass: 'pzulraeeiajdorwi'
    }
  });
  var mailOptions = {
    from: 'Butt Talks TV',
    to: mail,
    subject: "SubScription to Butt Talks Tv",
    text: html
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

}

app.listen(4242, () => console.log('Running on port 4242'));