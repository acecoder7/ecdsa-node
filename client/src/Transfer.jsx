import { useState } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import {secp256k1} from 'ethereum-cryptography/secp256k1';
import { toHex, utf8ToBytes } from 'ethereum-cryptography/utils';
import { keccak256 } from "ethereum-cryptography/keccak";

function Transfer({ address, setBalance, privateKey }) {
  // state for the form inputs
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  // helper function to set state from input
  const setValue = (setter) => (evt) => setter(evt.target.value);

  // helper function to hash a message and sign it with the private key 
  const hashMessage = message => keccak256(Uint8Array.from(message));
  const signMessage = msg => secp256k1.sign(hashMessage(msg), privateKey);


  // function to send a transaction to the server and update the balance
  async function transfer(evt) {
    evt.preventDefault();

    // create a message object and sign it 
    const msg = { amount: parseInt(sendAmount), recipient };
    const sig = signMessage(msg);

    // helper function to stringify bigints 
    const stringifyBigInts = obj =>{
      for(let prop in obj){
        let value = obj[prop];
        if(typeof value === 'bigint'){
          obj[prop] = value.toString();
        }else if(typeof value === 'object' && value !== null){
          obj[prop] = stringifyBigInts(value);
        }
      }
      return obj;
    }

    // stringify bigints before sending to server
    const sigStringed = stringifyBigInts(sig);
    const tx = {
      sig:sigStringed, msg, sender: address
    }

    // send the transaction to the server and update the balance
    try {
      const {
        data: { balance },
      } = await server.post(`send`, tx);
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
