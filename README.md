# S.P.A.C.E. NET

**Build. Automate. Optimize. Reconnect the Network.**

S.P.A.C.E. NET is a long-term web-based 3D isometric factory automation, production-chain, economy, consortium, event, prestige and cosmetic-monetization game project.

## Official source of truth

- ChatGPT Project: S.P.A.C.E. NET Studio
- Game Design Bible: `S.P.A.C.E. NET — Game Design Bible — Pre-Production Draft 1.0`
- GitHub repository: controlled code and documentation history
- Project OS docs: short operational memory for fast new sessions

## Core rules

- No pay-to-win.
- Success is not sold. Appearance is sold.
- Real money never gives Credits, resources, production speed, energy capacity, market advantage, research speed, event score, leaderboard advantage or stronger machines.
- Monetization is cosmetic-only.
- No player-facing Reset / Restart / Delete Progress system.
- Development-only hidden Debug Clear Save may exist.

## Current target

`v0.1.0 — First Playable Prototype`

The prototype starts from zero. Old prototype code is not used, moved or referenced.

## v0.1 scope

Included:

- 3D isometric scene
- Orthographic camera
- Grid
- NEXUS Core
- Iron Deposit
- Copper Deposit
- Basic Miner
- Basic Processor
- Basic Conveyor
- Small Storage
- Iron Ore
- Copper Ore
- Iron Plate
- Copper Wire
- Simple mission system
- E.V.A. text notifications
- Local save/load

Excluded:

- Energy
- Market
- Contracts
- Consortium
- Events
- Premium store
- Backend
- Multiplayer
- Account system
- Research tree
- Multi-floor factory
- Advanced logistics
- Player-facing reset

## Milestone order

1. Scene & Camera
2. Grid & World Objects
3. Game State & Resources
4. Building Placement
5. Machines & Production
6. Conveyor & Storage
7. NEXUS Missions
8. E.V.A. Notifications
9. Save / Load & Persistence
10. v0.1 Test Pass

## Local run

```bash
cd game
python -m http.server 8080
```

Open:

```text
http://localhost:8080
```
