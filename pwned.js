//importing libraries and utils
import prompt from "prompt";
import fetch from "node-fetch";
import { SHA1 } from "./hashFunction.js";

//declaring variables
var pwnedAPIURL = "https://api.pwnedpasswords.com/range";

//defining prompt properties
const properties = [
  {
    name: "password",
    hidden: true,
  },
];

//Fetch function
async function fetchAPI(URL) {
  const response = await fetch(URL);
  return response.text();
}

//initialize prompt
prompt.start();

//taking password from user's input
const start = () => {
  prompt.get(properties, async function (err, result) {
    if (err) {
      return onErr(err);
    }

    let input = result.password;

    if (input.length === 0) {
      console.log("no password provided");
      start();
    } else {
      //hashing input
      let inputHash = SHA1(input);
      let hashPrefix = inputHash.substr(0, 5);
      let URL = pwnedAPIURL + "/" + hashPrefix;

      fetchAPI(URL)
        .then((res) => {
          let matches = res.split(/\s+/);
          let suffixesArray = [];
          let timesArray = [];
          matches.forEach((el) => {
            suffixesArray.push(el.substr(0, 35)),
              timesArray.push(el.substr(36, el.length));
          });

          const checkIntoList = () => {
            for (let i = 0; i < suffixesArray.length; i++) {
              if (hashPrefix + suffixesArray[i].toLowerCase() === inputHash) {
                return (
                  "This password is already been leaked " +
                  parseFloat(timesArray[i]) +
                  " times, therefore it is not secure"
                );
              }
            }
          };
          console.log(
            checkIntoList() === undefined
              ? "This password has no match. It should be secure"
              : checkIntoList()
          );
        })
        .catch((err) => console.log(err));
    }
  });
};

//initializing script
start();

// error handler
function onErr(err) {
  console.log(err);
  return 1;
}
