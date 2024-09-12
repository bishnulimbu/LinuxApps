// toggleKeyboard.js
const { exec } = require("child_process");

// Function to execute a shell command and return it as a Promise
function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${command}`);
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}

// Function to find the device ID of the AT Translated Set 2 keyboard
async function getKeyboardId() {
  try {
    const output = await execCommand("xinput list");
    const lines = output.split("\n");
    for (const line of lines) {
      if (line.includes("AT Translated Set 2 keyboard")) {
        const match = line.match(/id=(\d+)/);
        if (match) {
          const id = match[1];
          console.log(`Keyboard found. ID: ${id}`);
          return id; // Return the device ID
        }
      }
    }
    console.error("Keyboard not found");
    return null;
  } catch (error) {
    console.error("Failed to list input devices:", error);
    return null;
  }
}

// Function to get the current state of the keyboard (enabled or disabled)
async function isKeyboardEnabled(id) {
  try {
    const output = await execCommand(`xinput list-props ${id}`);
    const lines = output.split("\n");
    for (const line of lines) {
      // Check for the line containing "Device Enabled (ID):"
      if (line.includes("Device Enabled")) {
        const match = line.match(/Device Enabled \(\d+\):\s+(\d)/);
        if (match) {
          const enabled = match[1] === "1"; // 1 means enabled, 0 means disabled
          console.log(
            `Keyboard is currently ${enabled ? "enabled" : "disabled"}.`,
          );
          return enabled;
        }
      }
    }
    console.error("Could not determine keyboard state.");
    return false; // Assume disabled if state can't be determined
  } catch (error) {
    console.error("Failed to get keyboard state:", error);
    return false; // Assume disabled if there's an error
  }
}

// Function to toggle the keyboard state
async function toggleKeyboard() {
  const id = await getKeyboardId();
  if (!id) {
    console.error("Unable to find keyboard ID.");
    return;
  }

  const enabled = await isKeyboardEnabled(id);
  try {
    if (enabled) {
      console.log(`Disabling keyboard with ID: ${id}`);
      await execCommand(`xinput disable ${id}`);
      console.log(`Keyboard disabled successfully! ID: ${id}`);
    } else {
      console.log(`Enabling keyboard with ID: ${id}`);
      await execCommand(`xinput enable ${id}`);
      console.log(`Keyboard enabled successfully! ID: ${id}`);
    }
  } catch (error) {
    console.error("Failed to toggle keyboard state:", error);
  }
}

// Execute the toggle function
toggleKeyboard();
