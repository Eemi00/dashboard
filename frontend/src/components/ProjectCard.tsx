import '../styles/ProjectCard.css'

interface SiteProps {
    url: string;
    status: string;
    latency: number;
}

export default function ProjectCard({ url, status, latency }: SiteProps) {
    return (
        <div className="project">
            <div className="project-top">
                <h3>{new URL(url).hostname}</h3>
                <div className={`pill ${status === 'up' ? 'primary' : ''}`}>
                    {status.toUpperCase()}
                </div>
            </div>

            <p className="text-muted">{url}</p>

            <div className="project-split">
                <div>
                    <p className="meta-label">Vastausaika</p>
                    <div className="meta-value">{latency}ms</div>
                </div>
            </div>
        </div>
    )
}