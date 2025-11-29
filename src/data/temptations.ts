/**
 * Temptations - forced choice interrupts that constantly tempt the player
 * toward risky behavior. The rock star lifestyle is always calling.
 */

import { Temptation } from '@/engine/types';

export const ALL_TEMPTATIONS: Temptation[] = [
  // ==========================================================================
  // SUBSTANCE TEMPTATIONS
  // ==========================================================================
  {
    id: 'bandmate_weed',
    source: 'bandmate',
    prompt: 'Your guitarist pulls out a joint after practice.',
    offer: '"Want a hit? Helps with the creativity, you know."',
    baseChance: 0.15,
    conditions: { minWeek: 2 },
    accept: {
      id: 'accept',
      label: 'Sure, why not',
      effects: { addiction: 2, stability: 3, burnout: -2 },
      resultText: 'You share the joint. The stress melts away. This is nice.',
    },
    decline: {
      id: 'decline',
      label: 'I\'m good',
      effects: {},
      resultText: 'You wave it off. Your bandmate shrugs.',
    },
    cooldown: 4,
  },
  {
    id: 'afterparty_coke',
    source: 'fan',
    prompt: 'At the afterparty, someone offers you a line.',
    offer: '"Come on, everyone\'s doing it. You\'re a rock star now."',
    baseChance: 0.12,
    conditions: { minWeek: 8, minHype: 20 },
    accept: {
      id: 'accept',
      label: 'When in Rome...',
      effects: { addiction: 5, hype: 3, health: -5, image: 2 },
      resultText: 'The night becomes electric. You feel invincible. This is what it\'s all about.',
    },
    decline: {
      id: 'decline',
      label: 'Not my thing',
      effects: { cred: 1 },
      resultText: 'You pass. Some people look at you weird, but whatever.',
    },
    cooldown: 3,
  },
  {
    id: 'dealer_connection',
    source: 'dealer',
    prompt: 'A guy backstage says he can get you "whatever you need."',
    offer: '"First taste is free. You look like someone who knows how to party."',
    baseChance: 0.08,
    conditions: { minWeek: 10, minHype: 30 },
    accept: {
      id: 'accept',
      label: 'What have you got?',
      effects: { addiction: 8, stability: -5, image: 3, health: -8 },
      resultText: 'You make a new "friend." The night gets blurry but you feel amazing.',
    },
    decline: {
      id: 'decline',
      label: 'Get lost',
      effects: {},
      resultText: 'He backs off. Smart move. Probably.',
    },
    cooldown: 6,
  },
  {
    id: 'pills_for_energy',
    source: 'bandmate',
    prompt: 'Your drummer offers you some pills before the show.',
    offer: '"These will keep you going all night. Trust me."',
    baseChance: 0.10,
    conditions: { minBurnout: 40 },
    accept: {
      id: 'accept',
      label: 'I could use the boost',
      effects: { addiction: 4, burnout: -10, health: -3, skill: 2 },
      resultText: 'You\'re wired. The show is intense. You\'ll worry about the crash later.',
    },
    decline: {
      id: 'decline',
      label: 'I\'ll power through natural',
      effects: { burnout: 2 },
      resultText: 'You tough it out. It\'s harder, but at least you know what\'s real.',
    },
    cooldown: 4,
  },
  {
    id: 'drink_away_problems',
    source: 'self',
    prompt: 'It\'s been a rough week. The bottle is calling.',
    offer: 'Just a few drinks to take the edge off...',
    baseChance: 0.12,
    conditions: { maxStability: 40 },
    accept: {
      id: 'accept',
      label: 'Pour one out',
      effects: { addiction: 3, stability: 5, health: -2, burnout: -3 },
      resultText: 'The whiskey burns going down. The world gets softer. Better.',
    },
    decline: {
      id: 'decline',
      label: 'Stay sharp',
      effects: { stability: -2 },
      resultText: 'You resist. The feelings are still there, but at least you\'re present.',
    },
    cooldown: 3,
  },

  // ==========================================================================
  // MONEY TEMPTATIONS
  // ==========================================================================
  {
    id: 'shady_gig',
    source: 'promoter',
    prompt: 'A sketchy promoter offers you a last-minute gig.',
    offer: '"Cash in hand, no questions asked. The venue is... informal."',
    baseChance: 0.10,
    conditions: { maxMoney: 200 },
    accept: {
      id: 'accept',
      label: 'Money is money',
      effects: { money: 300, cred: -5, industryGoodwill: -3 },
      resultText: 'The gig is in someone\'s warehouse. Sketchy, but the cash is real.',
    },
    decline: {
      id: 'decline',
      label: 'Too risky',
      effects: {},
      resultText: 'You pass. Better to stay hungry than get burned.',
    },
    cooldown: 5,
  },
  {
    id: 'sell_out_commercial',
    source: 'label',
    prompt: 'A brand wants to use your song in a commercial.',
    offer: '"It\'s a car ad. They\'re offering $2000. Your fans might hate it though."',
    baseChance: 0.06,
    conditions: { minHype: 40, hasLabelDeal: true },
    accept: {
      id: 'accept',
      label: 'Cash the check',
      effects: { money: 2000, cred: -15, hype: 5 },
      resultText: 'The money hits your account. Your old fans are posting "RIP" memes.',
    },
    decline: {
      id: 'decline',
      label: 'Artistic integrity',
      effects: { cred: 5 },
      resultText: 'You turn it down. Your credibility is worth more than that. Hopefully.',
    },
    cooldown: 10,
  },
  {
    id: 'borrow_from_label',
    source: 'label',
    prompt: 'Your label offers an advance on future royalties.',
    offer: '"$1500 now. We\'ll just deduct it from your next few checks."',
    baseChance: 0.08,
    conditions: { maxMoney: 100, hasLabelDeal: true },
    accept: {
      id: 'accept',
      label: 'I need it now',
      effects: { money: 1500, industryGoodwill: -5 },
      resultText: 'Sweet relief. You\'ll worry about paying it back later.',
    },
    decline: {
      id: 'decline',
      label: 'Bad idea',
      effects: {},
      resultText: 'You resist the temptation. Debt is a trap.',
    },
    cooldown: 8,
  },
  {
    id: 'skip_rent',
    source: 'self',
    prompt: 'Rent is due but there\'s a killer vintage guitar for sale.',
    offer: 'You could just... be late on rent this month.',
    baseChance: 0.08,
    conditions: { minMoney: 300, maxMoney: 600 },
    accept: {
      id: 'accept',
      label: 'The guitar speaks to me',
      effects: { money: -400, skill: 3, stability: -5 },
      resultText: 'The guitar is beautiful. Your landlord is less beautiful when they call.',
    },
    decline: {
      id: 'decline',
      label: 'Be responsible',
      effects: {},
      resultText: 'You pay rent like a boring adult. The guitar finds another home.',
    },
    cooldown: 6,
  },

  // ==========================================================================
  // RELATIONSHIP TEMPTATIONS
  // ==========================================================================
  {
    id: 'groupie_attention',
    source: 'fan',
    prompt: 'An attractive fan is very interested in going home with you.',
    offer: '"I\'ve been following you since the beginning. Let me show you how much I appreciate your music."',
    baseChance: 0.12,
    conditions: { minHype: 25 },
    accept: {
      id: 'accept',
      label: 'Why not?',
      effects: { image: 2, stability: -3, hype: 1 },
      resultText: 'A fun night. No strings attached. Probably.',
    },
    decline: {
      id: 'decline',
      label: 'Keep it professional',
      effects: { stability: 1 },
      resultText: 'You politely decline. Your boundaries are intact.',
    },
    cooldown: 3,
  },
  {
    id: 'trash_talk_rival',
    source: 'journalist',
    prompt: 'A journalist asks what you think of a rival band.',
    offer: '"Off the record - are they as bad as everyone says?"',
    baseChance: 0.10,
    conditions: { minWeek: 6 },
    accept: {
      id: 'accept',
      label: 'Spill the tea',
      effects: { hype: 5, cred: -3, industryGoodwill: -5 },
      resultText: 'Your quotes go viral. The drama is entertaining but you\'ve made enemies.',
    },
    decline: {
      id: 'decline',
      label: 'No comment',
      effects: { cred: 1 },
      resultText: 'You take the high road. Boring, but diplomatic.',
    },
    cooldown: 5,
  },
  {
    id: 'ditch_bandmate_gig',
    source: 'promoter',
    prompt: 'A solo opportunity comes up, but it conflicts with band practice.',
    offer: '"This could be huge for YOU specifically. The band can wait."',
    baseChance: 0.07,
    conditions: { minWeek: 10, minHype: 30 },
    accept: {
      id: 'accept',
      label: 'My career comes first',
      effects: { hype: 8, industryGoodwill: 3, stability: -8 },
      resultText: 'The opportunity pays off, but your bandmates are pissed.',
    },
    decline: {
      id: 'decline',
      label: 'The band comes first',
      effects: { stability: 3 },
      resultText: 'You stay loyal. The band appreciates it.',
    },
    cooldown: 8,
  },

  // ==========================================================================
  // EGO TEMPTATIONS
  // ==========================================================================
  {
    id: 'trash_the_room',
    source: 'self',
    prompt: 'The hotel room is boring. The TV is right there.',
    offer: 'Rock stars are supposed to trash hotel rooms, right?',
    baseChance: 0.08,
    conditions: { minHype: 40, minMoney: 500 },
    accept: {
      id: 'accept',
      label: 'ROCK AND ROLL!',
      effects: { money: -300, image: 5, hype: 3, stability: -2 },
      resultText: 'The TV goes through the window. You feel alive. The bill, less so.',
    },
    decline: {
      id: 'decline',
      label: 'Be an adult',
      effects: {},
      resultText: 'You watch TV like a normal person. How dull.',
    },
    cooldown: 6,
  },
  {
    id: 'demand_rider',
    source: 'self',
    prompt: 'The venue didn\'t get your dressing room rider right.',
    offer: 'You specifically asked for green M&Ms only. This is unacceptable.',
    baseChance: 0.06,
    conditions: { minHype: 50, minFans: 1000 },
    accept: {
      id: 'accept',
      label: 'Throw a fit',
      effects: { image: 3, industryGoodwill: -8, stability: -3 },
      resultText: 'You make a scene. The staff scrambles. You feel powerful and terrible.',
    },
    decline: {
      id: 'decline',
      label: 'Let it go',
      effects: { stability: 2 },
      resultText: 'You eat the regular M&Ms. They taste fine.',
    },
    cooldown: 8,
  },
  {
    id: 'buy_stupid_thing',
    source: 'self',
    prompt: 'You pass a store with the most ridiculous leather jacket.',
    offer: 'It costs $800. It\'s covered in studs. You need it.',
    baseChance: 0.10,
    conditions: { minMoney: 1000 },
    accept: {
      id: 'accept',
      label: 'TREAT YOURSELF',
      effects: { money: -800, image: 5, hype: 2 },
      resultText: 'You look incredible. Your bank account looks less incredible.',
    },
    decline: {
      id: 'decline',
      label: 'Save the money',
      effects: {},
      resultText: 'You walk away. The jacket haunts your dreams.',
    },
    cooldown: 6,
  },

  // ==========================================================================
  // HEALTH TEMPTATIONS
  // ==========================================================================
  {
    id: 'skip_sleep_write',
    source: 'self',
    prompt: 'It\'s 3 AM but you\'re in a creative groove.',
    offer: 'Sleep is for the weak. The muse is speaking.',
    baseChance: 0.12,
    conditions: { minWeek: 3 },
    accept: {
      id: 'accept',
      label: 'Push through',
      effects: { skill: 2, health: -5, burnout: 5 },
      resultText: 'You write until dawn. The songs are good. You feel terrible.',
    },
    decline: {
      id: 'decline',
      label: 'Get some rest',
      effects: { health: 2 },
      resultText: 'You sleep. The muse will still be there tomorrow. Probably.',
    },
    cooldown: 4,
  },
  {
    id: 'play_through_sickness',
    source: 'promoter',
    prompt: 'You\'re feeling sick but there\'s a show tonight.',
    offer: '"The fans are counting on you. Can you power through?"',
    baseChance: 0.08,
    conditions: { maxHealth: 50 },
    accept: {
      id: 'accept',
      label: 'The show must go on',
      effects: { health: -10, hype: 5, cred: 3 },
      resultText: 'You play through the fever. Legendary. Also possibly stupid.',
    },
    decline: {
      id: 'decline',
      label: 'Cancel the show',
      effects: { health: 5, hype: -5, money: -200 },
      resultText: 'You cancel. Some fans are understanding. Others are not.',
    },
    cooldown: 5,
  },
  {
    id: 'ignore_warning_signs',
    source: 'self',
    prompt: 'Your body is telling you to slow down.',
    offer: 'But you\'re so close to making it. Just a little more...',
    baseChance: 0.10,
    conditions: { minBurnout: 60, minHype: 30 },
    accept: {
      id: 'accept',
      label: 'Keep grinding',
      effects: { burnout: 10, health: -5, hype: 3, skill: 1 },
      resultText: 'You push through the exhaustion. The music industry respects nothing else.',
    },
    decline: {
      id: 'decline',
      label: 'Take a break',
      effects: { burnout: -5, hype: -3 },
      resultText: 'You step back. Your body thanks you. Your career... we\'ll see.',
    },
    cooldown: 4,
  },

  // ==========================================================================
  // STUDIO TEMPTATIONS
  // ==========================================================================
  {
    id: 'one_more_take',
    source: 'self',
    prompt: 'The song is good. But it could be better.',
    offer: 'Just one more take. Then another. Then another...',
    baseChance: 0.12,
    conditions: { inStudio: true },
    accept: {
      id: 'accept',
      label: 'Chase perfection',
      effects: { skill: 1, burnout: 5, money: -100 },
      resultText: 'Four hours later, you\'ve got 47 takes. You\'re not sure which is best anymore.',
    },
    decline: {
      id: 'decline',
      label: 'Good enough',
      effects: { burnout: -2 },
      resultText: 'You call it. Done is better than perfect.',
    },
    cooldown: 2,
  },
];

