from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx
import time
import json
import os

app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# Päätetään millä on oikeus käyttää apia
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_FILE = "sites.json" # Luodaan json tiedosto mihin sivustojen osoitteet tallennetaan


def load_sites():
    # Tarkistetaan että sites.json tiedosto on olemassa tietokoneellasi
    if os.path.exists(DB_FILE):
        with open(DB_FILE, "r") as file: # Avataan tiedosto read modessa
            return json.load(file)
    return [] # Jos tiedostoa ei ole palautetaan tyhjä lista


def save_sites(sites_list):
    # Avataan sites.json write modessa
    with open(DB_FILE, "w") as file:
        json.dump(sites_list, file)


# Luodaan array
monitored_sites = load_sites()


# Luodaan funktio jolla voidaan pingata sivustoja ja varmistaa että ne on OK
async def check_site(url: str):
    async with httpx.AsyncClient() as client:
        # Tarkistetaan aika ennenkuin aloitetaan request
        start = time.time()

        try:
            response = await client.get(url, timeout=10.0) # Client.get yrittää vierailla sivustolla. 10 sekunnin timer jotta se ei odota loputtomasti jos sivusto ei ole käynnissä
            latency = round((time.time() - start) * 1000) # Lasketaan montako millisekunttia meni starting ja responsen välissä
            return {"status": "up", "latency": latency, "code": response.status_code}
        
        # Jos sivusto ei vastaa ajetaan except
        except:
            return {"status": "down", "latency": 0, "code": 0}


# Määritellään mitä GET tekee rootissa
@app.get("/")
async def root():
    # Palautetaan viesti että API toimii
    return {"status": "API Toimii"}


@app.get("/sites")
async def get_sites():
    # Luodaan uusi lista
    results = []
    for site in monitored_sites:
        # Tämä ajaa check_site funktion jokaiselle urlille
        status_data = await check_site(site["url"])
        results.append({
            "url": site["url"],
            "status": status_data["status"],
            "latency": status_data["latency"]
        })
    return results


# Määritellään mitä POST add_site tekee
@app.post("/sites")
async def add_site(url: str):
    # Luodaan uusi sivu monitored sites arrayhyn
    new_site = {"url": url}
    monitored_sites.append(new_site)

    save_sites(monitored_sites)

    return new_site


# Määritellään delete funktio
@app.delete("/sites")
async def delete_site(url: str):
    global monitored_sites
    # Luodaan uusi lista missä on kaikki paitsi URL mikä halutaan poistaa
    monitored_sites = [site for site in monitored_sites if site["url"] != url]

    save_sites(monitored_sites)

    return {"message": "Sivusto poistettu monitoroinnista"}