import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { createUserAsync, selectLoggedInUserToken } from '../authSlice';
import { selectLoggedInUserInfo } from '../../user/userSlice';

const Register = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [gender, setGender] = useState("male");

    const [error, setError] = useState(false);
    const [emailregErr, setEmailRegErr] = useState(false);
    const [pwdRegErr, setPwdRegErr] = useState(false);
    const [phoneRegErr, setPhoneRegerr] = useState(false);
    const [fullNameRegErr, setFullNameRegErr] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const user = useSelector(selectLoggedInUserInfo);
    const userToken = useSelector(selectLoggedInUserToken);

    const validateEmail = (email) => {
        const emailRegEx = /\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/gi;
        setEmailRegErr(!emailRegEx.test(email));
    };

    const validateName = (name) => {
        const fullNameRegEx = /^(?:([a-zA-Z]{2,4}\.){0,1} ?([a-zA-Z]{2,24})) ([a-zA-Z]{1,1}\. ){0,1}([a-zA-Z]{2,24} ){0,2}([A-Za-z']{2,24})((?:, ([a-zA-Z]{2,5}\.?)){0,4}?)$/im;
        setFullNameRegErr(!fullNameRegEx.test(name));
    };

    const validatePhone = (phone) => {
        const nepalPhoneRegEx = /(?:[0-9]{10})/g;
        setPhoneRegerr(!nepalPhoneRegEx.test(phone));
    };

    const validatePassword = (password) => {
        const passwordRegEx = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;
        setPwdRegErr(!passwordRegEx.test(password));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (emailregErr || phoneRegErr || pwdRegErr) {
            setError(true);
            return;
        }

        if (!fullName || !email || !password || !confirmPassword || !address || !phone || !gender) {
            setError(true);
            return;
        } else {
            dispatch(createUserAsync({ email, password, fullName, phone, gender, role: 'buyer' }));
            navigate('/');
        }
    };

    return (
        <div className='flex h-screen'>
            {userToken && <Navigate to={'/'} replace={true} />}
            <Toaster />
            <div className="flex w-full">
                <div className="hidden lg:flex w-1/2 bg-purple-500 justify-center items-center">
                    <img className='lg:w-3/4 lg:h-auto' src={'/img/registerpageImg.png'} alt="" />
                </div>
                <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-8">
                    <h1 className='text-center text-4xl lg:text-6xl py-5'>Register</h1>
                    <form noValidate onSubmit={handleSubmit} className="w-full max-w-md">
                        <div className="inputBox flex flex-col gap-1 mb-4">
                            <label htmlFor="name">Full Name:</label>
                            <input
                                type="text"
                                name='name'
                                required
                                className='outline-none border-b-2 px-2 py-2 rounded-md shadow-sm'
                                value={fullName}
                                onChange={(e) => {
                                    setFullName(e.target.value);
                                    validateName(e.target.value);
                                }}
                            />
                            {error && !fullName ? (
                                <p className="italic text-red-500">Full name is Required*</p>
                            ) : fullNameRegErr ? (
                                <p className="italic text-red-500">Invalid Name format, Separate by Space*</p>
                            ) : ""}
                        </div>
                        <div className="inputBox flex flex-col gap-1 mb-4">
                            <label htmlFor="email">Email:</label>
                            <input
                                formNoValidate
                                value={email}
                                type="text"
                                name='email'
                                className='outline-none border-b-2 px-2 py-2 rounded-md shadow-sm'
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    validateEmail(e.target.value);
                                }}
                            />
                            {error && !email ? (
                                <p className="italic text-red-500">Email is Required*</p>
                            ) : emailregErr ? (
                                <p className="italic text-red-500">Invalid Email format*</p>
                            ) : ""}
                        </div>
                        <div className="inputBox flex flex-col gap-1 mb-4">
                            <label htmlFor="phone">Phone:</label>
                            <input
                                value={phone}
                                type="number"
                                name='phone'
                                required
                                className='outline-none border-b-2 px-2 py-2 rounded-md shadow-sm'
                                onChange={(e) => {
                                    setPhone(e.target.value);
                                    validatePhone(e.target.value);
                                }}
                            />
                            {error && !phone ? (
                                <p className="italic text-red-500">Phone is Required*</p>
                            ) : phoneRegErr ? (
                                <p className="italic text-red-500">Invalid Phone format*</p>
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
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    validatePassword(e.target.value);
                                }}
                            />
                            {error && !password ? (
                                <p className="italic text-red-500">Password is Required*</p>
                            ) : pwdRegErr ? (
                                <p className="italic text-red-500">
                                    - at least 8 characters
                                    - must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number
                                    - Can contain special characters*
                                </p>
                            ) : ""}
                        </div>
                        <div className="inputBox flex flex-col gap-1 mb-4">
                            <label htmlFor="confirmPassword">Confirm Password:</label>
                            <input
                                value={confirmPassword}
                                type="password"
                                name='confirmPassword'
                                required
                                className='outline-none border-b-2 px-2 py-2 rounded-md shadow-sm'
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            {error && !confirmPassword ? (
                                <p className="italic text-red-500">Confirm password is Required*</p>
                            ) : password !== confirmPassword ? (
                                <p className="italic text-red-500">Password Does not Match*</p>
                            ) : ""}
                        </div>
                        <div className="inputBox flex flex-col gap-1 mb-4">
                            <label htmlFor="address">Address:</label>
                            <input
                                value={address}
                                type="text"
                                name='address'
                                required
                                className='outline-none border-b-2 px-2 py-2 rounded-md shadow-sm'
                                onChange={(e) => setAddress(e.target.value)}
                            />
                            {error && !address ? (
                                <p className="italic text-red-500">Address is Required*</p>
                            ) : ""}
                        </div>
                        <div className="inputBox flex flex-col gap-1 mb-4">
                            <label htmlFor="gender">Gender:</label>
                            <div className="flex flex-row justify-evenly items-center">
                                <div className="flex flex-row gap-1 items-center justify-center">
                                    <label htmlFor="male">Male</label>
                                    <input
                                        defaultChecked
                                        onChange={(e) => setGender(e.target.value)}
                                        type="radio"
                                        name="gender"
                                        value={'male'}
                                        id="male"
                                    />
                                </div>
                                <div className="flex flex-row gap-1 items-center justify-center">
                                    <label htmlFor="female">Female</label>
                                    <input
                                        onChange={(e) => setGender(e.target.value)}
                                        type="radio"
                                        name="gender"
                                        value={'female'}
                                        id="female"
                                    />
                                </div>
                                <div className="flex flex-row gap-1 items-center justify-center">
                                    <label htmlFor="other">Other</label>
                                    <input
                                        onChange={(e) => setGender(e.target.value)}
                                        type="radio"
                                        name="gender"
                                        value={'other'}
                                        id="other"
                                    />
                                </div>
                            </div>
                            {error && !gender ? (
                                <p className="italic text-red-500">Gender is Required*</p>
                            ) : ""}
                        </div>
                        <button type='submit' className='mt-1 bg-blue-500 p-2 w-full text-white rounded-md'>Register</button>
                    </form>
                    <Link to={'/login'} className='italic text-purple-500 text-lg underline mt-4'>Already have an Account? Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;