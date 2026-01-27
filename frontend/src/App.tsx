import { useState, useEffect } from "react"
import Nav from "./components/Nav"
import Hero from "./components/Hero"
import ProjectCard from "./components/ProjectCard"
import AddSite from "./components/AddSite"
import './styles/Projects.css'

interface Site {
    url: string;
    status: string;
    latency: number;
}

export default function App() {

    const [sites, setSites] = useState<Site[]>([])

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

                    <div className="projects-grid">
                        {sites.map((site, index) => (
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