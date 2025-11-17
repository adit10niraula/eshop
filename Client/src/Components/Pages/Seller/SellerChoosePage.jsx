import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import { fetchLoggedInSellerAsync, selectLoggedInSeller } from '../../../features/Auth/authSlice';
import { selectLoggedInUserInfo } from '../../../features/user/userSlice';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa'; // Importing icons

const SellerChoosePage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectLoggedInUserInfo);
  const seller = useSelector(selectLoggedInSeller);

  return (
    <>
      {!user && <Navigate to={'/'} replace={true} />}
      {seller && <Navigate to={'/sellerOptions/seller-Dashboard'} replace={true} />}
      <div className='flex h-screen'>
        <div className="hidden lg:flex w-1/2 bg-purple-500 justify-center items-center">
          <img className='lg:w-3/4 lg:h-auto' src={'/img/registerpageImg.png'} alt="Seller Options" />
        </div>
        <div className='flex flex-col justify-center items-center w-full lg:w-1/2 p-8'>
          <h3 className="font-bold text-4xl lg:text-6xl py-5">Seller Access</h3>
          <div className="flex flex-col gap-10 p-5 mt-2 bg-white rounded-lg w-full max-w-md">
            <Link to={'sellerLogin'} className='transform transition-transform hover:scale-105'>
              <button className='flex items-center justify-center gap-2 bg-indigo-600 px-5 py-4 text-white font-bold rounded-full w-full'>
                <FaSignInAlt /> Seller Login
              </button>
            </Link>
            <Link to={'sellerRegister'} className='transform transition-transform hover:scale-105'>
              <button className='flex items-center justify-center gap-2 bg-teal-600 px-5 py-4 text-white font-bold rounded-full w-full'>
                <FaUserPlus /> Seller Registration
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default SellerChoosePage;