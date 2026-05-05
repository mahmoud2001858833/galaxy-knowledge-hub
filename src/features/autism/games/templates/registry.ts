import React from 'react';
import { GameTemplateProps, TEMPLATE_META } from './types';
import BubbleTracking from './BubbleTracking';
import LookWithMe from './LookWithMe';
import EmotionCards from './EmotionCards';
import CalmSounds from './CalmSounds';
import StorySequence from './StorySequence';
import MagicMirror from './MagicMirror';
import ChangeTheRule from './ChangeTheRule';
import RequestToGet from './RequestToGet';
import SocialChoice from './SocialChoice';
import RhythmTurns from './RhythmTurns';
import SpotDifference from './SpotDifference';
import NameResponse from './NameResponse';

export const TEMPLATE_REGISTRY: Record<string, React.FC<GameTemplateProps>> = {
  bubble_tracking: BubbleTracking,
  look_with_me: LookWithMe,
  emotion_cards: EmotionCards,
  calm_sounds: CalmSounds,
  story_sequence: StorySequence,
  magic_mirror: MagicMirror,
  change_the_rule: ChangeTheRule,
  request_to_get: RequestToGet,
  social_choice: SocialChoice,
  rhythm_turns: RhythmTurns,
  spot_difference: SpotDifference,
  name_response: NameResponse,
};

export { TEMPLATE_META };
