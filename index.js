const express = require("express");
const cors = require("cors");
const jwt= require('jsonwebtoken');
const cookieParser= require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors(
  {
    origin:  ['http://localhost:5173'] ,   //kon jaigai theke set korte chaitcho
    Credentials: true, //
  }
));
app.use(express.json());

app.use(cookieParser());
// }
//hSZnoP8LwOaX1OO1
//docUser

const uri =
  "mongodb+srv://docUser:hSZnoP8LwOaX1OO1@cluster0.7bbp7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
console.log(uri);
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)

    const serviceCollection = client.db("carDoctor").collection("services");
    const bookingsCollection = client.db("carDoctor").collection("bookings");
    //auth related api 
    app.post('/jwt', async(req,res)=>{

      const user=req.body;
      console.log(user);
      const token= jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn: '1h'})
     
     res 
     .cookie("token",token ,{
        httpOnly:true, //client site theke access pabo  nah 
        secure:false ,//http://localhost:5173/ https thake true deoya lagto
        sameSite:'none',
     }) 
     
      .send({success: true});
    })


    //servicews related api 
    app.get("/services", async (req, res) => {
      const cursor = serviceCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const options = {
        projection: { title: 1, price: 1, service_id: 1, description: 1,img:1 },
      };

      const result = await serviceCollection.findOne(query, options);
      res.send(result);
    });
    //bookings
    app.get("/bookings", async (req, res) => {
      console.log(req.query.email);
      console.log('lottle token',req.cookies)
      let query ={};
      if (req.query?.email){
        query = {email: req.query.email}
      }
      const result = await bookingsCollection.find().toArray();
      res.send(result);
    });

    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      console.log(booking);
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    });
    
    app.patch('/bookings/:id',async (req,res)=>{
      const id= req.params.id;
      const query= { _id: new ObjectId(id)};
      const updateBookings = req.body;
      console.log(updateBookings);
      const updateDoc={
        $set: {
           status: updateBookings.status
        },
      };
      const result= await bookingsCollection.updateOne(query,updateDoc);
      res.send(result);
    })

    app.delete("/bookings/:id", async (req, res) =>{
      const id= req.params.id;
      const query= { _id: new ObjectId(id)};
      const result= await bookingsCollection.deleteOne(query);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
