// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   fetchLoggedInUserOrdersAsync,
//   selectLoggedInUserInfo,
//   selectLoggedInUserOrders,
// } from "../userSlice";
// import { Link, Navigate } from "react-router-dom";
// import { discountedPrice } from "../../../app/constants";
// import {
//   fetchProductByIdAsync,
//   selectProductById,
// } from "../../product/productListSlice";
// import { selectLoggedInUserToken } from "../../Auth/authSlice";
// import RatingForm from "../../../Components/Pages/RatingForm";
// const UserOrders = () => {
//   const dispatch = useDispatch();
//   const user = useSelector(selectLoggedInUserInfo);
//   const userToken = useSelector(selectLoggedInUserToken);
//   const orders = useSelector(selectLoggedInUserOrders);

//   const [userRating, setUserRating] = useState(0);



//   useEffect(() => {
//     dispatch(fetchLoggedInUserOrdersAsync());
//   }, [dispatch]);

//   return (
//     <>
//       {" "}
//       {!userToken && <Navigate to={"/login"} replace={true}></Navigate>}
//       {!orders && <Navigate to={"/"} replace={true}></Navigate>}
//       <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-5">
//         <h3 className="text-4xl font-bold text-center">Your Orders</h3>
//         <div className="mt-8 p-10">
//           <div className="flow-root">
//             <ul role="list" className="-my-6 divide-y divide-gray-200">
//               {orders?.map((data, index) => (
//                 <div key={index}>
//                   <div className="flex flex-row items-center justify-between">
//                     <p className="p-5 text-3xl font-bold text-purple-700 ">
//                       Order id: #{index}
//                     </p>
//                     <p className="p-5 text-lg font-bold text-gray-600-700 underline">
//                      Order Placed: {data.createdAt.slice(0,10)}
//                     </p>
//                   </div>
//                   {data?.products?.map((orderItems, i) => (
//                     <li key={i} className="flex py-6">
//                       <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
//                         <img
//                           src={`http://localhost:8080/uploads/${orderItems?.product?.thumbnail}` }
//                           alt={"abc"}
//                           className="h-full w-full object-cover object-center"
//                         />
//                       </div>


//                       <div className="ml-4 flex flex-1 flex-col">
                        
//                         <div className="">
//                           <div className="flex justify-between  text-base font-medium text-gray-900">
//                             <h3>
//                               <p> {orderItems?.product?.title}</p>
//                             </h3>
//                             <h5>
//                               {orderItems.features.map((item, index) => (
                                
//                                 <p className="text-sm capitalize" key={index}><span className="font-bold">{item.title}: </span>{item.option} {console.log(item)}</p>
//                               ))}
                              
//                             </h5>


//                             <div className="flex flex-col text-start items-center gap-2">
//                               <p className="ml-4 text-start">
//                                 NPR &nbsp;{" "}
//                                 {discountedPrice(orderItems?.product) *
//                                   orderItems?.quantity}
//                               </p>
//                               <p
//                                 className={
//                                   orderItems?.status == "Pending"
//                                     ? "px-2 ml-4 bg-indigo-600 text-white text-start"
//                                     : orderItems?.status == "Cancelled"
//                                     ? "px-2 ml-4 bg-red-600 text-white text-start"
//                                     : orderItems?.status == "Shipped"
//                                     ? "px-2 ml-4 bg-blue-600 text-white text-start"
//                                     : orderItems?.status == "Delivered"
//                                     ? " ml-4 bg-green-600 text-white text-start"
//                                     : ""
//                                 }
//                               >
//                                 Status &nbsp; {orderItems.status}
//                               </p>
//                               <p className="ml-4 text-start">
//                                 Payment Method : {data?.selectedPaymentMethod}
//                               </p>
                           
                              
//                               {orderItems.status == "Delivered" && orderItems.rated==false ? (
//                                 <RatingForm id={orders[index]?.id} productId={orderItems?.product?.id} userRating={userRating} setUserRating={setUserRating} />
//                               ):""}
//                             </div>
//                           </div>
//                           <p className="-mt-8 text-sm text-gray-500">
//                             Color: {
//                               "RED"
//                             }
//                           </p>
//                         </div>
//                         <div className="flex flex-1 items-end justify-between text-sm">
//                           <div className="flex flex-col jc items-start gap-1">
//                             <p className="text-gray-500">
//                               Qty : {orderItems?.quantity}
//                             </p>
//                             <p className="text-gray-500">
//                               Address:
//                               {data?.selectedDeliveryAddress?.selectedState +" " +
//                                 data?.selectedDeliveryAddress?.selectedCity +" " +
//                                 data?.selectedDeliveryAddress
//                                   ?.selectedLocation +" " +
//                                   data?.selectedDeliveryAddress?.street}
//                             </p>
//                             <p className="text-gray-500">
//                               Receiver:{" "}
//                               {data?.selectedDeliveryAddress?.fullName}(
//                               {data?.selectedDeliveryAddress?.phone})
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     </li>
//                   ))}{" "}
//                 </div>
//               ))}{" "}
//             </ul>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default UserOrders;

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import {
  fetchLoggedInUserOrdersAsync,
  selectLoggedInUserOrders,
} from "../userSlice";
import { discountedPrice } from "../../../app/constants";
import { selectLoggedInUserToken } from "../../Auth/authSlice";
import RatingForm from "../../../Components/Pages/RatingForm";

