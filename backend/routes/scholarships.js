const express = require('express');
const router = express.Router();
const scholarshipdetails = require('../model/scholarshipdetails'); // import model
// GET all scholarship details
router.get('/', async (req, res) => {
  try {
    const details = await scholarshipdetails.find();
    res.json(details);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching details', error });
  }
});

router.get('/:scid',async(req,res)=>{
    try{
        const {scid}=req.params;
        const fulldt=await scholarshipdetails.findById(scid);
        res.json(fulldt);

    }catch(error){
        res.status(500).json({message:'Error fetching full details',error})
    }
});



module.exports = router;
