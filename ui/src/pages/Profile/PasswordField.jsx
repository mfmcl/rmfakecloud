import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function PasswordField(props) {
  const [inputType, setInputType] = useState("password");

  return (
    <div style={{ position: "relative" }}>
      <input
        className="input"
        style={{ paddingRight: 40 }}
        type={inputType}
        autoComplete="new-password"
        {...props}
      />
      <button
        type="button"
        className="icon-btn sm"
        onClick={() => setInputType((t) => (t === "text" ? "password" : "text"))}
        style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)" }}
        aria-label={inputType === "text" ? "Hide password" : "Show password"}
      >
        {inputType === "text" ? <EyeOff /> : <Eye />}
      </button>
    </div>
  );
}

export default PasswordField;
