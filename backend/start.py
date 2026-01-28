import os
import subprocess
import time
import sys

# Tiedosto mitä halutaan tarkkailla
FILE_TO_WATCH = "main.py"

def get_last_modified():
    return os.path.getmtime(FILE_TO_WATCH)

def start_server():
    print(f"Käynnistetään {FILE_TO_WATCH}")
    # Ajetaan 'python main.py' erillisenä tausta prosessina
    return subprocess.Popen([sys.executable, FILE_TO_WATCH])

if __name__ == "__main__":
    # Haetaan timestampit
    last_mtime = get_last_modified()
    server_process = start_server()

    try:
        while True:
            time.sleep(1) # Odotetaan sekuntti

            # Tarkistetaan timestamp uudestaan
            current_mtime = get_last_modified()

            # Jos ne eivät mätsää käyttäjä tallensi tiedoston
            if current_mtime != last_mtime:
                print("Muutos havaittu! Käynnistetään uudelleen...")
                
                # Suljetaan vanha prosessi
                server_process.terminate()
                # Odotetaan että se sulkeutuu
                server_process.wait()

                # Käynnistetään uusi
                server_process = start_server()

                # Päivitetään timestamp jotta ei käynnistetä heti uudelleen
                last_mtime = current_mtime
    except KeyboardInterrupt:
        print("\nPalvelin pysäytetty.")
        server_process.terminate()