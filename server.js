// This is your test secret API key.
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_KEY);
const express = require('express');
const app = express();
const path = require('path');
const cors = require("cors");
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());


const YOUR_DOMAIN = 'http://localhost:3000';

app.post('/create-checkout-session', async (req, res) => {
  const prices = await stripe.prices.list({
    product: "prod_PciXT5us8v9O6i"
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
    success_url: `${YOUR_DOMAIN}/thanks`,
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
        sendMail(customer.email, customer.name);


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

const sendMail = (mail_adress, name,) => {
  var mail = mail_adress;
  var nodemailer = require('nodemailer');
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'butttalksads@gmail.com ',
      pass: process.env.PWD
    }
  });
  var mailOptions = {
    from: 'Butt Talks TV',
    to: mail,
    subject: "SubScription to Butt Talks Tv",
    html: `
    <!DOCTYPE html>
    <html lang="en">
    
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Template</title>
    </head>
    
    <body>
      <div id=":ry" class="ii gt"
        jslog="20277; u014N:xr6bB; 1:WyIjdGhyZWFkLWY6MTc5NTM4MTY5NzkwOTUxMTA4MCJd; 4:WyIjbXNnLWY6MTc5NTM4MTY5NzkwOTUxMTA4MCJd">
        <div id=":rz" class="a3s aiL " style="color:black">
          <div dir="ltr">
            Hello <u>${name}</u>
            <div>
              <br>
            </div>
            <div>
              WELCOME To The Butt Talk's Family. By becoming a member, you are directly supporting the Butt Talks Mission -
              To solve the world’s pooping problems by demystifying the taboo through education and open discussion.&nbsp;
            </div>
            <div>
              <br>
            </div>
            <div>
              Here are our member perks:
            </div>
            <div>
              <ol>
                <li>
                  <a href="https://discord.gg/5aC3qXbq" target="_blank"
                    data-saferedirecturl="https://www.google.com/url?q=https://discord.gg/5aC3qXbq&amp;source=gmail&amp;ust=1712359764950000&amp;usg=AOvVaw2c6o4WWFpDK31Jug-zVglG">
                    Membership to Our Discord Channel
                  </a>
                </li>
                <ul>
                  <li>
                    Exclusive Early Content
                  </li>
                  <li>
                    Live discussions with poop health experts</li>
                  <li>
                    Monthly live discussions with Nurse Wong
                  </li>
                  <li>
                    Anonymous Community Of Supportive Butt Talks Members<br>
                  </li>
                </ul>
                <li><a href="https://apps.apple.com/gb/app/butttalks/id1562714136" target="_blank"
                    data-saferedirecturl="https://www.google.com/url?q=https://apps.apple.com/gb/app/butttalks/id1562714136&amp;source=gmail&amp;ust=1712359764950000&amp;usg=AOvVaw3QDeNibkxgH7N-egQ4y3lQ">
                    Full Access To The Butt Talks App
                  </a>
                </li>
                <ul>
                  <li>Exclusive content about&nbsp;<span>constipation, diarrhea, stomach pain, bloody stools and
                      more...</span>
                  </li>
                  <li>Poop health tracker<br></li>
                  <li>Support each other and compete with others in the Butt Talk's community to obtain the best poop health
                    score</li>
                </ul>
              </ol>
              <div>As a new member, we've also attached our members only - <b>10 Poop commandments Poster
                </b>- That outlines the top 10 rules you should follow when pooping.</div>
            </div>
            <div><br></div>
            <div><i>We are excited to meet you! You have officially begun to walk the path to better poop health and a
                better life!</i></div>
            <div><br></div>
            <div>
              <div>
                <div dir="ltr" class="gmail_signature" data-smartmail="gmail_signature">
                  <div dir="ltr">
                    <table style="color:rgb(80,0,80);border:none">
                      <tbody>
                        <tr>
                          <td rowspan="6"
                            style="border-bottom:none;border-top:none;border-left:none;border-right:1pt solid rgb(26,49,75);padding:0in 3.75pt 0in 0in">
                            <img width="200" height="200"
                              src="https://ci3.googleusercontent.com/mail-sig/AIorK4wxoZX2Rb-7Nj8zcaeJhUDh2WZoMaV9JbiJCEAdmHBhQ2CQt9OjZvNYQ2V68scaMCfN0Lij6W8c8YA7"
                              class="CToWUd a6T" data-bit="iit" tabindex="0">
                            <div class="a6S" dir="ltr" style="opacity: 0.01; left: 161.6px; top: 717.6px;"><span
                                data-is-tooltip-wrapper="true" class="a5q" jsaction="JIbuQc:.CLIENT"><button
                                  class="VYBDae-JX-I VYBDae-JX-I-ql-ay5-ays CgzRE" jscontroller="PIVayb"
                                  jsaction="click:h5M12e; clickmod:h5M12e;pointerdown:FEiYhc;pointerup:mF5Elf;pointerenter:EX0mI;pointerleave:vpvbp;pointercancel:xyn4sd;contextmenu:xexox;focus:h06R8; blur:zjh6rb;mlnRJb:fLiPzd;"
                                  data-idom-class="CgzRE" jsname="hRZeKc" aria-label="Download attachment "
                                  data-tooltip-enabled="true" data-tooltip-id="tt-c45" data-tooltip-classes="AZPksf" id=""
                                  jslog="91252; u014N:cOuCgd,Kr2w4b,xr6bB; 4:WyIjbXNnLWY6MTc5NTM4MTY5NzkwOTUxMTA4MCJd; 43:WyJpbWFnZS9qcGVnIl0."><span
                                    class="OiePBf-zPjgPe VYBDae-JX-UHGRz"></span><span class="bHC-Q" data-unbounded="false"
                                    jscontroller="LBaJxb" jsname="m9ZlFb" soy-skip="" ssk="6:RWVI5c"></span><span
                                    class="VYBDae-JX-ank-Rtc0Jf" jsname="S5tZuc" aria-hidden="true"><span class="bzc-ank"
                                      aria-hidden="true"><svg height="20" viewBox="0 -960 960 960" width="20"
                                        focusable="false" class=" aoH">
                                        <path
                                          d="M480-336 288-528l51-51 105 105v-342h72v342l105-105 51 51-192 192ZM263.717-192Q234-192 213-213.15T192-264v-72h72v72h432v-72h72v72q0 29.7-21.162 50.85Q725.676-192 695.96-192H263.717Z">
                                        </path>
                                      </svg></span></span>
                                  <div class="VYBDae-JX-ano"></div>
                                </button>
                                <div class="ne2Ple-oshW8e-J9" id="tt-c45" role="tooltip" aria-hidden="true">Download</div>
                              </span></div><br>
                          </td>
                          <td style="padding:0in 0in 0in 3.75pt"></td>
                        </tr>
                        <tr>
                          <td style="padding:0in 0in 0in 3.75pt">
                            <div>
                              <font color="#0c343d"><b>
                                  <font size="4">Susan Wong</font>
                                </b>&nbsp;| Nurse Wong<br></font>
                              <font color="#45818e"><b>Butt Talks LLC</b></font>
                            </div>
                            <div><i>
                                <font color="#76a5af">Saving the world, one butt at a&nbsp;</font>
                              </i><i>
                                <font color="#76a5af">time</font>
                              </i><br></div>
                            <div><a href="mailto:ButtTalksTV@gmail.com" target="_blank">ButtTalksTV@gmail.com</a><br></div>
                            <br><a href="https://bit.ly/34w9tGf" style="font-family:Arial,Helvetica,sans-serif"
                              target="_blank"
                              data-saferedirecturl="https://www.google.com/url?q=https://bit.ly/34w9tGf&amp;source=gmail&amp;ust=1712359764950000&amp;usg=AOvVaw3BXURilSKUetGPe5bSt4Cj"><img
                                src="https://ci3.googleusercontent.com/mail-sig/AIorK4y5G2OZhNX6Ucp7w02QPK2dMqGO3ClP4eR4c8o4T9_UzQ21bRM3CvVC7mPTPp1sJH7q5iXmHXB6Su5K"
                                class="CToWUd" data-bit="iit"></a><span
                              style="font-family:Arial,Helvetica,sans-serif">&nbsp; &nbsp;</span><a
                              href="https://www.tiktok.com/@butttalkstv" style="font-family:Arial,Helvetica,sans-serif"
                              target="_blank"
                              data-saferedirecturl="https://www.google.com/url?q=https://www.tiktok.com/@butttalkstv&amp;source=gmail&amp;ust=1712359764950000&amp;usg=AOvVaw2XnwrukKI0EVva83ZQigql"><img
                                src="https://ci3.googleusercontent.com/mail-sig/AIorK4wYRFBcWgviSjjX8Ss_EVLzrSxccXD_ZaHoZgHPcRYFDIZQ2ZRe0MoyxngJOanr0DpAeTJUUW8QV3SW"
                                class="CToWUd" data-bit="iit"></a><span
                              style="font-family:Arial,Helvetica,sans-serif">&nbsp; &nbsp;</span><a
                              href="https://www.instagram.com/butttalkstv/?hl=en"
                              style="font-family:Arial,Helvetica,sans-serif" target="_blank"
                              data-saferedirecturl="https://www.google.com/url?q=https://www.instagram.com/butttalkstv/?hl%3Den&amp;source=gmail&amp;ust=1712359764950000&amp;usg=AOvVaw1b__ZfbWD_NBw_bMBZUeB0"><img
                                src="https://ci3.googleusercontent.com/mail-sig/AIorK4yZAemLuBXj2HzQcNbHi1gBYRUz2zrnJNHKdVI9OepulLxQcRiKadmxml4CufD25ZJd2mx13aAHVi0s"
                                class="CToWUd" data-bit="iit"></a><span
                              style="font-family:Arial,Helvetica,sans-serif">&nbsp; &nbsp;</span><a
                              href="https://butttalkstv.com/" style="font-family:Arial,Helvetica,sans-serif" target="_blank"
                              data-saferedirecturl="https://www.google.com/url?q=https://butttalkstv.com/&amp;source=gmail&amp;ust=1712359764951000&amp;usg=AOvVaw1zTsfaWZKjhO6FcBg6Gibs"><img
                                src="https://ci3.googleusercontent.com/mail-sig/AIorK4zvVLKSW6866ykASeg_y6JJYM3531n9bkxtyRkcUcCHd-TNnu6kwN56ZhDemH4Dm2y06gYCT4sXHMMY"
                                class="CToWUd" data-bit="iit"></a>
                            <font color="#0c343d"><br></font>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <p class="MsoNormal" style="color:rgb(80,0,80)"><b
                        style="color:rgb(204,204,204);font-size:x-small"><br></b></p>
                    <p class="MsoNormal" style="color:rgb(80,0,80)"><b
                        style="color:rgb(204,204,204);font-size:x-small">**<u>DISCLAIMER</u></b><b
                        style="color:rgb(204,204,204);font-size:x-small">&nbsp;</b>
                      <font color="#cccccc" size="1">The information in this email is not intended or implied to be a
                        substitute for professional medical advice, diagnosis, or treatment. All content, including text,
                        graphics, images, and information, contained in our content is for general information purposes only
                        and does not replace a consultation with your own doctor/health professional**</font><br>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="yj6qo"></div>
          <div class="adL"></div>
        </div>
      </div>
    </body>
    </html>
    `,
    attachments: [
      {
        filename: '10_Poop_Commandments_FINAL.pdf', // <= Here: made sure file name match
        path: path.join(__dirname, './public/10_Poop_Commandments_FINAL.pdf'), // <= Here
        contentType: 'application/pdf'
      }
    ]
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });

}
//sendMail("sabribaccar6@gmail.com", "baccar")

app.listen(80, () => console.log('Running on port 4242'));