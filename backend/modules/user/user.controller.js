const express = require("express");
const { createUser, getAllUsers, deleteUserById } = require("./userService");
const { GetSessionData } = require("./auth.service");

const router = express.Router();

router.get("/me", async (req, res, next) => {
  try {
    const user = await GetSessionData(req.user.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});
router.get("/", async (req, res, next) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

router.post("/create", async (req, res, next) => {
  try {
    const user = await createUser(req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const user = await deleteUserById(req.params.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
