import {GServices} from "../src";


const services = GServices.I();
services.init({
    port: 8080,
    heartbeatInterval: 1000,
    heartbeatTimeout: 5000,
    connectDBStr: 'mongodb://127.0.0.1:27017/',
    sessionExpireTime: 54000,
    frameInterval: 1000 / 30,
}).then(()=>{
    services.start();
});