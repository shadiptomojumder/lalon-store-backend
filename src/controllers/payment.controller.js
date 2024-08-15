import SSLCommerzPayment from "sslcommerz-lts";
import { Order } from "../models/order.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const tran_id = Math.floor(100000 + Math.random() * 900000).toString();
const store_id = process.env.SSL_STORE_ID;
const store_passwd = process.env.SSL_STORE_PASSWORD;
const is_live = false; //true for live, false for sandbox

const paymentInit = asyncHandler(async (req, res) => {
    console.log("The paymentInit request body is:", req.body);
    const {
        userId,
        username,
        deliveryAddress,
        phoneNumber,
        productIds,
        totalAmmount,
    } = req.body;
    console.log("body is :", req.body);

    if (
        [userId, username, deliveryAddress, phoneNumber, totalAmmount].some(
            (field) =>
                typeof field === "string" ? field.trim() === "" : !field
        )
    ) {
        throw new ApiError(400, "Fill all the fields");
    }
    // Here i create product in database
    const order = await Order.create({
        userId,
        username,
        deliveryAddress,
        phoneNumber,
        productIds,
        totalAmmount,
        transactionId: tran_id,
    });

    if (!order) {
        throw new ApiError(500, "Something went worng when creating product");
    }
    console.log("creeted order is:", order);

    try {
        const data = {
            total_amount: totalAmmount,
            currency: "BDT",
            tran_id: tran_id, // use unique tran_id for each api call
            success_url: `${process.env.BACKEND_HOST_LIVE}/api/payment/success/${tran_id}`,
            fail_url: "http://localhost:3000/failed",
            cancel_url: "http://localhost:3000/cancle",
            ipn_url: "http://localhost:3000/ipn",
            shipping_method: "Courier",
            product_name: "Computer.",
            product_category: "Electronic",
            product_profile: "general",
            cus_name: username,
            cus_email: "customer@example.com",
            cus_add1: deliveryAddress,
            cus_add2: "Dhaka",
            cus_city: "Dhaka",
            cus_state: "Dhaka",
            cus_postcode: "1000",
            cus_country: "Bangladesh",
            cus_phone: phoneNumber,
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
        //console.log("Redirecting to oppo: ", paymentGetwaydata);

        return res
            .status(201)
            .json(
                new ApiResponse(
                    200,
                    { paymentGetwaydata },
                    "paymentInit created"
                )
            );
        //return res.redirect(paymentGetwaydata?.GatewayPageURL:)
    } catch (error) {
        console.error("Error paymentInit:", error);
        return res
            .status(500)
            .json(new ApiError(500, "Internal server paymentInit error"));
    }
});

const paymentSuccess = asyncHandler(async (req, res) => {
    console.log("tranId is ", req.params.tranId);
    const transactionId = req.params.tranId;

    const updatedProduct = await Order.findOneAndUpdate(
      { transactionId: transactionId },
        {
            $set: {
                paymentStatus: true,
            },
        },
        { new: true }
    );

    return res.redirect(`${process.env.FORNTEND_HOST_live}`);
});

export { paymentInit, paymentSuccess };
