import { useState } from "react";
import '../styles/AddSite.css'

interface AddSiteProps {
    onSiteAdded: () => void;
}

export default function AddSite({ onSiteAdded }: AddSiteProps) {

    const [url, setUrl] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!url) return

        setLoading(true)
        try {
            await fetch(`http://127.0.0.1:8000/sites?url=${encodeURIComponent(url)}`, {
                method: 'POST',
            })
            setUrl('')
            onSiteAdded()
        } catch (error) {
            console.error("Virhe sivuston lisäämisessä", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="add-site-section">
            <form className="add-site-form" onSubmit={handleSubmit}>
                <i className="fa-solid fa-link" style={{ marginLeft: '16px', opacity: 0.4 }}></i>
                <input
                    type="url"
                    className="add-site-input"
                    placeholder="Syötä monitoroitava URL (esim. https://google.fi)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                />
                <button type="submit" className="add-site-button" disabled={loading}>
                    {loading ? (
                        <i className="fa-solid fa-circle-notch fa-spin"></i>
                    ) : (
                        <i className="fa-solid fa-plus"></i>
                    )}
                    <span>{loading ? 'Lisätään...' : 'Lisää monitori'}</span>
                </button>
            </form>
        </div>
    )
}