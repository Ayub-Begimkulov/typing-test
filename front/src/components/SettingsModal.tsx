import { useState } from "react";
import { Settings } from "../types/settings";
import { Modal } from "./Modal";
import { TEST_TYPES } from "../constants/testTypes";
import { includes } from "../utils/includes";

const MIN_DURATION = 10;

interface SettingsModalProps {
  open: boolean;
  settings: Settings;
  onClose: () => void;
  onSettingsChange: (newSettings: Settings) => void;
}

function stopInputPropagation(event: React.KeyboardEvent<HTMLInputElement>) {
  event.stopPropagation();
}
export function SettingsModal({
  open,
  settings,
  onClose,
  onSettingsChange,
}: SettingsModalProps) {
  const [newSettings, setNewSettings] = useState<Partial<Settings>>(settings);
  const [errors, setErrors] = useState<Partial<Record<keyof Settings, string>>>(
    {}
  );

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsedValue = parseInt(e.target.value, 10);

    if (Number.isNaN(parsedValue) || parsedValue < 10) {
      setErrors({
        ...errors,
        duration: "duration must be at least " + MIN_DURATION,
      });
    } else {
      setErrors({ ...errors, duration: undefined });
    }
    const newDuration = Number.isNaN(parsedValue) ? undefined : parsedValue;

    setNewSettings({
      ...settings,
      duration: newDuration,
    });
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    if (!includes(TEST_TYPES, value)) {
      setErrors({ ...errors, type: "invalid type" });
      return;
    } else {
      setErrors({ ...errors, type: undefined });
    }

    setNewSettings({ ...settings, type: value });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newSettings.duration || newSettings.duration < MIN_DURATION) {
      return;
    }

    if (!includes(TEST_TYPES, newSettings.type)) {
      return;
    }

    onSettingsChange({
      type: newSettings.type,
      duration: newSettings.duration,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <h3>Time</h3>
        <input
          value={newSettings.duration ?? ""}
          onChange={handleDurationChange}
          onKeyDown={stopInputPropagation}
          type="number"
        />
        <div style={{ color: "red" }}>{errors.duration}</div>
        <h3>Language</h3>
        <select value={newSettings.type} onChange={handleTypeChange}>
          {TEST_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <div style={{ color: "red" }}>{errors.type}</div>
        <button>Submit</button>
      </form>
    </Modal>
  );
}
