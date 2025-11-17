import React, { useState } from 'react';
import { ToastBar, Toaster, toast } from 'react-hot-toast';
import { Navigate, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchLoggedInSellerAsync, loginSellerAsync, selectLoggedInSeller, selectLoggedInUserToken } from '../../../features/Auth/authSlice';
import { selectLoggedInUserInfo } from '../../../features/user/userSlice';
import { FaLock } from 'react-icons/fa'; // Importing icon

const SellerLogin = () => {
    const user = useSelector(selectLoggedInUserInfo);
    const userToken = useSelector(selectLoggedInUserToken);
    const seller = useSelector(selectLoggedInSeller);
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = { businessPassword: password };
        await dispatch(loginSellerAsync(data));
    };

    return (
        <>
            {!userToken && <Navigate to={'/'} replace={true} />}
            {seller && <Navigate to={'/sellerOptions/seller-Dashboard'} replace={true} />}
            <div className='flex h-screen'>
                <Toaster />
                <div className="hidden lg:flex w-1/2 bg-purple-500 justify-center items-center">
                    <img className='lg:w-3/4 lg:h-auto' src={'/img/loginpageimg.png'} alt="Seller Login" />
                </div>
                <div className='flex flex-col justify-center items-center w-full lg:w-1/2 p-8'>
                    <h1 className='text-center text-4xl lg:text-6xl py-5'>Seller Login</h1>
                    <form onSubmit={handleSubmit} className="w-full max-w-md">
                        <div className="inputBox flex flex-col gap-1 mb-4">
                            <label htmlFor="password">Password:</label>
                            <div className="flex items-center  px-2 py-2 rounded-md ">
                                <FaLock className="mr-2 text-gray-500" />
                                <input
                                    value={password}
                                    type="password"
                                    name='password'
                                    required
                                    className='outline-none flex-1'
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            {error && !password && (
                                <p className="italic text-red-500">Password is Required*</p>
                            )}
                        </div>
                        <button type='submit' className='mt-1 bg-blue-500 p-2 w-full text-white rounded-md hover:bg-blue-600 transition-colors'>
                            Login
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default SellerLogin;