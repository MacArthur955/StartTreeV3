import type { TreeConfig } from "../views/tree/components/treeTypes.js";
import { parse, stringify } from "./jsurl.js";

const GZIP_PREFIX = "g1.";
const COMPACT_PREFIX = "d2.";
const SEPARATED_PREFIX = "s2.";
const DICTIONARY_PREFIX = "s3.";
const LEGACY_COMPACT_PREFIX = "d1.";
const LEGACY_SEPARATED_PREFIX = "s1.";
const SEPARATOR = "\u001f";
const ESCAPE = "\\";
const MISSING = "\u0000";
const URL_ESCAPE = "\u0001";
const URL_FRAGMENTS = [
  "https://www.",
  "https://",
  "http://",
  "www.",
  ".com/",
  ".org/",
  ".net/",
  ".io/",
  ".dev/",
] as const;

function encodeUrl(url: string): string {
  let encoded = "";
  for (let index = 0; index < url.length; ) {
    const fragmentIndex = URL_FRAGMENTS.findIndex((fragment) =>
      url.startsWith(fragment, index),
    );
    if (fragmentIndex !== -1) {
      encoded += URL_ESCAPE + fragmentIndex;
      index += URL_FRAGMENTS[fragmentIndex]!.length;
    } else {
      const character = url[index++]!;
      encoded += character === URL_ESCAPE ? URL_ESCAPE + URL_ESCAPE : character;
    }
  }
  return encoded;
}

function decodeUrl(url: string): string {
  let decoded = "";
  for (let index = 0; index < url.length; index++) {
    const character = url[index]!;
    if (character !== URL_ESCAPE) {
      decoded += character;
      continue;
    }
    const code = url[++index];
    if (code === URL_ESCAPE) {
      decoded += URL_ESCAPE;
    } else {
      const fragment =
        code === undefined ? undefined : URL_FRAGMENTS[Number(code)];
      if (fragment === undefined || !/^[0-8]$/.test(code!))
        throw new Error("Invalid URL fragment code");
      decoded += fragment;
    }
  }
  return decoded;
}

type CompactConfig = [
  number | null,
  string | null,
  [string, [string, string][]][][],
];

