import { Request, Response } from "express";
import carts from "../models/Cart";
import Cart from "../models/Cart";
import Stripe from "stripe";
import Patient from "../models/Patient";
import User from "../models/User";
import orders from "../models/Order";
import { HydratedDocument } from "mongoose";
import medicine, { Imedicine } from "../models/medicine";
import SendEmailsService from "../services/sendEmail";

import axios from "axios";
const stripe = new Stripe(
    "sk_test_51O9bKeHqEqnZHrbzSpBS6JOvMryqZfvDolGqcPDOb19E9gXdSe3rKy5UbUgCOmqLVFyHxn1U0Fp7G3IFujKuYhn500g0lhxoDO"
);

export const payCCShoppingCart = async (req: Request, res: Response) => {
    try {
        const empty: { receiver: string; content: string; link: string }[] = [];
        console.log("entered payCCShoppingCart");
        console.log(req.body.pId);
        const cartId = (await Cart.find({ patient: req.body.pId }))[0]._id;
        const meds = (await Cart.findById(cartId))?.medicines;
        console.log("before stripe");
        const { medicines, total, address } = req.body;
        const paymentMethod = "Credit Card";

        const patientId = req.body.pId;
        //console.log("HII");
        console.log(medicines, total, address, paymentMethod, patientId);
        if (medicines.length === 0 || total === 0) {
            return;
        }
        try {
            for (const med of medicines) {
                const med2: HydratedDocument<Imedicine> | null = await medicine.findOne({ name: med.medName });
                if (!med2 || med2.availableQuantity === 0) {
                    return;
                }
                med2.availableQuantity -= med.medQuantity; //TODO names

                if (med2.availableQuantity === 0) {
                    const subject = "Medicince Out of Stock";
                    let html = `Hello pharmacist, <br /> The medicine ${med2.name} is out of stock. <br /> Try to order new stock ASAP. <br /> With Love, <br /> El7a2ni Pharmacy xoxo.`;
                    await User.find({ __t: "pharmacist" })
                        .select("email")
                        .then((res) => {
                            res.map((p) => {
                                console.log("p", p);
                                SendEmailsService.sendMail(p.email, subject, html);
                                // empty.push({ "receiver": p._id, "content": "The medicine ${med2.name} is out of stock.", "link": "/pharmacist/medicines" });
                                axios.post("http://localhost:8000/notifications", {
                                    receiver: p._id as string,                           
                                    content: `The medicine ${med2.name} is out of stock.`,
                                    link: "/pharmacist/medicines"
                                });
                            });
                        });
                }
                await med2.save();
            }
            const order = new orders({
                patient: patientId,
                status: "pending",
                date: new Date(),
                total: total,
                address: address,
                paymentMethod: paymentMethod,
                medicines: medicines
            });

             await order.save();
        } catch (error) {
            console.error(error);
        }

        try {
            const cart = await carts.findOne({ patient: patientId });
            if (!cart) {
                return;
            }
            cart.medicines = [];
            await cart.save();
        } catch (error) {
            console.error(error);
        }

        ///post(`http://localhost:8001/orders/${req.body.pId}/add`, { medicines:req.body.meds, total:req.body.total, address:req.body.address, paymentMethod:"Credit Card" })
        //put(`http://localhost:8001/cart/${req.body.pId}/empty`)
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: meds?.map((item: any) => {
                return {
                    price_data: {
                        currency: "EGP",
                        product_data: {
                            name: item.medName
                        },
                        unit_amount: item.medPrice * 100
                    },
                    quantity: item.medQuantity
                };
            }),
            success_url: `http://localhost:3001/patient/orders`,
            cancel_url: `http://localhost:3001/patient/checkout`
        });
        res.json({ url: session.url, empty: empty });
    } catch (e) {
        console.log(e);
        res.status(500).json(e);
    }
};

