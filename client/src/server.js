import axios from "axios";

const server = axios.create({
  baseURL: "https://ecdsa-node-gzmo.onrender.com",
});

export default server;
