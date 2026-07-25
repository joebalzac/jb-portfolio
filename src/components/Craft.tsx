import { CopyEmail } from './craft/CopyEmail';
import { CraftTile } from './craft/CraftTile';
import { LoadingDots } from './craft/LoadingDots';
import { Section } from './Section';

export function Craft() {
  return (
    <Section id="craft" title="craft">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <CraftTile label="loading dots">
          <LoadingDots />
        </CraftTile>
        <CraftTile label="copy email">
          <CopyEmail />
        </CraftTile>
      </div>
    </Section>
  );
}
