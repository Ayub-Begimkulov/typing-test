import { TEST_TYPES } from "../constants/testTypes";

export type SettingsTypes = (typeof TEST_TYPES)[number];

export interface Settings {
  type: SettingsTypes;
  duration: number;
}
