import { useState } from "react";
import Input from "./Input";
import { EyeIcon, EyeOffIcon, LockIcon } from "./IconGlyphs";

const cx = (...parts) => parts.filter(Boolean).join(" ");

export default function PasswordField({
  className = "",
  wrapperClassName = "",
  leadingIcon = <LockIcon className="h-4.5 w-4.5" />,
  toggleClassName = "",
  ...props
}) {
  const [isVisible, setIsVisible] = useState(false);
  const toggleLabel = isVisible ? "Hide password" : "Show password";

  return (
    <Input
      {...props}
      type={isVisible ? "text" : "password"}
      className={className}
      wrapperClassName={wrapperClassName}
      leadingIcon={leadingIcon}
      trailingAdornment={
        <button
          type="button"
          aria-label={toggleLabel}
          title={toggleLabel}
          onClick={() => setIsVisible((current) => !current)}
          className={cx(
            "rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-300/60",
            toggleClassName,
          )}
        >
          {isVisible ? (
            <EyeOffIcon className="h-4.5 w-4.5" />
          ) : (
            <EyeIcon className="h-4.5 w-4.5" />
          )}
        </button>
      }
    />
  );
}
