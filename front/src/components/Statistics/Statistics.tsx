interface StatisticsProps {
  wpm: number;
  accuracy: number;
  restart: () => void;
}

export function Statistics({ wpm, accuracy, restart }: StatisticsProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div>Your are done!</div>
      <div>
        <div>Accuracy: {accuracy}%</div>
        <div>WPM: {wpm}</div>
      </div>
      <button onClick={restart}>Restart</button>
    </div>
  );
}
