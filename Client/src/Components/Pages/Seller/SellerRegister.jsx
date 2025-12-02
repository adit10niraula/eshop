import React, { useState } from "react";
import { ToastBar, Toaster } from "react-hot-toast";
import { Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  registerSellerAsync,
  selectLoggedInSeller,
  selectLoggedInUserToken,
} from "../../../features/Auth/authSlice";
import { selectLoggedInUserInfo } from "../../../features/user/userSlice";

const SellerRegister = () => {
  const user = useSelector(selectLoggedInUserInfo);
  const userToken = useSelector(selectLoggedInUserToken);
  const seller = useSelector(selectLoggedInSeller);
  const [businessName, setBusinessName] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      businessName,
      businessAddress,
      businessPassword: password,
    };

    const response = await dispatch(registerSellerAsync(data));
    navigate("/sellerOptions/sellerLogin");
    if (response.error) {
      const errorMessage =
        typeof response.error === "string"
          ? response.error
          : response.error.message || "An error occurred";
      toast.error(errorMessage);
    } else {
      navigate("/sellerOptions/sellerLogin");
      setBusinessAddress("");
      setBusinessName("");
      setPassword("");
      setConfirmPassword("");
    }
  };

  return (
    <>
      {!userToken && <Navigate to={"/"} replace={true} />}
      {seller && (
        <Navigate to={"/sellerOptions/seller-Dashboard"} replace={true} />
      )}
      <div className="flex h-screen">
        <Toaster />
        <div className="hidden lg:flex w-1/2 bg-purple-500 justify-center items-center">
          <img
            className="lg:w-3/4 lg:h-auto"
            src={"/img/registerpageImg.png"}
            alt="Seller Registration"
          />
        </div>
        <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-8">
          <h1 className="text-center text-4xl lg:text-6xl py-5">
            Seller Registration
          </h1>
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md grid gap-4"
          >
            <div className="inputBox flex flex-col gap-1">
              <label htmlFor="businessName">Business Name:</label>
              <input
                type="text"
                name="businessName"
                required
                className="outline-none border-b-2 px-2 py-2 rounded-md shadow-sm"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
              {error && !businessName && (
                <p className="italic text-red-500">Business Name is Required*</p>
              )}
            </div>
            <div className="inputBox flex flex-col gap-1">
              <label htmlFor="businessAddress">Location:</label>
              <input
                value={businessAddress}
                type="text"
                name="businessAddress"
                required
                className="outline-none border-b-2 px-2 py-2 rounded-md shadow-sm"
                onChange={(e) => setBusinessAddress(e.target.value)}
              />
              {error && !businessAddress && (
                <p className="italic text-red-500">Location is Required*</p>
              )}
            </div>
            <div className="inputBox flex flex-col gap-1">
              <label htmlFor="password">Password:</label>
              <input
                value={password}
                type="password"
                name="password"
                required
                className="outline-none border-b-2 px-2 py-2 rounded-md shadow-sm"
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && !password && (
                <p className="italic text-red-500">Password is Required*</p>
              )}
            </div>
            <div className="inputBox flex flex-col gap-1">
              <label htmlFor="confirmPassword">Confirm Password:</label>
              <input
                value={confirmPassword}
                type="password"
                name="confirmPassword"
                required
                className="outline-none border-b-2 px-2 py-2 rounded-md shadow-sm"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {error && !confirmPassword && (
                <p className="italic text-red-500">Confirm Password is Required*</p>
              )}
              {password !== confirmPassword && (
                <p className="italic text-red-500">Passwords do not match*</p>
              )}
            </div>
            <button
              type="submit"
              className="mt-1 bg-blue-500 p-2 w-full text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Register
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default SellerRegister;