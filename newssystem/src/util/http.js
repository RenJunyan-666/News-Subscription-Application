import axios from "axios";
import {store} from '../redux/store'

axios.defaults.baseURL="http://localhost:8000"

// Add a request interceptor
axios.interceptors.request.use(function (config) {
    // 显示loading
    store.dispatch({
        type:"change-loading",
        payload:true
    })
    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

// Add a response interceptor
axios.interceptors.response.use(function (response) {
    //隐藏loading
    store.dispatch({
        type:"change-loading",
        payload:false
    })
    return response;
  }, function (error) {
    //隐藏loading
    store.dispatch({
        type:"change-loading",
        payload:false
    })
    return Promise.reject(error);
});