import { SpreadTemplate } from '@/app/types/database';

// Define the categories
export const SPREAD_CATEGORIES: Record<string, SpreadTemplate[]> = {
  'Default': [
    { name: 'General 3-Card', positions: ['Card 1', 'Card 2', 'Card 3'] }
  ],
  'Daily Guidance': [
    { name: 'Temporal Flow', positions: ['Past', 'Present', 'Future'] },
    { name: 'Connection Check', positions: ['You', 'Relationship', 'Partner'] },
    { name: 'Holistic Self', positions: ['Mind', 'Body', 'Spirit'] },
    { name: 'Three Planes', positions: ['Physical', 'Emotional', 'Spiritual'] },
    { name: 'Levels of Consciousness', positions: ['Unconscious', 'Conscious', 'Superconscious'] },
    { name: 'State of Being', positions: ['Thinking', 'Feeling', 'Doing'] },
    { name: 'Short-Term Forecast', positions: ['Yesterday', 'Today', 'Tomorrow'] },
    { name: 'Life Balance', positions: ['Relationships', 'Work', 'Play'] },
    { name: 'Purpose Alignment', positions: ['Self', 'Other', 'Purpose'] },
  ],
  'Decision Making': [
    { name: 'The Three Paths', positions: ['Choice 1', 'Choice 2', 'Choice 3'] },
    { name: 'SWOT Analysis', positions: ['Strengths', 'Weaknesses', 'Advice'] },
    { name: 'Dilemma Breaker', positions: ['Choice 1', 'Choice 2', 'How to choose'] },
    { name: 'The Hurdle', positions: ['Situation', 'Obstacle', 'Advice'] },
    { name: 'Moral Compass', positions: ['Good', 'Evil', 'Middle path'] },
    { name: 'Karmic Weight', positions: ['Action', 'Consequences', 'Rewards'] },
    { name: 'Tri-Mind Decision', positions: ['Logical choice', 'Emotional choice', 'Intuitive choice'] },
    { name: 'Cause & Effect', positions: ['Action', 'Reaction', 'Outcome'] },
    { name: 'Perspective Shift', positions: ['Optimistic approach', 'Pessimistic approach', 'Practical approach'] },
  ],
  'Guidance & Evaluations': [
    { name: 'Retrospective', positions: ['What worked', "What didn't work", 'Lessons'] },
    { name: 'Union & Division', positions: ['Brings together', 'Pulls apart', 'Focus'] },
    { name: 'Path Assessment', positions: ['Opportunities', 'Difficulties', 'Advice'] },
    { name: 'Internal Trinity', positions: ['Divine feminine', 'Divine masculine', 'Inner child'] },
    { name: 'Probability Spread', positions: ['Best-case scenario', 'Worst-case scenario', 'Likely outcome'] },
    { name: 'Inside Out', positions: ['External challenge', 'Internal challenge', 'Potential'] },
    { name: 'Emotional Clarity', positions: ['Emotion', "Emotion's source", 'Advice'] },
    { name: 'Overcoming Fear', positions: ['Fear', 'Your response', 'Better response'] },
    { name: 'Point of View', positions: ['Your perspective', 'Their perspective', 'Outsider perspective'] },
    { name: 'Inner State', positions: ['Needs', 'Desires', 'Fears'] },
    { name: 'Creative Driver', positions: ['Your passion', 'Your imagination', 'Your logic'] },
  ],
  'Goal Progress': [
    { name: 'Manifestation', positions: ['You', 'Your position', 'Your potential'] },
    { name: 'The Process', positions: ['Idea', 'Process', 'Goal'] },
    { name: 'Blockage Remover', positions: ['Goal', 'Challenge', 'Overcoming challenge'] },
    { name: 'Conflict Resolution', positions: ['Desire', 'Conflict', 'Resolution'] },
    { name: 'The Journey', positions: ['Passion', 'Direction', 'Destination'] },
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