type ControlsProps = {
  onStart: () => void;
  onDebug: () => void;
  onDebug2: () => void;
};

export default function Controls({
  onStart,
  onDebug,
  onDebug2,
}: ControlsProps) {
  return (
    <div className="controls">
      <button onClick={onStart}> Start</button>
      <button onClick={onDebug}> Debug</button>
      <button onClick={onDebug2}> Debug2</button>
    </div>
  );
}
