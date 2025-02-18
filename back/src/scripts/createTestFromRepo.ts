// https://api.github.com/repos/{owner}/{repo}/zipball?ref=main
// https://api.github.com/repos/Ayub-Begimkulov/retransition/contents/README.md
import fsPromises from "fs/promises";
import fs from "fs";
import stream from "stream";
import path from "path";
import { fileURLToPath } from "url";

import { getTSCodeWords } from "../utils/getTSCodeWords.js";
import { memoryUsage } from "../utils/memoryUsage.js";
import { ZipFileReader, type FileInfo } from "../utils/zipFileReader.js";

const scriptDirectoryPath = path.resolve(fileURLToPath(import.meta.url), "..");
const tempDir = path.resolve(scriptDirectoryPath, "./temp");
const zipFileName = path.resolve(tempDir, "repo.zip");
const testsDir = path.resolve(scriptDirectoryPath, "../tests");

interface CreateTestFromRepoOptions {
  owner: string;
  repoName: string;
  ref?: string; // branch | hash
}

async function createTestFromRepo({
  owner,
  repoName,
  ref,
}: CreateTestFromRepoOptions) {
  const params = new URLSearchParams();
  if (ref) {
    params.append("ref", ref);
  }

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}/zipball?${ref?.toString()}`
  );

  if (!response.ok || !response.body) {
    throw new Error(await response.text());
  }

  await ensureDirectory(tempDir);

  await fsPromises.rm(zipFileName).catch((error) => {});

  const fileStream = fs.createWriteStream(zipFileName);

  const readableStreamPipe = stream.Readable.fromWeb(response.body).pipe(
    fileStream
  );
}

async function ensureDirectory(path: string) {
  try {
    await fsPromises.access(path);
  } catch (error) {
    await fsPromises.mkdir(path, { recursive: true });
  }
}

const fileNameRegex = /\.(ts|tsx|js|jsx)$/;

function createTestContent(file: FileInfo) {
  const trimmedContent = file.content.trim();

  if (/\.(ts|tsx)$/.test(file.name)) {
    return {
      type: "typescript",
      text: trimmedContent,
      words: getTSCodeWords(trimmedContent),
    };
  }
  if (/\.(js|jsx)$/.test(file.name)) {
    return {
      type: "javascript",
      text: trimmedContent,
      words: getTSCodeWords(trimmedContent),
    };
  }

  return;
}

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

memoryUsage();
createTestFromZip();
memoryUsage();

// createTestFromRepo({ owner: "Ayub-Begimkulov", repoName: "retransition" });
