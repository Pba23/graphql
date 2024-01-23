import { fetchGraphQL } from "./loginPage.js";


const accessToken = localStorage.getItem('accessToken');
const response = await fetchGraphQL(accessToken);
console.log(response)

if(!response?.data){
    console.log(response)
    window.location.href="../template/loginPage.html"
}else {
    window.location.href="../template/profil.html"
}

