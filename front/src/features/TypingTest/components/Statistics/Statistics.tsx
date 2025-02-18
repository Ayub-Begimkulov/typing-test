import styles from "./Statistics.module.scss";

interface StatisticsProps {
  wpm: number;
  accuracy: number;
  onRestart: () => void;
}

export function Statistics({ wpm, accuracy, onRestart }: StatisticsProps) {
  return (
    <div className={styles.statistics}>
      <div className={styles.statisticsTitle}>Your are done!</div>
      <div className={styles.statisticsData}>
        <div>Accuracy: {accuracy}%</div>
        <div>WPM: {Math.floor(wpm)}</div>
      </div>
      <button onClick={onRestart}>Restart</button>
    </div>
  );
}
