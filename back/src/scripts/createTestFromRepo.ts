// https://api.github.com/repos/{owner}/{repo}/zipball?ref=main
import fsPromises from "fs/promises";
import fs from "fs";
import stream from "stream";
import path from "path";
import { fileURLToPath } from "url";

import yazul, { Entry, ZipFile } from "yauzl";
import { getTSCodeWords } from "../utils/getTSCodeWords.js";

const tempDir = path.resolve(fileURLToPath(import.meta.url), "../temp");
const zipFileName = path.resolve(tempDir, "repo.zip");

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

  try {
    await fsPromises.access(tempDir);
  } catch (error) {
    await fsPromises.mkdir(tempDir, { recursive: true });
  }

  await fsPromises.rm(zipFileName).catch((error) => {});

  const fileStream = fs.createWriteStream(zipFileName);

  const readableStreamPipe = stream.Readable.fromWeb(response.body).pipe(
    fileStream
  );
}

class ZipFilesReader {
  private zipFilePromise: Promise<ZipFile>;

  constructor(filePath: string) {
    this.zipFilePromise = new Promise((res, rej) => {
      yazul.open(filePath, { lazyEntries: true }, (error, zipFile) => {
        if (error) {
          rej(error);
        } else {
          res(zipFile);
        }
      });
    });
  }

  async getNextFile() {
    const zipFile = await this.zipFilePromise;

    // zipFile.on('entry', content => )
  }
}

function createTestFromZip() {
  let totalLength = 0;
  yazul.open(zipFileName, { lazyEntries: true }, (error, zipFile) => {
    if (error) {
      throw error;
    }

    zipFile.on("entry", (file: Entry) => {
      if (/\.(ts|tsx|js|jsx)$/.test(file.fileName)) {
        zipFile.openReadStream(file, (error, fileContentStream) => {
          if (error) {
            throw error;
          }

          streamToString(fileContentStream).then((content) => {
            console.log("====================", file.fileName);

            const words = getTSCodeWords(content).map((item) => ({
              ...item,
              range: [item.range[0] + totalLength, item.range[1] + totalLength],
            }));
            totalLength += content.length;

            console.log(content);
            console.log("====================");
            zipFile.readEntry();
          });
        });
      } else {
        zipFile.readEntry();
      }
    });
    zipFile.readEntry();
  });
}

createTestFromZip();

function streamToString(stream: stream.Readable) {
  return new Promise<string>((resolve, reject) => {
    let data = "";
    stream.on("data", (chunk) => {
      data += chunk.toString();
    });
    stream.on("end", () => resolve(data));
    stream.on("error", (err) => reject(err));
  });
}

// createTestFromRepo({ owner: "Ayub-Begimkulov", repoName: "retransition" });
