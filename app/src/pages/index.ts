import { stringify } from "../helper/jsurl.js";

const exampleData = await fetch("./src/views/tree/exampleConfig.json").then(
  (response) => response.json()
);

const jsonStringified = stringify(exampleData);

document.location.replace(`./pages/edit.html?t=${jsonStringified}`);
