# Local Anaconda Web UI preview

From this repository's root, run `./preview/start.sh` and open
<http://127.0.0.1:8765/>. The command builds the preview, watches local UI source
changes, and hosts it on localhost. Press Ctrl+C to stop it. The **Reset preview**
button restores the original sample state.

This preview renders the fork's React wizard and screen components with local
sample data. The network iframe is simulated because its real implementation is
in Cockpit. The installer backend is simulated: D-Bus calls, process launches,
and file writes are intercepted by `preview/cockpit.js`, and the page blocks
network requests. The simulated installation button only shows progress and a
completion screen; it does not alter disks or install an operating system.

The preview source is versioned with this project. Generated files in
`preview/dist/` are rebuilt locally and are not committed.