/**
 * Check if a temptation can trigger given current game state
 */
export function canTemptationTrigger(temptation: Temptation, state: {
  player: {
    addiction: number;
    money: number;
    hype: number;
    health: number;
    stability: number;
    burnout: number;
    flags: { hasLabelDeal: boolean; inStudio: boolean; onTour: boolean };
  };
  week: number;
  coreFans: number;
}): boolean {
  const c = temptation.conditions;
  if (!c) return true;

  const { player, week, coreFans } = state;

  if (c.minWeek !== undefined && week < c.minWeek) return false;
  if (c.minAddiction !== undefined && player.addiction < c.minAddiction) return false;
  if (c.maxAddiction !== undefined && player.addiction > c.maxAddiction) return false;
  if (c.minMoney !== undefined && player.money < c.minMoney) return false;
  if (c.maxMoney !== undefined && player.money > c.maxMoney) return false;
  if (c.minHype !== undefined && player.hype < c.minHype) return false;
  if (c.minFans !== undefined && coreFans < c.minFans) return false;
  if (c.minBurnout !== undefined && player.burnout < c.minBurnout) return false;
  if (c.maxBurnout !== undefined && player.burnout > c.maxBurnout) return false;
  if (c.minStability !== undefined && player.stability < c.minStability) return false;
  if (c.maxStability !== undefined && player.stability > c.maxStability) return false;
  if (c.minHealth !== undefined && player.health < c.minHealth) return false;
  if (c.maxHealth !== undefined && player.health > c.maxHealth) return false;
  if (c.hasLabelDeal !== undefined && player.flags.hasLabelDeal !== c.hasLabelDeal) return false;
  if (c.inStudio !== undefined && player.flags.inStudio !== c.inStudio) return false;
  if (c.onTour !== undefined && player.flags.onTour !== c.onTour) return false;

  return true;
}
