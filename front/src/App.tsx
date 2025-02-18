import { useState } from "react";
import { TypingTest } from "./components/TypingTest/TypingTest";
import { Settings } from "./types/settings";
import { SettingsModal } from "./components/SettingsModal";
import { useTestQuery } from "./hooks/queries/useTestQuery";
import { useLocalStorage } from "./hooks/useLocalStorage";

const DEFAULT_TYPE = "typescript";

export function App() {
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [settings, setSettings] = useLocalStorage<Settings>("settings", {
    type: DEFAULT_TYPE,
    duration: 20,
    width: 1200,
  });

  const { testData: _, status } = useTestQuery(settings.type);
  const testData = {
    type: "typescript",
    text: 'import { useEffect, useLayoutEffect } from "react";\n\nexport const useIsomorphicLayoutEffect =\n  typeof window !== "undefined" ? useLayoutEffect : useEffect;',
    words: [
      { text: "import", type: "Keyword", range: [0, 6] },
      { text: "useEffect", type: "Identifier", range: [9, 18] },
      { text: "useLayoutEffect", type: "Identifier", range: [20, 35] },
      { text: "from", type: "Identifier", range: [38, 42] },
      { text: '"react"', type: "String", range: [43, 50] },
      { text: "export", type: "Keyword", range: [53, 59] },
      { text: "const", type: "Keyword", range: [60, 65] },
      {
        text: "useIsomorphicLayoutEffect",
        type: "Identifier",
        range: [66, 91],
      },
      { text: "typeof", type: "Keyword", range: [96, 102] },
      { text: "window", type: "Identifier", range: [103, 109] },
      { text: '"undefined"', type: "String", range: [114, 125] },
      { text: "useLayoutEffect", type: "Identifier", range: [128, 143] },
      { text: "useEffect", type: "Identifier", range: [146, 155] },
    ],
  };

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
