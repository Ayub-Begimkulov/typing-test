import { useState } from "react";
import { TypingTest } from "./features/TypingTest";
import { Settings } from "./types/settings";
import { SettingsModal } from "./features/SettingsModal";
import { useTestQuery } from "./shared/hooks/queries/useTestQuery";
import { useLocalStorage } from "./shared/hooks/useLocalStorage";

const DEFAULT_TYPE = "typescript";

export function App() {
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [settings, setSettings] = useLocalStorage<Settings>("settings", {
    type: DEFAULT_TYPE,
    duration: 20,
    width: 1200,
  });

  const { testData, status } = useTestQuery(settings.type);

  const handleSettingsOpen = () => {
    setSettingsModalOpen(true);
  };

  const handleSettingsClose = () => {
    setSettingsModalOpen(false);
  };

  const renderContent = () => {
    if (status === "error") {
      return <div>Error happened...</div>;
    }

    if (status === "pending") {
      return <div>Loading...</div>;
    }

    return (
      <TypingTest
        timeDuration={settings.duration}
        inputText={testData?.text ?? ""}
        wordsConfig={testData?.words ?? []}
        width={settings.width}
      />
    );
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
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
          width: "100%",
        }}
      >
        {renderContent()}
      </div>
    </div>
  );
}
