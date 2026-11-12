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
  const url = new URL(window.location.href);
  url.searchParams.set("t", encoded);
  url.searchParams.set("e", "1");
  document.location.replace(url.href);
}
