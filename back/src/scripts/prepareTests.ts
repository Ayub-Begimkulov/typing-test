import {
  createTestFromRepo,
  type CreateTestFromRepoOptions,
} from "./createTestFromRepo.js";

const repos: CreateTestFromRepoOptions[] = [
  { owner: "Ayub-Begimkulov", repoName: "retransition" },
  { owner: "Ayub-Begimkulov", repoName: "i18n" },
  { owner: "Ayub-Begimkulov", repoName: "ts-get-set" },
  { owner: "Ayub-Begimkulov", repoName: "tdd-collapse-component" },
  { owner: "Ayub-Begimkulov", repoName: "hooks-tutorials" },
  { owner: "Ayub-Begimkulov", repoName: "transducing" },
  { owner: "Ayub-Begimkulov", repoName: "date-picker-component" },
  { owner: "Ayub-Begimkulov", repoName: "reactive-component" },
  { owner: "kupriianovvv", repoName: "dragNdDropCalculator" },
];

for (const repo of repos) {
  await createTestFromRepo(repo);
}
