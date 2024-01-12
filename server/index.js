
// Import libraries
const express = require("express");
const cors = require("cors"); 
const secp = require('ethereum-cryptography/secp256k1');
const {keccak256} = require('ethereum-cryptography/keccak');


// Create an instance of express 
const app = express();
// Set the port to 3042
const port = 3042;


// Use cors and express.json middleware
app.use(cors());
app.use(express.json());


// Private Key: 859fba14a8fadbdff9384f8a51244b83c85952f3684ea5dc2f06e475af76a9db
// Public Key: 0234a7c53ef99eb0a23f0481adf5947554669230194a3f8881f0503dfce06ff291

// Private Key: 9d6f7e2ffd5cfdd44ebddb8cbeb352ca367c62ad9b181659bf4df1de9d8a6838
// Public Key: 031bfe467e17e9dffffdb9b8b04485c1c5d48a4e8b98ffbf95c3c400c744ae58f0

// Private Key: 5d94e51a7b5def47ac9b44693b62d3f3ed4b6eff3a4e24f96f26eb234352097e
// Public Key: 028727d004fc4782560d51a58f3679d1983d870bfddc9adbdb54112eebbc5c6305


// Create a balances object with addresses/public keys and their initial balance 
const balances = {
  "0234a7c53ef99eb0a23f0481adf5947554669230194a3f8881f0503dfce06ff291": 100,
  "031bfe467e17e9dffffdb9b8b04485c1c5d48a4e8b98ffbf95c3c400c744ae58f0": 50,
  "028727d004fc4782560d51a58f3679d1983d870bfddc9adbdb54112eebbc5c6305": 75,
};


// Create a get request for the balance of an address
app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});


// Create a post request for sending a transaction
app.post("/send", (req, res) => {

  // destructure the sender, signature, and message from the request body
  const { sender, sig: sigStringed, msg } = req.body;
  const { recipient, amount } = msg;

  // convert stringified bigints back to bigints
  const sig = {
    ...sigStringed,
    r: BigInt(sigStringed.r),
    s: BigInt(sigStringed.s)
  }

  // hash the message
  const hashMessage = (message) => keccak256(Uint8Array.from(message));
  // verify the signature
  const isValid = secp.secp256k1.verify(sig, hashMessage(msg), sender) === true;
  
  if(!isValid) res.status(400).send({ message: "Bad signature!"});

  // set the initial balance for the sender and recipient
  setInitialBalance(sender);
  setInitialBalance(recipient);

  // check if the sender has enough funds
  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});


app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});



function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
