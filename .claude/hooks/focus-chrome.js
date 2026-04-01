// Bring Google Chrome to front when Claude Code uses browser MCP tools.
// Cross-platform: macOS (AppleScript), Windows (PowerShell), Linux (wmctrl/xdotool).
//
// Toggle: touch .claude/hooks/.no-focus-chrome  → disable
//         rm .claude/hooks/.no-focus-chrome     → enable
const { execSync } = require("child_process");
const { existsSync } = require("fs");
const { join } = require("path");

// Check for disable flag (relative to this script's location)
if (existsSync(join(__dirname, ".no-focus-chrome"))) {
  process.exit(0);
}

try {
  if (process.platform === "darwin") {
    execSync('osascript -e \'tell application "Google Chrome" to activate\'');
  } else if (process.platform === "win32") {
    execSync(
      'powershell -NoProfile -Command "(New-Object -ComObject WScript.Shell).AppActivate(\'Google Chrome\')"'
    );
  } else {
    // Linux — try wmctrl first, fall back to xdotool
    execSync(
      'wmctrl -a "Google Chrome" 2>/dev/null || xdotool search --name "Google Chrome" windowactivate 2>/dev/null'
    );
  }
} catch {
  // Silently ignore — Chrome may not be running yet
}
