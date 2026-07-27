import { CraftTile } from './craft/CraftTile';
import { ThinkingTrace } from './craft/ThinkingTrace';
import { ToolCallStack } from './craft/ToolCallStack';
import { Section } from './Section';

export function Craft() {
  return (
    <Section id="craft" title="craft">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <CraftTile label="thinking trace">
          <ThinkingTrace />
        </CraftTile>
        <CraftTile label="tool calls">
          <ToolCallStack />
        </CraftTile>
      </div>
    </Section>
  );
}
