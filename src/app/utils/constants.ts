import { SpreadTemplate } from '@/app/types/database';

// Define the categories
export const SPREAD_CATEGORIES: Record<string, SpreadTemplate[]> = {
  'Daily Guidance': [
    { name: 'Temporal Flow', positions: ['Past', 'Present', 'Future'] },
    { name: 'Holistic Self', positions: ['Mind', 'Body', 'Spirit'] },
    { name: 'Morning Check-in', positions: ['Dream', 'Waking', 'The Day Ahead'] },
  ],
  'Decision Making': [
    { name: 'SWOT Analysis', positions: ['Strengths', 'Weaknesses', 'Advice'] },
    { name: 'Cause & Effect', positions: ['Action', 'Reaction', 'Outcome'] },
    { name: 'Choice Path', positions: ['Option A', 'Option B', 'Hidden Factor'] },
  ],
  'Guidance & Evaluations': [
    { name: 'Inner State', positions: ['Needs', 'Desires', 'Fears'] },
    { name: 'Relationship Dynamics', positions: ['What Connects', 'What Divides', 'Focus Point'] },
  ],
  'Goal Progress': [
    { name: 'Manifestation', positions: ['You', 'Your Position', 'Potential'] },
    { name: 'The Process', positions: ['Idea', 'Process', 'Goal'] },
  ]
};

export const KNOWN_PANTHEONS = [
  'Greek', 'Norse', 'Celtic', 'Egyptian', 'Hindu', 'Mesopotamian', 
  'Roman', 'Japanese', 'Chinese', 'Slavic', 'Aztec', 'Mayan', 'Yoruba', 
  'Polynesian', 'Mesopotamian'
];

export const CANDLE_NAMES = [
  'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Black', 'White', 'Brown', 'Gold', 'Silver'
];

export const ALL_WIDGETS = ["profile", "moon", "tarot", "item", "deity"];

export const ALL_SUPPORTER_ROLES = ['supporter', 'Goddess', 'Princess', 'Creator', 'admin'];
export const ALL_GUARDIAN_ROLES = ['guardian', ...ALL_SUPPORTER_ROLES];