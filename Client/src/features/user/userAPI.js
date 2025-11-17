
import axios from 'axios';

export async function fetchLoggedInUserInfo() {
    return axios.get(`/user/check-user`)
    // return {data: getUser.data[0]}
}
export function fetchLoggedInUserOrders() {
    return axios.get(`/orders/own`)
}
export function createUserInteraction(productId,interactionType){
    console.log("Received",productId,interactionType)
    return axios.post(`/interactions`,{productId,eventType:interactionType})
}
export function updateUserInfo(users) {
    console.log("Received",users)
     return axios.patch(`/users/${users.id}`, users);
}

export function logoutUser() {
    document.cookie = 'jwt' + '=; Path=/;  Domain=' + location.host + '; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=None; Secure'
    return {data:[null]};
}
