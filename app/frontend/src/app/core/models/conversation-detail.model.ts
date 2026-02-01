import type { Message } from './message.model';
import type { Source } from './source.model';
import type { Conversation } from './conversation.model';

export interface ConversationDetail extends Conversation {
  messages: Message[];
  sources: Source[];
}
