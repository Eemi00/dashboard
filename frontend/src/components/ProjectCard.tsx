import { useState } from 'react'
import '../styles/ProjectCard.css'

interface SiteProps {
    id: string;
    url: string;
    name: string;
    category: string;
    screenshot: string;
    status: string;
    latency: number;
    onDelete: (url: string) => void;
}

export default function ProjectCard({ id, url, name, category, screenshot, status, latency, onDelete }: SiteProps) {

    const isUp = status === 'up';

    const [imageKey, setImageKey] = useState(0);

    return (
        <div className="project">
            <div className="project-preview">
                {screenshot ? (
                    <img
                        key={imageKey}
                        src={`http://127.0.0.1:8000/screenshots/${screenshot}`}
                        alt={name}
                        className="project-screenshot"
                        onError={() => {
                            // Jos kuva ei lataudu, yritä uudelleen 3 sekunnin päästä
                            setTimeout(() => setImageKey(prev => prev + 1), 3000);
                        }}
                    />
                ) : (
                    <div className="project-screenshot-placeholder">
                        <i className="fa-solid fa-image"></i>
                    </div>
                )}

                <div className={`status-badge ${isUp ? 'status-up' : 'status-down'}`}>
                    <span className="status-dot"></span>
                    {isUp ? 'Online' : 'Offline'}
                </div>

                <button className="delete-btn-overlay" onClick={() => onDelete(id)} title="Poista">
                    <i className="fa-solid fa-trash-can"></i>
                </button>
            </div>

            <div className="project-content">
                <div className="project-header">
                    <h3 className="project-name">{name || new URL(url).hostname}</h3>
                    <span className="category-tag">{category}</span>
                </div>

                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-url"
                    title="Avaa uudessa välilehdessä"
                >
                    <i className="fa-solid fa-arrow-up-right-from-square"></i>
                    {new URL(url).hostname}
                </a>

                {/* Viive info */}
                <div className="project-latency">
                    <i className={`fa-solid ${isUp ? 'fa-bolt-lightning' : 'fa-circle-exclamation'}`}></i>
                    <span className="latency-label">Viive:</span>
                    <span className="latency-value">{isUp ? `${latency}ms` : 'Ei saatavilla'}</span>
                </div>
            </div>
        </div>
    )
}