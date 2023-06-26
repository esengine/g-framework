import {GServices} from "@esengine/gs-server";

const services = GServices.I();
services.init({
    port: 8080,
    heartbeatInterval: 1000,
    heartbeatTimeout: 5000
})

services.start();