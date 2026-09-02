interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
  label,
}: ToggleSwitchProps) {
  return (
    <label className="toggle-switch-label">
      <input
        type="checkbox"
        className="toggle-switch-input"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span className={`toggle-switch ${checked ? "on" : "off"}`} />
      {label && <span className="toggle-label">{label}</span>}
    </label>
  );
}
