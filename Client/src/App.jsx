import React, { useEffect } from 'react';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { Routes, Route, useLocation } from 'react-router-dom';
import TopNavbar from './Components/Layout/TopNavbar';
import NavBar from './features/Navbar/NavBar';
import Homepage from './Components/Layout/Homepage';
import RegisterPage from './Components/Pages/RegisterPage';
import LoginPage from './Components/Pages/LoginPage';
import CartPage from './Components/Pages/CartPage';
import CheckoutPage from './Components/Pages/CheckoutPage';
import Protected from './features/Auth/Components/Protected';
import SingleProductPage from './features/product/SingleProductPage';
import Error404NotFound from './Components/Pages/404NotFound';
import OrderSuccessPage from './Components/Pages/OrderSuccessPage';
import UserOrders from './features/user/Components/UserOrders';
import UserInfo from './features/user/Components/UserInfo';
import LogoutPage from './Components/Pages/LogoutPage';
import ChangePassword from './Components/Pages/Password/ChangePassword';
import SellerChoosePage from './Components/Pages/Seller/SellerChoosePage';
import SellerLogin from './Components/Pages/Seller/SellerLogin';
import ProtectedSeller from './features/Auth/Components/ProtectedSeller';
import SellerDashboard from './Components/Pages/Seller/SellerDashboard';
import SellerRegister from './Components/Pages/Seller/SellerRegister';
import ProductPage from './Components/Pages/Seller/ProductPage';
import ProductForm from './Components/Pages/Seller/ProductForm';
import EditProduct from './Components/Pages/Seller/EditProduct';
import AdminOrder from './features/order/AdminOrder';
import WishList from './features/WishList/Components/WishList';
import PasswordChange from './Components/Pages/Seller/PasswordChange';
import Insights from './Components/Pages/Seller/Insights';
import { fetchLoggedInUserInfoAsync, selectLoggedInUserInfo } from './features/user/userSlice';
import { checkIfUserAsync, checkUserAsync, selectLoggedInUserToken } from './features/Auth/authSlice';
import { getCartByEmailAsync } from './features/cart/cartSlice';
import { fetchUserWishlistAsync } from './features/WishList/wishlistSlice';

axios.defaults.baseURL = 'http://localhost:8080';
axios.defaults.withCredentials = true;

const App = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectLoggedInUserInfo);
  const userToken = useSelector(selectLoggedInUserToken);
  const location = useLocation();

  useEffect(() => {
    dispatch(fetchLoggedInUserInfoAsync());
    dispatch(getCartByEmailAsync());
    dispatch(fetchUserWishlistAsync());
  }, [userToken]);

  useEffect(() => {
    dispatch(checkIfUserAsync());
    dispatch(checkUserAsync());
  }, []);

  const isAuthPage = ['/login', '/register', '/sellerOptions', '/sellerOptions/sellerRegister', '/sellerOptions/sellerLogin'].includes(location.pathname);

  return (
    <div className='scroll-smooth'>
      {!isAuthPage && <TopNavbar />}
      {!isAuthPage && <NavBar />}
      <Toaster />
      <Routes>
        <Route path='/' element={<Homepage />} />
        <Route path='/register' element={<RegisterPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/logout' element={<LogoutPage />} />
        <Route path='/change-password' element={<Protected><ChangePassword /></Protected>} />
        <Route path='/cart' element={<Protected><CartPage /></Protected>} />
        <Route path='/checkout' element={<Protected><CheckoutPage /></Protected>} />
        <Route path='/products/:id' element={<SingleProductPage />} />
        <Route path='/sellerOptions' element={<Protected><SellerChoosePage /></Protected>} />
        <Route path='/sellerOptions/sellerRegister' element={<Protected><SellerRegister /></Protected>} />
        <Route path='/sellerOptions/sellerLogin' element={<Protected><SellerLogin /></Protected>} />
        <Route path='/order-success/:id' element={<OrderSuccessPage />} />
        <Route path='/sellerOptions/seller-Dashboard' element={<ProtectedSeller><SellerDashboard /></ProtectedSeller>} />
        <Route path='/sellerOptions/seller-Dashboard/manage-products' element={<ProtectedSeller><ProductPage /></ProtectedSeller>} />
        <Route path='/sellerOptions/seller-Dashboard/change-password' element={<ProtectedSeller><PasswordChange /></ProtectedSeller>} />
        <Route path='/sellerOptions/seller-Dashboard/insights' element={<ProtectedSeller><Insights /></ProtectedSeller>} />
        <Route path='/sellerOptions/seller-Dashboard/manage-products/edit-product/:id' element={<ProtectedSeller><EditProduct /></ProtectedSeller>} />
        <Route path='/sellerOptions/seller-Dashboard/manage-products/add-product' element={<ProtectedSeller><ProductForm /></ProtectedSeller>} />
        <Route path='/my-orders' element={<Protected><UserOrders /></Protected>} />
        <Route path='/sellerOptions/seller-Dashboard/manage-orders' element={<ProtectedSeller><AdminOrder /></ProtectedSeller>} />
        <Route path='/my-profile' element={<UserInfo />} />
        <Route path='/wishlist' element={<Protected><WishList /></Protected>} />
        <Route path='*' element={<Error404NotFound />} />
      </Routes>
    </div>
  );
};

export default App;