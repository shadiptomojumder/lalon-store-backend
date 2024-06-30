import SSLCommerzPayment from "sslcommerz-lts";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";


const tran_id = Math.floor(100000 + Math.random() * 900000).toString();
const store_id = process.env.SSL_STORE_ID;
const store_passwd = process.env.SSL_STORE_PASSWORD;
const is_live = false; //true for live, false for sandbox

const paymentInit = asyncHandler(async (req, res) => {
  console.log("The paymentInit request body is:", req.body);
  const { name , phone } = req.body;

  try {
    const data = {
      total_amount: 100,
      currency: "BDT",
      tran_id: tran_id, // use unique tran_id for each api call
      success_url: `${process.env.SERVER_API}/payment/success/${tran_id}`,
      fail_url: "http://localhost:3000/failed",
      cancel_url: "http://localhost:3000/cancle",
      ipn_url: "http://localhost:3000/ipn",
      shipping_method: "Courier",
      product_name: "Computer.",
      product_category: "Electronic",
      product_profile: "general",
      cus_name: name,
      cus_email: "customer@example.com",
      cus_add1: "Dhaka",
      cus_add2: "Dhaka",
      cus_city: "Dhaka",
      cus_state: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: phone,
      cus_fax: "01711111111",
      ship_name: "Customer Name",
      ship_add1: "Dhaka",
      ship_add2: "Dhaka",
      ship_city: "Dhaka",
      ship_state: "Dhaka",
      ship_postcode: 1000,
      ship_country: "Bangladesh",
    };

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    // Return GatewayPageURL after the promise is resolved
    const paymentGetwaydata = await sslcz.init(data);
    // console.log("Redirecting to oppo: ", paymentGetwaydata);

    return res.status(201).json(new ApiResponse(200,{paymentGetwaydata}, "paymentInit created"));
  } catch (error) {
    console.error("Error paymentInit:", error);
    return res
      .status(500)
      .json(new ApiError(500, "Internal server paymentInit error"));
  }
});

const paymentSuccess = asyncHandler(async (req, res) => {
  console.log("tranId is " + req.params.tranId);

});


export { paymentInit , paymentSuccess };
