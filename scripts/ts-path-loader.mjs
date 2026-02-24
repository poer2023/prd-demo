import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIR = path.join(ROOT_DIR, "src");

function isFile(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function isDirectory(filePath) {
  try {
    return fs.statSync(filePath).isDirectory();
  } catch {
    return false;
  }
}

function resolveFilePath(basePath) {
  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    `${basePath}.js`,
    `${basePath}.mjs`,
    `${basePath}.cjs`,
  ];

  for (const candidate of candidates) {
    if (isFile(candidate)) return candidate;
  }

  if (isDirectory(basePath)) {
    const indexCandidates = [
      path.join(basePath, "index.ts"),
      path.join(basePath, "index.tsx"),
      path.join(basePath, "index.js"),
      path.join(basePath, "index.mjs"),
      path.join(basePath, "index.cjs"),
    ];
    for (const candidate of indexCandidates) {
      if (isFile(candidate)) return candidate;
    }
  }

  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const mappedPath = path.join(SRC_DIR, specifier.slice(2));
    const resolvedPath = resolveFilePath(mappedPath);
    if (resolvedPath) {
      return {
        shortCircuit: true,
        url: pathToFileURL(resolvedPath).href,
      };
    }
  }

  if (specifier.startsWith("./") || specifier.startsWith("../") || specifier.startsWith("/")) {
    const parentPath =
      context.parentURL && context.parentURL.startsWith("file:")
        ? path.dirname(fileURLToPath(context.parentURL))
        : ROOT_DIR;
    const mappedPath = specifier.startsWith("/") ? specifier : path.resolve(parentPath, specifier);
    const resolvedPath = resolveFilePath(mappedPath);
    if (resolvedPath) {
      return {
        shortCircuit: true,
        url: pathToFileURL(resolvedPath).href,
      };
    }
  }

  return nextResolve(specifier, context);
}