const UserOrders = () => {
  const dispatch = useDispatch();
  const userToken = useSelector(selectLoggedInUserToken);
  const orders = useSelector(selectLoggedInUserOrders);

  useEffect(() => {
    if (userToken) dispatch(fetchLoggedInUserOrdersAsync());
  }, [dispatch, userToken]);

  if (!userToken) return <Navigate to="/login" replace />;
  if (!orders) {
    return <div className="text-center py-20 text-3xl">Loading orders...</div>;
  }
  if (orders.length === 0) {
    return <div className="text-center py-20 text-4xl text-gray-600">No orders yet!</div>;
  }

  // Safe ID extractor
  const getOrderNumber = (order) => {
    const id = order._id || order.id || '';
    return id ? id.toString().slice(-8).toUpperCase() : 'UNKNOWN';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-5xl font-bold text-center mb-12 text-purple-700">My Orders</h1>

      {orders.map((order) => (
        <div key={order._id || order.id} className="bg-white rounded-2xl shadow-2xl p-8 mb-10 border">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b-2">
            <div>
              <h2 className="text-3xl font-bold text-purple-600">
                Order #{getOrderNumber(order)}
              </h2>
              <p className="text-lg text-gray-600 mt-2">
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="text-right mt-4 md:mt-0">
              <p className="text-3xl font-bold">NPR {order.totalAmount?.toLocaleString()}</p>
              <p className="text-lg text-gray-600">{order.selectedPaymentMethod || 'Cash'}</p>
            </div>
          </div>

          {/* Products */}
          {order.products?.map((item, i) => {
            const product = item.product;
            if (!product) return null;

            return (
              <div key={i} className="flex gap-8 py-8 border-b last:border-0">
                <img
                  src={`http://localhost:8080/uploads/${product.thumbnail}`}
                  alt={product.title}
                  className="w-32 h-32 object-cover rounded-xl shadow-lg"
                />

                <div className="flex-1">
                  <h3 className="text-2xl font-bold">{product.title}</h3>

                  {/* Features */}
                  {item.features?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-3">
                      {item.features.map((f, idx) => (
                        <span key={f._id || idx} className="bg-gray-100 px-4 py-2 rounded-lg text-sm">
                          <strong>{f.title}:</strong> {f.option}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-lg">
                    <div><strong>Qty:</strong> {item.quantity}</div>
                    <div><strong>Price:</strong> NPR {(discountedPrice(product) * item.quantity).toLocaleString()}</div>
                    <div>
                      <strong>Status:</strong>
                      <span className={`ml-3 px-4 py-2 rounded-full text-white font-bold text-sm
                        ${item.status === "Delivered" ? "bg-green-600" :
                          item.status === "Shipped" ? "bg-blue-600" :
                          item.status === "Cancelled" ? "bg-red-600" : "bg-yellow-600"}`}>
                        {item.status || "Pending"}
                      </span>
                    </div>
                  </div>

                  {item.status === "Delivered" && !item.rated && (
                    <div className="mt-6">
                      <RatingForm orderId={order._id || order.id} productId={product._id} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Address */}
          {order.selectedDeliveryAddress && (
            <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <h4 className="text-xl font-bold mb-3">Delivery Address</h4>
              <p className="text-lg">
                <strong>{order.selectedDeliveryAddress.fullName}</strong><br />
                {order.selectedDeliveryAddress.street}, {order.selectedDeliveryAddress.selectedLocation}<br />
                {order.selectedDeliveryAddress.selectedCity}, {order.selectedDeliveryAddress.selectedState}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default UserOrders;