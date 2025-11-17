import React, { useEffect, useState } from 'react'
import ProductsInfo from './Insights/ProductsInfo'
import TrendData from './Insights/TrendData';
import { useSelector } from 'react-redux';
import { selectLoggedInSeller } from '../../../features/Auth/authSlice';
import axios from 'axios';





const Insights = () => {

    const seller = useSelector(selectLoggedInSeller);
    const [insights,setInsights]=useState(null);
    const [trendData,setTrendData]=useState(null);
    const fetchSellerProductInsights = async () => {
        const response = await axios.get(`/activity-recommendations/seller/${seller?.id}`);
        console.log("Sss seller",response.data.result.insights);
        setInsights(response.data.result.insights);
        setTrendData(response.data.result.trend_data);

        return response.data;
    }

    useEffect(() => {
        fetchSellerProductInsights();
    },[])
  return (
    <div className='w-[95%] mx-auto flex flex-row gap-4 mt-10'>
        <ProductsInfo products={insights ?? []}/>
        <TrendData trendData={trendData ?? []}/>
    </div>
  )
}

export default Insights