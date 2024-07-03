const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 8080;

const schemaData = mongoose.Schema(
  {
    name: String,
    email: String,
    mobile: Number,
  },
  {
    timestamps: true,
  }
);

const userModal = mongoose.model("user", schemaData);

app.get("/", async (req, res) => {
  const data = await userModal.find({});
  res.json({ success: true, data: data }); // use to get data
});
app.post("/create", async (req, res) => {
  console.log(req.body);
  const data = new userModal(req.body);
  await data.save();
  res.send({ send: true, message: "Data Save Successfully" }); //use to create a new data
});
app.put("/update", async (req, res) => {
  console.log(req.body);
  const { id, ...rest } = req.body;
  console.log(rest);
        //use to update previous data update using (id)
  const data = await userModal.updateOne(
    { _id: id },
      rest,
  );
  res.send({ success: true, message: "Data Updated Successfully", data : data });
});
app.delete("/delete/:id",async(req,res)=>{
    const id = req.params.id;
    console.log(id,"id")
    const data = await userModal.deleteOne({_id : id})
  res.send({ success: true, message: "Data Delete Successfully", data : data });

})
app.patch("/patch", async (req, res) => {
    console.log(req.body);
    const { id, ...rest } = req.body;
    console.log(rest);
          //use to update previous data which are required rest remain same update using (id)
    const data = await userModal.updateOne(
      { _id: id },
        rest,
    );
    res.send({ success: true, message: "Data patchUpdated Successfully", data : data });
  });
mongoose
  .connect("mongodb://localhost:27017/solana_fetch")
  .then(() => console.log("connect to DB"))
  .catch(() => console.log(error));

app.listen(PORT, () => console.log("Server Is Running"));
