import '../styles/ProjectCard.css'

interface SiteProps {
    url: string;
    status: string;
    latency: number;
    onDelete: (url: string) => void;
}

export default function ProjectCard({ url, status, latency, onDelete }: SiteProps) {
    const isUp = status === 'up';

    return (
        <div className="project">
            <div className="project-header">
                <div className="project-title">
                    <div className={`status-indicator ${isUp ? 'status-up' : 'status-down'}`}>
                        <span className="status-dot"></span>
                        {isUp ? 'Online' : 'Offline'}
                    </div>
                    <h3>{new URL(url).hostname}</h3>
                </div>

                <button className="delete-btn" onClick={() => onDelete(url)} title="Poista">
                    <i className="fa-solid fa-trash-can"></i>
                </button>
            </div>

            <p className="text-muted" style={{ fontSize: '0.9rem', wordBreak: 'break-all' }}>
                {url}
            </p>

            <div className="project-meta">
                <div>
                    <p className="meta-label">Viive</p>
                    <p className="meta-value" style={{ color: isUp ? 'var(--accent-2)' : 'var(--muted)' }}>
                        {isUp ? `${latency}ms` : '--'}
                    </p>
                </div>
                <div style={{ fontSize: '1.2rem', opacity: 0.5 }}>
                    <i className={`fa-solid ${isUp ? 'fa-bolt-lightning' : 'fa-circle-exclamation'}`}></i>
                </div>
            </div>
        </div>
    )
}