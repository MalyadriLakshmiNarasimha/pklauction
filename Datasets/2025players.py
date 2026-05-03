from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time
from bs4 import BeautifulSoup
import pandas as pd
import re

# ---------------------------
# Setup Selenium
# ---------------------------
options = Options()
options.add_argument("--headless")
driver = webdriver.Chrome(options=options)

# ---------------------------
# Step 1: Get all team URLs
# ---------------------------
driver.get("https://www.prokabaddi.com/teams")
time.sleep(5)

soup = BeautifulSoup(driver.page_source, "html.parser")

team_urls = set()

for a in soup.find_all("a", href=True):
    href = a["href"]

    if href.startswith("/teams/") and "profile" in href:
        full_url = "https://www.prokabaddi.com" + href

        if "undefined" not in full_url:
            team_urls.add(full_url)

team_urls = list(team_urls)
print(f"✅ Teams Found: {len(team_urls)}")

# ---------------------------
# Filename formatter
# ---------------------------
def format_filename(name):
    name = name.lower()
    name = re.sub(r'[^a-z0-9 ]', '', name)
    name = name.replace(" ", "_")
    return name + ".csv"

# ---------------------------
# Step 2: Scrape each team
# ---------------------------
roles = {"Raider", "Defender", "All Rounder"}


def extract_role(profile_soup):
    for tag in profile_soup.find_all(["p", "span", "div", "h2", "h3"]):
        text = tag.get_text(strip=True)
        if text in roles:
            return text
    return "Unknown"


for url in team_urls:
    try:
        driver.get(url)
        time.sleep(5)

        soup = BeautifulSoup(driver.page_source, "html.parser")

        # Get team name
        title = soup.title.string if soup.title else "unknown_team"
        team_name = title.split("|")[0].strip()

        print(f"Scraping: {team_name}")

        player_links = []
        seen_links = set()
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if href.startswith("/players/") and "profile" in href:
                full_url = "https://www.prokabaddi.com" + href
                if full_url not in seen_links:
                    seen_links.add(full_url)
                    player_links.append(full_url)

        print(f"Players Found: {len(player_links)}")

        players = []
        for player_url in player_links:
            driver.get(player_url)
            time.sleep(2)

            profile_soup = BeautifulSoup(driver.page_source, "html.parser")

            page_title = profile_soup.title.string if profile_soup.title else ""
            name = page_title.split(" profile")[0].strip() if " profile" in page_title else page_title.strip()

            if not name:
                continue

            role = extract_role(profile_soup)

            players.append({
                "name": name,
                "role": role,
                "team": team_name
            })

        # Save CSV per team
        filename = format_filename(team_name)

        df = pd.DataFrame(players)
        df.to_csv(filename, index=False)

        print(f"✅ Saved: {filename}")

    except Exception as e:
        print(f"❌ Error in {url}")
        print(e)

driver.quit()