export const payWalletShoppingCart = async (req: Request, res: Response) => {
    const empty: { receiver: string; content: string; link: string }[] = [];
    const userId = req.body.id;
    console.log("user id " + userId);
    const userCart = Cart.find({ patient: userId }).then(async (result) => {
        var totalAmount = 0;
        for (const med of result[0].medicines) {
            totalAmount += med.medPrice * med.medQuantity;
        } // TODO:to be cnahged to be taken from the logged in session

        // TODO: Display these messages  in the fe
        // assumimg id of user is given through req.body
        //TODO:UPDATE ID to be taken from logined in session
        // assuming patient id is took from logged in session
        const pat = await Patient.findById(userId);
        const walletValue = pat?.wallet;
        console.log(walletValue + " " + totalAmount);
        if (totalAmount != undefined && walletValue != undefined) {
            if (walletValue < totalAmount) {
                res.status(400).json(
                    "Payment cannot be completed because credit not in wallet : Amount to be paid  " +
                        totalAmount +
                        " current wallet balance " +
                        walletValue
                );
            } else {
                const update = {
                    // Define the fields you want to update and their new values
                    wallet: walletValue && totalAmount ? walletValue - totalAmount : undefined
                };

                // Set options for the update
                const options = {
                    new: true // Return the updated document after the update
                };

                // Use findOneAndUpdate to find and update the document
                const filter = { _id: userId };
                const updateWallet = await Patient.findOneAndUpdate(filter, update, options);

                const newWallet = walletValue && totalAmount ? walletValue - totalAmount : undefined;
                const cart: any = result[0];
                //console.log("cart", cart);
                const meds: any[] = cart.medicines;
                //console.log("medicines", meds);
                for (const med of meds) {
                    const med2: HydratedDocument<Imedicine> | null = await medicine.findOne({ name: med.medName });
                    if (!med2) {
                        return;
                    }
                    console.log("med2", med2);
                    med2.availableQuantity -= med.medQuantity; //TODO names

                    if (med2.availableQuantity === 0) {
                        const subject = "Medicince Out of Stock";
                        let html = `Hello pharmacist, <br /> The medicine ${med2.name} is out of stock. <br /> Try to order new stock ASAP. <br /> With Love, <br /> El7a2ni Pharmacy xoxo.`;
                        await User.find({ __t: "pharmacist" })
                            .select("email")
                            .then((res) => {
                                res.map((p) => {
                                    console.log("p", p);
                                    SendEmailsService.sendMail(p.email, subject, html);
                                    empty.push({
                                        receiver: p._id as string,
                                        content: `The medicine ${med2.name} is out of stock.`,
                                        link: "/pharmacist/medicines"
                                    });
                                });
                            });
                    }
                    await med2.save();
                }
                //const order = new orders({
                //	patient: patientId,
                //	status: "pending",
                //	date: new Date(),
                //	total: total,
                //	address: address,
                //	paymentMethod: paymentMethod,
                //	medicines: medicines,
                //});

                //await order.save();
                res.status(200).json({ message: "Payment successful , new wallet value :" + newWallet, empty: empty });
            }
        } else {
            if (!totalAmount) res.status(404).send("totalAmount is undefined");
            else res.status(404).send("wallet is undefined");
        }
    });
};

export const payCashOnDelivery = async (req: Request, res: Response) => {
    const empty: { receiver: string; content: string; link: string }[] = [];
    const userId = req.body.id;
    console.log("user id " + userId);
    const userCart = Cart.find({ patient: userId }).then(async (result) => {
        var totalAmount = 0;
        for (const med of result[0].medicines) {
            totalAmount += med.medPrice * med.medQuantity;
        } // TODO: to be changed to be taken from the logged-in session

        // TODO: Display these messages in the frontend
        // assuming id of the user is given through req.body
        // TODO: UPDATE ID to be taken from logged-in session
        // assuming patient id is taken from the logged-in session
        const pat = await Patient.findById(userId);
        const walletValue = pat?.wallet;
        console.log(walletValue + " " + totalAmount);

        const cart: any = result[0];
        const meds: any[] = cart.medicines;
        for (const med of meds) {
            const med2: HydratedDocument<Imedicine> | null = await medicine.findOne({ name: med.medName });
            if (!med2) {
                return;
            }
            console.log("med2", med2);
            med2.availableQuantity -= med.medQuantity; // TODO names

            if (med2.availableQuantity === 0) {
                const subject = "Medicine Out of Stock";
                let html = `Hello pharmacist, <br /> The medicine ${med2.name} is out of stock. <br /> Try to order new stock ASAP. <br /> With Love, <br /> El7a2ni Pharmacy xoxo.`;
                await User.find({ __t: "pharmacist" })
                    .select("email")
                    .then((res) => {
                        res.map((p) => {
                            console.log("p", p);
                            SendEmailsService.sendMail(p.email, subject, html);
                            empty.push({
                                receiver: p._id as string,
                                content: `The medicine ${med2.name} is out of stock.`,
                                link: "/pharmacist/medicines"
                            });
                        });
                    });
            }
            await med2.save();
        }
    });
};

// Make sure to handle errors and send a response to the client.

