import '../styles/Hero.css'

interface HeroProps {
    siteCount: number;
}

export default function Hero({ siteCount }: HeroProps) {
    return (
        <section className="hero">
            <div className="hero-bg"></div>
            <div className="hero-glow"></div>

            <div className="hero-content">
                <span className="hero-eyebrow">Yhteenveto</span>
                <h1 className="hero-title">
                    Sinun <span className="hero-accent">Hallintapaneeli</span>
                </h1>
                <p className="hero-subtitle">
                    Reaaliaikainen monitori ja hallinta sinun nettisivuille ja projekteille.
                </p>

                <div className="hero-split">
                    <div>
                        <p className="meta-label">APIn tilanne</p>
                        <p className="meta-value" style={{color: 'var(--accent-2)'}}>Toiminnallinen</p>
                    </div>
                    <div>
                        <p className="meta-label">Aktiiviset monitorit</p>
                        <p className="meta-value">{siteCount} Palvelua</p>
                    </div>
                </div>
            </div>
        </section>
    )
}