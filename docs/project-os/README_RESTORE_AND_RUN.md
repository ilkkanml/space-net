# S.P.A.C.E. NET — Restore & Run

## Local Restore

Copy the `game/` folder to:

```text
C:\Users\ilkkan\Downloads\space-net-main\space-net-main\game
```

If replacing an old build:
1. Delete the old `game/` folder.
2. Copy this package's `game/` folder.
3. Start local server.

## Run

Open CMD / Terminal:

```bat
cd "C:\Users\ilkkan\Downloads\space-net-main\space-net-main\game"
python -m http.server 8080
```

Open browser:

```text
http://localhost:8080
```

## Debug Save Clear

Developer-only console command:

```js
window.spaceNetDebugClearSave()
```

Player-facing reset is not allowed.

## Recommended Git Commits

```text
fix: stabilize v0.2 mission progression
docs: freeze v0.2 preservation protocol
chore: package v0.2 final freeze build
```
