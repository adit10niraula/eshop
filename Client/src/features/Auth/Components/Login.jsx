import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
    checkIfUserAsync,
    checkUserAsync,
    loginUserAsync,
    selectLoggedInUserToken,
} from '../authSlice';
import { selectLoggedInUserInfo } from '../../user/userSlice';
import { getCartByEmailAsync } from '../../cart/cartSlice';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const [error, setError] = useState(false);
    const [emailregErr, setEmailRegErr] = useState();
    const [pwdRegErr, setPwdRegErr] = useState();
    const dispatch = useDispatch();

    const user = useSelector(selectLoggedInUserInfo);
    const userToken = useSelector(selectLoggedInUserToken);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const emailRegEx = /\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/gi;
        const passwordRegEx = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;
        if (!email || !password) {
            setError(true);
        }
        if (!emailRegEx.test(email)) {
            setEmailRegErr(true);
        } else {
            dispatch(loginUserAsync({ email, password }));
            dispatch(getCartByEmailAsync());
        }
    };

    useEffect(() => {
        dispatch(checkIfUserAsync());
        dispatch(checkUserAsync());
    }, []);

    return (
        <div className='flex h-screen'>
            <Toaster />
            {userToken && <Navigate to={'/'} replace={true} />}
            <div className="flex w-full">
                <div className="hidden lg:flex w-1/2 bg-purple-500 justify-center items-center">
                    <img className='lg:w-3/4 lg:h-auto' src={'/img/loginpageimg.png'} alt="" />
                </div>
                <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-8">
                    <h1 className='text-center text-4xl lg:text-6xl py-5'>Login</h1>
                    <form noValidate onSubmit={handleSubmit} className="w-full max-w-md">
                        <div className="inputBox flex flex-col gap-1 mb-4">
                            <label htmlFor="email">Email:</label>
                            <input
                                value={email}
                                type="text"
                                name='email'
                                required
                                className='outline-none border-b-2 px-2 py-2 rounded-md shadow-sm'
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {error && !email ? (
                                <p className="italic text-red-500">Email is Required*</p>
                            ) : emailregErr ? (
                                <p className="italic text-red-500">Invalid Email format*</p>
                            ) : ""}
                        </div>

                        <div className="inputBox flex flex-col gap-1 mb-4">
                            <label htmlFor="password">Password:</label>
                            <input
                                value={password}
                                type="password"
                                name='password'
                                required
                                className='outline-none border-b-2 px-2 py-2 rounded-md shadow-sm'
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {error && !password ? (
                                <p className="italic text-red-500">Password is Required*</p>
                            ) : ""}
                        </div>

                        <button type='submit' className='mt-1 bg-blue-500 p-2 w-full text-white rounded-md'>Login</button>
                    </form>
                    <Link to={'/register'} className='italic text-purple-500 text-lg underline mt-4'>Create an Account</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;