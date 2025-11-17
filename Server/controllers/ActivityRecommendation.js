exports.fetchActivityRecommendation = async (req, res) => {
    try {
      const { id } = req.user; 
     
    const response=await fetch(`http://127.0.0.1:5000/ml-recommendation/${id}`,{
        method: 'GET',
    })

    const result=await response.json(); 
    // console.log(result)
    res.status(200).json({success:true,message:"Recommendations Fetched",result})
} catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message,result:[] });
    }
  };

  exports.fetchActivityRecommendationML = async (req, res) => {
    try {
      const { id } = req.user; 
     
    const response=await fetch(`http://127.0.0.1:5000/ml-recommendation-new/${id}`,{
        method: 'GET',
    })

    const result=await response.json(); 
    // console.log(result)
    res.status(200).json({success:true,message:"Recommendations Fetched",result})
} catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message,result:[] });
    }
  };
exports.fetchInteractionRecommendation = async (req, res) => {
    try {
      const { id } = req.user; 
      
      const response=await fetch(`http://127.0.0.1:5000/recommend/${id}`,{
        method: 'GET',
    })

    const result=await response.json(); 
    console.log("sdfdddddddddddddddddddddddd",result)
    res.status(200).json({success:true,message:"Recommendations Fetched",result})
} catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message,result:[] });
    }
  };
exports.fetchSellerInsights=async(req,res)=>{
  try {
    const { seller } = req.params;
    const response=await fetch(`http://127.0.0.1:5000/seller-insights-new/${seller}`,{
        method: 'GET',
    })

    const result=await response.json(); 
    console.log(result)
    res.status(200).json({success:true,message:"Insights Fetched",result})
  } catch (error) {
    console.error(error);
      res.status(500).json({ success: false, error: error.message,result:[] });
  }
  }