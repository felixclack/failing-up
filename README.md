# Failing Up: A Rock Star Story

A text-based, turn-based rock career simulation game. Start as a broke musician with dreams of stardom and navigate the chaotic world of the music industry. Make it big, flame out spectacularly, or find something in between.

**[Play Now](https://failing-up.vercel.app)** | Install as a PWA on your phone for offline play

## The Game

You start with nothing but talent and ambition. Each week you choose an action: write songs, rehearse with your band, play gigs, record an album, tour, or just try to survive. Random events throw curveballs—band drama, industry sharks, personal demons, and moments of unexpected triumph.

Your choices shape your career. Will you sell out for a record deal? Push your bandmates too hard? Let success go to your head? The music industry doesn't care about your dreams—it's up to you to make them happen.

### Features

- **Turn-based gameplay**: Each turn is a week in your career
- **Deep stat system**: Balance talent, skill, health, addiction, hype, and more
- **Dynamic events**: 60+ events that trigger based on your situation
- **Band management**: Hire, fire, and deal with bandmate drama
- **Music industry simulation**: Label deals, album sales, touring economics
- **Multiple endings**: From arena headliner to cautionary tale
- **Mobile-first design**: Optimized for playing on your phone
- **Offline support**: PWA with full offline capability

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Jest (300+ tests)
- **PWA**: next-pwa for offline support
- **Deployment**: Vercel

## Project Structure

```
src/
├── app/                    # Next.js pages
├── components/
│   └── game/              # Game UI components
│       ├── GameScreen.tsx     # Main game layout (mobile + desktop)
│       ├── ActionPanel.tsx    # Action selection
│       ├── EventModal.tsx     # Event presentation
│       ├── StatsDisplay.tsx   # Player stats
│       └── ...
├── engine/                # Core game logic (framework-agnostic)
│   ├── types.ts           # TypeScript interfaces
│   ├── state.ts           # Game state management
│   ├── actions.ts         # Weekly actions & effects
│   ├── events.ts          # Event system
│   ├── arcs.ts            # Multi-event storylines
│   ├── economy.ts         # Money, labels, sales
│   ├── band.ts            # Bandmate logic
│   ├── streaming.ts       # Social media & streaming
│   ├── endings.ts         # Ending determination
│   └── turn.ts            # Turn resolution
├── data/                  # Game content
│   ├── events.ts          # Event definitions
│   ├── bandEvents.ts      # Band-specific events
│   ├── labelEvents.ts     # Industry events
│   ├── streamingEvents.ts # Social media events
│   └── arcs.ts            # Story arcs
└── hooks/
    └── useGame.ts         # React game state hook
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/failing-up.git
cd failing-up

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm test         # Run tests
npm run lint     # Run linter
```

## Contributing

Contributions are welcome! Here's how to get started:

### Good First Issues

- **Add new events**: The game needs more variety. Check `src/data/events.ts` for examples.
- **Write new story arcs**: Multi-event storylines in `src/data/arcs.ts`
- **Balance tweaks**: Adjust numbers in `src/engine/actions.ts` or `src/engine/economy.ts`
- **UI improvements**: Better mobile experience, animations, accessibility

### Adding a New Event

1. Pick a category: gig, band, money, health, scene, or streaming
2. Add your event to the appropriate file in `src/data/`
3. Define trigger conditions (when should this event appear?)
4. Write compelling choices with meaningful tradeoffs
5. If the event references a specific action (like gigs or rehearsal), add `requiredAction`

Example event structure:

```typescript
{
  id: 'EV_YOUR_EVENT',
  triggerConditions: {
    minFans: 1000,        // Only trigger with 1000+ fans
    minHype: 30,          // Requires some buzz
  },
  weight: 3,              // Higher = more likely to be selected
  requiredAction: 'PLAY_LOCAL_GIG',  // Only after this action
  textIntro: 'Something dramatic happens...',
  choices: [
    {
      id: 'CHOICE_A',
      label: 'Do the risky thing',
      outcomeText: 'It pays off spectacularly.',
      statChanges: { hype: 10, cred: -5 },
    },
    {
      id: 'CHOICE_B',
      label: 'Play it safe',
      outcomeText: 'Nothing ventured, nothing gained.',
      statChanges: { stability: 3 },
    },
  ],
}
```

### Adding a New Action

1. Add the action ID to `ActionId` type in `src/engine/types.ts`
2. Define the action in `ACTIONS` object in `src/engine/actions.ts`
3. Implement the execution function
4. Add to appropriate category in `ActionPanel.tsx` and `MobileActionPanel.tsx`
5. Write tests

### Code Style

- Keep the engine logic framework-agnostic (no React in `/engine`)
- Write tests for game logic changes
- Use descriptive event/choice IDs
- Events should have meaningful choices, not obvious "good" vs "bad" options

### Pull Request Process

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-event`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit with clear message
6. Push and open a PR

## Game Design

For detailed game design documentation, see [DESIGN.md](./DESIGN.md).

For implementation status and architecture details, see [IMPLEMENTATION.md](./IMPLEMENTATION.md).

### Core Stats

| Stat | Description |
|------|-------------|
| Talent | Raw musical ability |
| Skill | Learned technique |
| Image | Public perception |
| Cred | Respect from the scene |
| Health | Physical wellbeing |
| Stability | Mental state |
| Addiction | Substance dependency |
| Burnout | Exhaustion level |
| Hype | Current buzz |
| Money | Cash on hand |

### Actions

| Action | Effect |
|--------|--------|
| Write | Create new songs |
| Rehearse | Improve band tightness |
| Play Local Gig | Build local fanbase |
| Record | Produce an album |
| Release Single | Drop a track on streaming |
| Tour | Extended road shows |
| Promote | Marketing push |
| Network | Industry connections |
| Post Content | Social media engagement |
| Rest | Recover health and burnout |
| Party | Fun but risky |
| Side Job | Earn survival money |

## License

MIT

## Acknowledgments

- Inspired by games like Game Dev Story, Football Manager, and the chaos of real music industry stories
- Built with Claude Code
