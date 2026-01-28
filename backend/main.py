import socket
import httpx
import time
import json
import os
import asyncio
from urllib.parse import urlparse, parse_qs

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
            return {"status": "up", "latency": latency}
        
        # Jos sivusto ei vastaa ajetaan except
        except:
            return {"status": "down", "latency": 0}
        



# Rakennetaan web-serveri socketti tasolla tässä:

async def handle_request(client):

    global monitored_sites
    
    # Vastaanotetaan max 1024 byteä dataa
    request_data = await asyncio.get_event_loop().sock_recv(client, 1024)

    # Muutetaan bytet stringiksi
    request_text = request_data.decode()

    # Jos request on tyhjä, suljetaan yhteys
    if not request_text:
        client.close()
        return
    
    lines = request_text.split('\n')
    first_line = lines[0].split()

    # Tarkistetaan että rivi on pätevä
    if len(first_line) < 2:
        client.close()
        return
    
    method = first_line[0] # GET, POST tai DELETE
    full_path = first_line[1]

    # Paristaan url hakupalkista jotta saadaan sieltä vain URL osoite mikä lisätään sites.json tiedostoon monitorointiin
    parsed_url = urlparse(full_path)
    path = parsed_url.path
    query_params = parse_qs(parsed_url.query)

    response_body = ""
    status_code = "200 OK"

    # Haetaan sivustot
    if path == "/sites" and method == "GET":
        results = []
        # Loopataan sivustojen läpi ja tarkistetaan niiden status
        for site in monitored_sites:
            status_data = await check_site(site["url"])
            results.append({
                "url": site["url"],
                "name": site.get("name", ""),
                "category": site.get("category", ""),
                "status": status_data["status"],
                "latency": status_data["latency"]
            })
        # Muunnetaan listan JSON stringiksi
        response_body = json.dumps(results)

    elif path == "/sites" and method == "POST":
        url = query_params.get('url', [''])[0]
        name = query_params.get('name', [''])[0]
        category = query_params.get('category', ['Yleinen'])[0]

        if url:
            new_site = {
                "url": url,
                "name": name if name else url, # Jos nimi on tyhjä näytetään url
                "category": category
            }
            monitored_sites.append(new_site)
            # Tallenttaa sites.json tiedostoon
            save_sites(monitored_sites)

            # Palautetaan sivu joka juuri lisättiin
            response_body = json.dumps(new_site)

    elif path == "/sites" and method == "DELETE":
        # Haetaan URL mikä halutaan poistaa querysta
        url_to_delete = query_params.get('url', [''])[0].strip().strip('/')

        if url_to_delete:
            # Pidetään kaikki muut sivustot paitsi se mikä halutaan poistaa
            monitored_sites = [
                site for site in monitored_sites
                if site["url"] != url_to_delete
            ]

            # Tallennetaan päivitetty lista JSONiin
            save_sites(monitored_sites)

            response_body = json.dumps({"message": "Sivusto poistettu"})

    # Selaimet joskus lähettää "testi" pyynnön enne POST tai DELETE methodia. Siksi annetaan tyhjä vastaus
    elif method == "OPTIONS":
        # Lähetetään tyhjä vastaus
        status_code = "204 No Content"
        response_body = ""

    response = f"HTTP/1.1 {status_code}\r\n"
    response += "Content-Type: application/json\r\n"

    # Lisätään CORS headerit jotta react voi puhua tälle socketille
    response += "Access-Control-Allow-Origin: *\r\n"
    response += "Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS\r\n"
    response += "Access-Control-Allow-Headers: *\r\n"

    # Kerrotaan selaimelle paljonko tekstiä on tulossa
    response += f"Content-Length: {len(response_body)}\r\n"

    # Yks tyhjä rivi
    response += "\r\n"

    # Lisätään JSON data
    response += response_body

    # Lähetetään se takaisin läpi socketin ja suljetaan se
    await asyncio.get_event_loop().sock_sendall(client, response.encode())
    client.close()


async def start_server():
    # Luodaan socketti
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    # Oikeutetaan portti takaisin käyttöön heti tämän sovelluksen sulkemisen jälkeen
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

    # Annetaan socketille osoite ja portti
    server.bind(('127.0.0.1', 8000))

    # Aloitetaan kuuntelemaan requesteja
    server.listen(5)

    server.setblocking(False)

    print("Web-palvelin kännissä portissa 8000")

    loop = asyncio.get_event_loop()

    while True:
        # Odotetaan että joku vierailee URL:ssa
        client, addr = await loop.sock_accept(server)

        # Annetaan tietyille vieraille uusi tehtävä
        asyncio.create_task(handle_request(client))


if __name__ == "__main__":
    asyncio.run(start_server())