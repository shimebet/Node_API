const express = require('express')
const mongoose = require('mongoose');
const Support = require('./models/itSupportModels');
const app = express()
const port = 3000

app.use(express.json())
app.use(express.urlencoded({extended: false}))

//routes

// get all data
app.get('/support', async(req, res) => {
  try{
    const support = await Support.find({})
    res.status(200).json(support);
  }catch (error) {
    console.log(error.message);
    res.status(500).json({message: error.message})
  }
})

//get data by id
app.get('/support/:id', async(req, res) => {
  try{
    const {id} = req.params;
    const support = await Support.findById(id);
    res.status(200).json(support);
  }catch (error) {
    console.log(error.message);
    res.status(500).json({message: error.message})
  }
})

// post data
app.post('/support', async(req, res) =>{
try{
const support = await Support.create(req.body)
res.status(200).json(support);

}catch (error) {
  console.log(error.message);
  res.status(500).json({message: error.message})
}
})

//update data
app.put('/support/:id', async(req, res) => {
  try{
    const {id} = req.params;
    const support = await Support.findByIdAndUpdate(id, req.body);
    if(!support){
    res.status(400).json({message: `can not find any data with Id ${id}`});
    }
    const updateSupport = await Support.findById(id);
    res.status(200).json(updateSupport);
  }catch (error) {
    console.log(error.message);
    res.status(500).json({message: error.message})
  }
})

//delete data
app.delete('/support/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const support = await Support.findByIdAndDelete(id);

    if (!support) {
      return res.status(400).json({ message: `Cannot find any data with ID ${id}` });
    }

    res.status(200).json({ message: "Support entry deleted successfully", support });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

//create mongoo db connection
mongoose.set("strictQuery", false)
mongoose.connect('mongodb+srv://shimelis206:RpmTHAR1So2Mqe28@itsupportdb.lfnnv.mongodb.net/Node-API?retryWrites=true&w=majority&appName=ITSUPPORTDB')
  .then(() =>{
    console.log('Connected to Mongoo DB!')
    app.listen(port, () => {
      console.log(`Example app listening on port ${port}`)
    })
  }).catch(()=>{
    console.log(error)
  })