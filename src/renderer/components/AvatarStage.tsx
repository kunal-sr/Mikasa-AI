import type { AvatarIntent } from "../../shared/types";

interface AvatarStageProps {
  avatar: AvatarIntent;
  companionName: string;
}

export function AvatarStage({ avatar, companionName }: AvatarStageProps) {
  return (
    <section className={`avatar-stage emotion-${avatar.emotion}`}>
      <div className="avatar-halo" />
      <div className="avatar-figure">
        <div className="avatar-hair" />
        <div className="avatar-face">
          <div className="avatar-eyes">
            <span />
            <span />
          </div>
          <div className={`avatar-mouth mood-${avatar.emotion}`} />
        </div>
      </div>
      <div className="avatar-caption">
        <span className="eyebrow">Current state</span>
        <h2>{companionName}</h2>
        <p>{avatar.reason}</p>
      </div>
    </section>
  );
}