function compact(config: TreeConfig): CompactConfig {
  return [
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
  const [numberOfRows, version, columns] = data;
  return {
    ...(version === null ? {} : { v: version }),
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

function separate(config: TreeConfig, dictionary = false): string {
  const tokens: (string | null)[] = [
    config.t.nr === undefined ? null : String(config.t.nr),
    config.v ?? null,
    String(config.bmc.length),
  ];

  for (const column of config.bmc) {
    tokens.push(String(column.length));
    for (const category of column) {
      tokens.push(category.cn, String(category.b.length));
      for (const bookmark of category.b)
        tokens.push(
          bookmark.n,
          dictionary ? encodeUrl(bookmark.u) : bookmark.u,
        );
    }
  }

  return tokens
    .map((token) => {
      if (token === null) return MISSING;
      let escaped = "";
      for (const character of token) {
        if (
          character === ESCAPE ||
          character === MISSING ||
          character === SEPARATOR
        ) {
          escaped += ESCAPE;
        }
        escaped += character;
      }
      return escaped;
    })
    .join(SEPARATOR);
}

function joinSeparated(
  data: string,
  legacy = false,
  dictionary = false,
): TreeConfig {
  const rawTokens: string[] = [];
  let token = "";
  for (let index = 0; index < data.length; index++) {
    const character = data[index]!;
    if (character === ESCAPE) {
      if (++index >= data.length) throw new Error("Incomplete escape sequence");
      token += ESCAPE + data[index];
    } else if (character === SEPARATOR) {
      rawTokens.push(token);
      token = "";
    } else {
      token += character;
    }
  }
  rawTokens.push(token);

  let position = 0;
  const next = (): string | null => {
    const raw = rawTokens[position++];
    if (raw === undefined) throw new Error("Incomplete configuration");
    if (raw === MISSING) return null;
    let unescaped = "";
    for (let index = 0; index < raw.length; index++) {
      if (raw[index] === ESCAPE) index++;
      unescaped += raw[index];
    }
    return unescaped;
  };
  const required = (): string => {
    const value = next();
    if (value === null) throw new Error("Missing required field");
    return value;
  };
  const count = (): number => {
    const value = required();
    if (!/^(0|[1-9]\d*)$/.test(value)) throw new Error("Invalid item count");
    const number = Number(value);
    if (!Number.isSafeInteger(number) || number > rawTokens.length - position) {
      throw new Error("Invalid item count");
    }
    return number;
  };

  if (legacy) {
    next();
    next();
  }
  const rows = next();
  const version = next();
  const bmc: TreeConfig["bmc"] = [];
  const columnCount = count();
  for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
    const column: TreeConfig["bmc"][number] = [];
    const categoryCount = count();
    for (
      let categoryIndex = 0;
      categoryIndex < categoryCount;
      categoryIndex++
    ) {
      const cn = required();
      const b: { n: string; u: string }[] = [];
      const bookmarkCount = count();
      for (
        let bookmarkIndex = 0;
        bookmarkIndex < bookmarkCount;
        bookmarkIndex++
      ) {
        const name = required();
        const url = required();
        b.push({ n: name, u: dictionary ? decodeUrl(url) : url });
      }
      column.push({ cn, b });
    }
    bmc.push(column);
  }
  if (position !== rawTokens.length)
    throw new Error("Unexpected configuration data");
  const nr = rows === null ? undefined : Number(rows);
  if (nr !== undefined && !Number.isFinite(nr))
    throw new Error("Invalid theme number");

  return {
    ...(version === null ? {} : { v: version }),
    t: nr === undefined ? {} : { nr },
    bmc,
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
    const compacted =
      COMPACT_PREFIX +
      (await compress(JSON.stringify(compact(config)), "deflate-raw"));
    const separated =
      SEPARATED_PREFIX + (await compress(separate(config), "deflate-raw"));
    const dictionary =
      DICTIONARY_PREFIX +
      (await compress(separate(config, true), "deflate-raw"));
    return [legacy, compacted, separated, dictionary].reduce(
      (shortest, value) => (value.length < shortest.length ? value : shortest),
    );
  } catch {
    const compressed =
      GZIP_PREFIX + (await compress(JSON.stringify(config), "gzip"));
    return compressed.length < legacy.length ? compressed : legacy;
  }
}

function withoutSearch(config: TreeConfig): TreeConfig {
  return {
    ...(config.v === undefined ? {} : { v: config.v }),
    bmc: config.bmc,
    t: config.t,
  };
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
  if (value.startsWith(SEPARATED_PREFIX)) {
    const data = await decompress(
      value.slice(SEPARATED_PREFIX.length),
      "deflate-raw",
    );
    return joinSeparated(data);
  }
  if (value.startsWith(DICTIONARY_PREFIX)) {
    const data = await decompress(
      value.slice(DICTIONARY_PREFIX.length),
      "deflate-raw",
    );
    return joinSeparated(data, false, true);
  }
  if (value.startsWith(LEGACY_COMPACT_PREFIX)) {
    const data = await decompress(
      value.slice(LEGACY_COMPACT_PREFIX.length),
      "deflate-raw",
    );
    const [, , ...remaining] = JSON.parse(data) as [
      unknown,
      unknown,
      ...CompactConfig,
    ];
    return expand(remaining);
  }
  if (value.startsWith(LEGACY_SEPARATED_PREFIX)) {
    const data = await decompress(
      value.slice(LEGACY_SEPARATED_PREFIX.length),
      "deflate-raw",
    );
    return joinSeparated(data, true);
  }
  if (value.startsWith(GZIP_PREFIX)) {
    const data = await decompress(value.slice(GZIP_PREFIX.length), "gzip");
    return withoutSearch(JSON.parse(data) as TreeConfig);
  }
  return withoutSearch(parse(value) as TreeConfig);
}
