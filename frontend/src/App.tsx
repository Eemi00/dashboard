import { useState, useEffect } from "react"
import Nav from "./components/Nav"
import Hero from "./components/Hero"
import ProjectCard from "./components/ProjectCard"
import AddSite from "./components/AddSite"
import './styles/Projects.css'

interface Site {
    url: string;
    name: string;
    category: string;
    status: string;
    latency: number;
}

export default function App() {

    const [sites, setSites] = useState<Site[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [filterCategory, setFilterCategory] = useState('Kaikki')

    const fetchSites = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/sites')
            const data = await response.json()
            setSites(data)
        } catch (error) {
            console.error("Virhe sivustojen hakemisessa:", error)
        }
    }

    const deleteSite = async (url: string) => {
        if (!window.confirm("Haluatko varmasti poistaa tämän monitorin?")) return;

        try {
            await fetch(`http://127.0.0.1:8000/sites?url=${encodeURIComponent(url)}`, {
                method: 'DELETE',
            })
            fetchSites()
        } catch (error) {
            console.error("Virhe poistettaessa:", error)
        }
    }

    const filteredSites = sites.filter(site => {
        // Tarkistetaan että nimi tai URL vastaa haku termiä
        const matchesSearch = site.name.toLowerCase().includes(searchTerm.toLowerCase()) || site.url.toLowerCase().includes(searchTerm.toLowerCase())
        // Tarkistetaan vastaako category (tai jos 'Kaikki' on valittu)
        const matchesCategory = filterCategory === 'Kaikki' || site.category == filterCategory

        return matchesSearch && matchesCategory
    })

    // Haetaan sivustot kun appi lataa ja sen jälkee joka 10 sekunnin välein
    useEffect(() => {
        fetchSites()
        const interval = setInterval(fetchSites, 10000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="layout">
            <Nav />
            <main className="container layout-main">
                <Hero siteCount={sites.length} />

                <AddSite onSiteAdded={fetchSites} />

                <section className="projects">
                    <div className="projects-header">
                        <h2 className="section-title">Aktiiviset monitorit</h2>
                        <p className="text-muted">Seurattujen palveluidesi reaaliaikainen tila</p>
                    </div>

                    <div className="filters-bar">
                        <div className="search-wrapper">
                            <i className="fa-solid fa-magnifying-glass"></i>
                            <input
                                type="text"
                                placeholder="Hae nimellä tai osoitteella..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="filter-input"
                            />
                        </div>

                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="filter-select"
                        >
                            <option value="Kaikki">Kaikki kategoriat</option>
                            <option value="Yleinen">Yleinen</option>
                            <option value="Työ">Työ</option>
                            <option value="Projekti">Projekti</option>
                            <option value="Hupi">Hupi</option>
                        </select>
                    </div>

                    <div className="projects-grid">
                        {filteredSites.map((site, index) => (
                            <ProjectCard key={index} {...site} onDelete={deleteSite} />
                        ))}
                        {sites.length === 0 && (
                            <p className="text-muted">Yhtään sivustoa ei ole lisätty.</p>
                        )}
                    </div>
                </section>
            </main>
        </div>
    )
}