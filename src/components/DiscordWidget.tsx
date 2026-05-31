'use client';

interface DiscordWidgetProps {
  serverId?: string;
  theme?: 'dark' | 'light';
  width?: number;
  height?: number;
}

export function DiscordWidget({
  serverId = '1234567890', // Replace with actual server ID
  theme = 'dark',
  width = 350,
  height = 400,
}: DiscordWidgetProps) {
  return (
    <div className="discord-widget">
      <div className="discord-widget-header">
        <span className="discord-widget-icon">D</span>
        <span className="discord-widget-title">Join our Discord</span>
      </div>
      <div className="discord-widget-body">
        <iframe
          src={`https://discord.com/widget?id=${serverId}&theme=${theme}`}
          width={width}
          height={height}
          sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
          title="Discord Widget"
          style={{ border: 'none', borderRadius: '8px' }}
        />
      </div>
      <div className="discord-widget-cta">
        <a
          href="https://discord.gg/cnnM32wK"
          target="_blank"
          rel="noopener noreferrer"
          className="discord-widget-join-btn"
        >
          Join Server
        </a>
      </div>
    </div>
  );
}

export function DiscordInviteCard() {
  return (
    <div className="discord-invite-card">
      <div className="discord-invite-left">
        <div className="discord-invite-icon">D</div>
        <div className="discord-invite-info">
          <span className="discord-invite-name">Pokemon Arena</span>
          <span className="discord-invite-members">Community Server</span>
        </div>
      </div>
      <a
        href="https://discord.gg/cnnM32wK"
        target="_blank"
        rel="noopener noreferrer"
        className="discord-invite-btn"
      >
        Join
      </a>
    </div>
  );
}
