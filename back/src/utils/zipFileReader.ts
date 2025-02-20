import yauzl from "yauzl";
import type { Readable } from "stream";

export interface FileInfo {
  name: string;
  content: string;
}

export class ZipFileReader {
  private zipFile: yauzl.ZipFile | null = null;

  constructor(
    private filePath: string,
    private matchFileName = (item: string) => true
  ) {}

  private async getZipFile() {
    if (this.zipFile) {
      return this.zipFile;
    }

    return new Promise<yauzl.ZipFile>((res, rej) => {
      yauzl.open(this.filePath, { lazyEntries: true }, (error, zipFile) => {
        if (error) {
          rej(error);
          return;
        }

        this.zipFile = zipFile;
        res(zipFile);
      });
    });
  }

  async getNextFile() {
    const zipFile = await this.getZipFile();

    if (zipFile.entriesRead === zipFile.entryCount) {
      return;
    }

    return new Promise<FileInfo | undefined>((res, rej) => {
      const callback = (entry: yauzl.Entry) => {
        if (!this.matchFileName(entry.fileName)) {
          if (zipFile.entriesRead === zipFile.entryCount) {
            res(undefined);
          } else {
            zipFile.readEntry();
          }
          return;
        }

        this.readFileEntry(entry)
          .then((content) => {
            res({ name: entry.fileName, content: content });
          })
          .catch((error) => rej(error));

        zipFile.off("entry", callback);
      };

      zipFile.on("entry", callback);
      zipFile.readEntry();
    });
  }

  private async readFileEntry(entry: yauzl.Entry) {
    const { zipFile } = this;

    if (!zipFile) {
      throw new Error(
        "incorrect `readFileEntry` call. " +
          "this method is only usable once zip file was opened"
      );
    }

    return new Promise<string>((res, rej) => {
      zipFile.openReadStream(entry, (error, contentStream) => {
        if (error) {
          rej(error);
          return;
        }

        res(streamToString(contentStream));
      });
    });
  }
}

function streamToString(stream: Readable) {
  return new Promise<string>((resolve, reject) => {
    let data = "";
    stream.on("data", (chunk) => {
      data += chunk.toString();
    });
    stream.on("end", () => resolve(data));
    stream.on("error", (err) => reject(err));
  });
}
