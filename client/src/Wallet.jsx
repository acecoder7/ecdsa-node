import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { toHex } from "ethereum-cryptography/utils";


function Wallet({ address, setAddress, balance, setBalance, privateKey, setPrivateKey }) {

  // helper function to set state from input 
  async function onChange(evt) {
    // set the private key and address 
    const privateKey = evt.target.value;
    setPrivateKey(privateKey);
    const address = toHex(secp.secp256k1.getPublicKey(privateKey));
    setAddress(address);

    // get the balance from the server
    if (address) {
      const {
        data: { balance },
      } = await server.get(`balance/${address}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Private Key
        <input placeholder="Type a private key" value={privateKey} onChange={onChange}></input>
      </label>

      <div>
        Address: {address.slice(0, 10) + '...'}
      </div>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
