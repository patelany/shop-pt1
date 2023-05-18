import express from "express";
import { getClient } from "../db";
import Product from "../models/Product";
import QueryDoc from "../models/QueryDoc";
import { ObjectId } from "mongodb";
import { errorResponse } from "../utils";

const productsRouter = express.Router();

// build our endpoints
// this GET method only works one query param at a time
productsRouter.get("/products-dontusethis", async (req, res) => {
  const maxPrice: string = req.query["max-price"] as string;
  //   console.log(maxPrice);
  const includes: string = req.query.includes as string;
  console.log(includes);
  const limit: string = req.query.limit as string;

  try {
    const client = await getClient();
    if (limit) {
      // db.products.find().limit(3)-- compass command
      const productArray = await client
        .db()
        .collection<Product>("products")
        .find()
        .limit(+limit)
        .toArray();
      res.status(200).json(productArray);
    } else if (includes) {
      // db.products.find({name: /water/i}) -- compass command
      const productArray = await client
        .db()
        .collection<Product>("products")
        .find({ name: new RegExp(includes, "i") })
        .toArray();
      res.status(200).json(productArray);
    } else if (maxPrice) {
      // if maxPrice is a query param (truthy)
      // db.products.find({price: {$lte: 7}}); -- what we wrote in compass
      const productArray = await client
        .db()
        .collection<Product>("products")

        .find({ price: { $lte: +maxPrice } })
        .toArray();
      res.status(200).json(productArray);
    } else {
      // respond with everything if maxPrice is falsey
      const productArray = await client
        .db()
        .collection<Product>("products")
        .find()
        .toArray();
      res.status(200).json(productArray);
    }
  } catch (error) {
    errorResponse(error, res);
  }
});

// this GET will work in any combo of query params
productsRouter.get("/products", async (req, res) => {
  const maxPrice: number = +(req.query["max-price"] as string);
  const { includes, limit } = req.query;
  //   build dynamic query document for the find()
  const queryDocument: QueryDoc = {};
  //   check our params and modify query doc
  if (maxPrice) {
    queryDocument.price = { $lte: maxPrice };
  }
  if (includes) {
    queryDocument.name = new RegExp(includes as string, "i");
  }
  //   console.log(queryDocument);
  try {
    // setting up communication with mongo
    const client = await getClient();
    // setting up mongo command
    let command = client
      .db()
      .collection<Product>("products")
      .find(queryDocument); //include dynamic query document based on query params
    if (limit) {
      command = command.limit(+(limit as string));
    }
    const results = await command.toArray();
    res.status(200).json(results);
  } catch (error) {
    errorResponse(error, res);
  }
});

productsRouter.get("/products/:id", async (req, res) => {
  const idImLookingFor: string = req.params.id;
  console.log(idImLookingFor);
  //   compass command:
  // db.products.findOne({_id: ObjectId('646660feff12f198fc8c4b07')})
  try {
    const client = await getClient();
    const foundProduct: Product | null = await client
      .db()
      .collection<Product>("products")
      .findOne({ _id: new ObjectId(idImLookingFor) });
    if (foundProduct) {
      res.status(200).json(foundProduct);
    } else {
      res.status(404).json({ message: "ID not found" });
    }
  } catch (err) {
    errorResponse(err, res);
  }
});

productsRouter.post("/products", async (req, res) => {
  const newProduct: Product = req.body;
  try {
    const client = await getClient();
    await client.db().collection<Product>("products").insertOne(newProduct);
    res.status(201).json(newProduct);
  } catch (err) {
    errorResponse(err, res);
  }
});

productsRouter.put("/products/:id", async (req, res) => {
  // what to replace (path params)
  const idToReplace: string = req.params.id;
  // what to replace it with (req body)
  const newProduct: Product = req.body;
  delete newProduct._id;
  try {
    const client = await getClient();
    const result = await client
      .db()
      .collection<Product>("products")
      .replaceOne({ _id: new ObjectId(idToReplace) }, newProduct);
    if (result.matchedCount > 0) {
      newProduct._id = new ObjectId(idToReplace);
      res.status(200).json(newProduct);
    } else {
      res.status(404).json({ message: "_id not found" });
    }
  } catch (err) {
    errorResponse(err, res);
  }
});

productsRouter.delete("/products/:id", async (req, res) => {
  const idToDelete: string = req.params.id;
  try {
    const client = await getClient();
    const result = await client
      .db()
      .collection<Product>("products")
      .deleteOne({ _id: new ObjectId(idToDelete) });
    if (result.deletedCount > 0) {
      res.sendStatus(204); //successful response - no content;
    } else {
      res.status(404).json({ message: "_id not found" });
    }
  } catch (err) {
    errorResponse(err, res);
  }
});
export default productsRouter;
