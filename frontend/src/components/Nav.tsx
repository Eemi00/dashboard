import '../styles/Nav.css'

export default function Nav() {
    return (
        <div className="nav">
            <div className="container nav-inner">
                <div className="nav-logo">Hallintapaneeli</div>
                <div className="nav-links">
                    <a href="#" className="nav-link active">Koti</a>
                    <a href="#" className="nav-link">Sivustot</a>
                    <a href="#" className="nav-link">Muistiinpanot</a>
                </div>
            </div>
        </div>
    )
}