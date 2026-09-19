import { encodeConfig } from "../helper/urlConfig.js";

if (new URLSearchParams(window.location.search).has("t")) {
  if (new URLSearchParams(window.location.search).get("e") === "1") {
    await import("./edit.js");
  } else {
    await import("./view.js");
  }
} else {
  const exampleData = await fetch("./src/views/tree/exampleConfig.json").then(
    (response) => response.json(),
  );
  const encoded = await encodeConfig(exampleData);
  document.location.replace(`./?t=${encoded}&e=1`);
}
