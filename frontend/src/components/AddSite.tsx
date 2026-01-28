import { useState } from "react";
import '../styles/AddSite.css'

interface AddSiteProps {
    onSiteAdded: () => void;
}

export default function AddSite({ onSiteAdded }: AddSiteProps) {

    const [url, setUrl] = useState('')
    const [name, setName] = useState('')
    const [category, setCategory] = useState('Yleinen')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!url) return

        setLoading(true)
        try {

            const query = `url=${encodeURIComponent(url)}&name=${encodeURIComponent(name)}&category=${encodeURIComponent(category)}`

            await fetch(`http://127.0.0.1:8000/sites?${query}`, {
                method: 'POST',
            })
            setUrl('')
            setName('')
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
                <input
                    type="text"
                    className="add-site-input"
                    placeholder="Nimi (esim. Oma Portfolio)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="add-site-input"
                >
                    <option value="Yleinen">Yleinen</option>
                    <option value="Työ">Työ</option>
                    <option value="Projekti">Projekti</option>
                    <option value="Hupi">Hupi</option>
                </select>

                <input
                    type="url"
                    className="add-site-input"
                    placeholder="Syötä monitoroitava URL (esim. https://google.fi)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                />

                <button type="submit" className="add-site-button" disabled={loading}>
                    {loading ? '...' : 'Lisää'}
                </button>
            </form>
        </div>
    )
}