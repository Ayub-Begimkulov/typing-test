import { useMemo, useState } from "react";
import { WORDS_INPUT } from "./constants/words";
import { TypingTest } from "./components/TypingTest";
import { Settings } from "./types/settings";
import { SettingsModal } from "./components/SettingsModal";
import { TS_CODE_INPUT } from "./constants/code";

export function App() {
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    type: "typescript",
    duration: 20,
  });

  const handleSettingsOpen = () => {
    setSettingsModalOpen(true);
  };

  const handleSettingsClose = () => {
    setSettingsModalOpen(false);
  };

  const inputText = useMemo(() => {
    if (settings.type === "typescript") {
      return TS_CODE_INPUT;
    }

    return WORDS_INPUT;
  }, []);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          height: 50,
          padding: "0 16px",
        }}
      >
        <button onClick={handleSettingsOpen}>Settings</button>
        <SettingsModal
          open={settingsModalOpen}
          onClose={handleSettingsClose}
          settings={settings}
          onSettingsChange={setSettings}
        />
      </header>
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TypingTest timeDuration={settings.duration} inputText={inputText} />
      </div>
    </div>
  );
}
