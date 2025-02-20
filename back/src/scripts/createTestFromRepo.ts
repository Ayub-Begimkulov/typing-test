import fsPromises from "fs/promises";
import fs from "fs";
import stream from "stream";
import { finished } from "stream/promises";
import path from "path";

import { getTSCodeWords, type TSCodeWord } from "../utils/getTSCodeWords.js";
import { ZipFileReader, type FileInfo } from "../utils/zipFileReader.js";
import type { TestType } from "../types.js";
import { AST_TOKEN_TYPES } from "@typescript-eslint/typescript-estree";
import { pathFromSrc } from "../utils/pathFromSrc.js";

const scriptDirectory = pathFromSrc("./scripts");
const tempDir = path.resolve(scriptDirectory, "./temp");
const zipFileName = path.resolve(tempDir, "repo.zip");
const testsDir = pathFromSrc("./tests-data");

export interface CreateTestFromRepoOptions {
  owner: string;
  repoName: string;
  ref?: string; // branch | hash
}

export async function createTestFromRepo({
  owner,
  repoName,
  ref,
}: CreateTestFromRepoOptions) {
  const params = new URLSearchParams();
  if (ref) {
    params.append("ref", ref);
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repoName}/zipball?${params.toString()}`
    );

    if (!response.ok || !response.body) {
      throw new Error(
        `Failed to fetch repo "${owner}/${repoName}".\nStatus: ${
          response.status
        }\Response:\n${await response.text()}`
      );
    }

    await ensureDirectory(tempDir);
    await deleteZipFile();

    const writeFileStream = fs.createWriteStream(zipFileName);
    const bodyStream = stream.Readable.fromWeb(response.body);

    bodyStream.pipe(writeFileStream);

    bodyStream.on("error", async (error) => {
      console.error("Error happened downloading zip:", error);
      await deleteZipFile();
    });

    writeFileStream.on("error", async (error) => {
      console.error("Error happened writing zip:", error);
      bodyStream.destroy();
      await deleteZipFile();
    });

    await finished(writeFileStream);

    await createTestFromZip();
  } catch (error) {
    console.error("Error happened trying to download zip:", error);
  } finally {
    await deleteZipFile();
  }
}

async function ensureDirectory(path: string) {
  try {
    await fsPromises.access(path);
  } catch (error) {
    await fsPromises.mkdir(path, { recursive: true });
  }
}

function deleteZipFile() {
  return fsPromises.rm(zipFileName, { force: true });
}

const fileNameRegex = /\.(ts|tsx|js|jsx)$/;

async function createTestFromZip() {
  const zipFileReader = new ZipFileReader(zipFileName, (fileName) =>
    fileNameRegex.test(fileName)
  );

  while (true) {
    const file = await zipFileReader.getNextFile();

    if (!file) {
      break;
    }

    const testContent = createTestContent(file);

    if (!testContent) {
      continue;
    }

    const testTypeDirectory = path.resolve(testsDir, testContent.type);
    await ensureDirectory(testTypeDirectory);

    const resultFileName = file.name.replaceAll("/", "--");
    await fsPromises.writeFile(
      path.resolve(testTypeDirectory, resultFileName + ".json"),
      JSON.stringify(testContent)
    );
  }
}

interface TestContent {
  type: TestType;
  text: string;
  words: TSCodeWord[];
}

function createTestContent(file: FileInfo): TestContent | undefined {
  const trimmedContent = file.content.trim();

  if (trimmedContent.length === 0) {
    return;
  }

  if (/\.ts$/.test(file.name)) {
    return {
      type: "typescript",
      text: trimmedContent,
      // turn of jsx so that generics work correctly
      words: getTSCodeWords(trimmedContent, { jsx: false }),
    };
  } else if (/\.tsx$/.test(file.name)) {
    const words = getTSCodeWords(trimmedContent);
    const hasJSX = words.some(
      (word) =>
        word.type === AST_TOKEN_TYPES.JSXIdentifier ||
        word.type === AST_TOKEN_TYPES.JSXText
    );
    return {
      type: hasJSX ? "typescript-jsx" : "typescript",
      text: trimmedContent,
      words,
    };
  } else if (/\.(js|jsx)$/.test(file.name)) {
    const words = getTSCodeWords(trimmedContent);
    const hasJSX = words.some(
      (word) =>
        word.type === AST_TOKEN_TYPES.JSXIdentifier ||
        word.type === AST_TOKEN_TYPES.JSXText
    );
    return {
      type: hasJSX ? "javascript-jsx" : "javascript",
      text: trimmedContent,
      words,
    };
  }

  return;
}
