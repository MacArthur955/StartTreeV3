import type { TreeConfig } from "../views/tree/components/treeTypes.js";
import { parse, stringify } from "./jsurl.js";

const GZIP_PREFIX = "g1.";
const COMPACT_PREFIX = "d1.";

type CompactConfig = [
  string | null,
  string | null,
  number | null,
  string | null,
  [string, [string, string][]][][],
];

function compact(config: TreeConfig): CompactConfig {
  return [
    config.s.n ?? null,
    config.s.u ?? null,
    config.t.nr ?? null,
    config.v ?? null,
    config.bmc.map((column) =>
      column.map((category) => [
        category.cn,
        category.b.map((bookmark) => [bookmark.n, bookmark.u]),
      ]),
    ),
  ];
}

function expand(data: CompactConfig): TreeConfig {
  const [searchName, searchUrl, numberOfRows, version, columns] = data;
  return {
    ...(version === null ? {} : { v: version }),
    s: {
      ...(searchName === null ? {} : { n: searchName }),
      ...(searchUrl === null ? {} : { u: searchUrl }),
    },
    t: numberOfRows === null ? {} : { nr: numberOfRows },
    bmc: columns.map((column) =>
      column.map(([name, bookmarks]) => ({
        cn: name,
        b: bookmarks.map(([bookmarkName, url]) => ({
          n: bookmarkName,
          u: url,
        })),
      })),
    ),
  };
}

async function compress(
  input: string,
  format: CompressionFormat,
): Promise<string> {
  const stream = new Blob([new TextEncoder().encode(input)])
    .stream()
    .pipeThrough(new CompressionStream(format));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function decompress(
  value: string,
  format: CompressionFormat,
): Promise<string> {
  const encoded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(encoded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const stream = new Blob([bytes])
    .stream()
    .pipeThrough(new DecompressionStream(format));
  return new Response(stream).text();
}

export async function encodeConfig(config: TreeConfig): Promise<string> {
  const legacy = stringify(config) ?? "";
  if (typeof CompressionStream === "undefined") return legacy;

  try {
    const compressed =
      COMPACT_PREFIX +
      (await compress(JSON.stringify(compact(config)), "deflate-raw"));
    return compressed.length < legacy.length ? compressed : legacy;
  } catch {
    const compressed =
      GZIP_PREFIX + (await compress(JSON.stringify(config), "gzip"));
    return compressed.length < legacy.length ? compressed : legacy;
  }
}

export async function decodeConfig(
  value: string | null,
): Promise<TreeConfig | null> {
  if (!value) return null;
  if (value.startsWith(COMPACT_PREFIX)) {
    const data = await decompress(
      value.slice(COMPACT_PREFIX.length),
      "deflate-raw",
    );
    return expand(JSON.parse(data) as CompactConfig);
  }
  if (value.startsWith(GZIP_PREFIX)) {
    const data = await decompress(value.slice(GZIP_PREFIX.length), "gzip");
    return JSON.parse(data) as TreeConfig;
  }
  return parse(value) as TreeConfig;
}
