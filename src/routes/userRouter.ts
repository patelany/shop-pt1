import express from "express";
import { errorResponse } from "../utils";
import { getClient } from "../db";
import User from "../models/User";
import { ObjectId } from "mongodb";

const userRouter = express.Router();

// build our endpoints
userRouter.get("/users/:id", async (req, res) => {
  const idToFind: string = req.params.id;
  try {
    const client = await getClient();
    const foundUser: User | null = await client
      .db()
      .collection<User>("users")
      .findOne({ _id: new ObjectId(idToFind) });
    if (foundUser) {
      res.status(200).json(foundUser);
    } else {
      res.status(404).json({ message: "_id not found" });
    }
  } catch (err) {
    errorResponse(err, res);
  }
});

userRouter.post("/users", async (req, res) => {
  const newUser: User = req.body;
  try {
    const client = await getClient();
    await client.db().collection<User>("users").insertOne(newUser);
    res.status(201).json(newUser);
  } catch (err) {
    errorResponse(err, res);
  }
});

userRouter.put("/users/:id", async (req, res) => {
  // what to replace (path params)
  const idToReplace: string = req.params.id;
  // what to replace it with (req body)
  const newUser: User = req.body;
  delete newUser._id;
  try {
    const client = await getClient();
    const result = await client
      .db()
      .collection<User>("users")
      .replaceOne({ _id: new ObjectId(idToReplace) }, newUser);
    if (result.matchedCount > 0) {
      newUser._id = new ObjectId(idToReplace);
      res.status(200).json(newUser);
    } else {
      res.status(404).json({ message: "_id not found" });
    }
  } catch (err) {
    errorResponse(err, res);
  }
});

userRouter.delete("/users/:id", async (req, res) => {
  const idToDelete: string = req.params.id;
  try {
    const client = await getClient();
    const result = await client
      .db()
      .collection<User>("users")
      .deleteOne({ _id: new ObjectId(idToDelete) });
    if (result.deletedCount > 0) {
      res.sendStatus(204); //successful response
    } else {
      res.status(404).json({ message: "_id not found" });
    }
  } catch (err) {
    errorResponse(err, res);
  }
});
// then
export default userRouter;
