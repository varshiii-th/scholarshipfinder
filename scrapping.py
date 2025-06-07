from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import time
import re
from pymongo import MongoClient

# Exchange rates (approximate, as of June 2025)
exchange_rates = {
    'USD': 85,
    'GBP': 105,
    'EUR': 90,
    'JPY': 0.55,
    'RM': 20,
    'NZD': 50,
    'INR': 1
}

# MongoDB setup
client = MongoClient("mongodb://localhost:27017/")
db = client['test']
collection = db['newly']

# Chrome options
options = Options()
options.add_argument("--headless")
options.add_argument("--disable-gpu")
options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36")
options.add_argument("--disable-blink-features=AutomationControlled")

driver = webdriver.Chrome(options=options)

def extract_study_levels(eligibility_text):
    """Extract study levels from eligibility text"""
    eligibility_text = eligibility_text.lower()

    undergraduate_keywords = ['undergraduate', 'ug', 'bachelor', 'b.tech', 'btech', 'b.e', 'be']
    postgraduate_keywords = ['master', "mba", 'postgraduate', 'm.tech', 'm.s', 'm.d', 'md', 'ms', 'msc', 'graduate', 'pg']
    doctoral_keywords = ['ph.d', 'phd', 'research', 'doctor']

    undergraduate = any(keyword in eligibility_text for keyword in undergraduate_keywords)
    postgraduate = any(keyword in eligibility_text for keyword in postgraduate_keywords)
    doctoral = any(keyword in eligibility_text for keyword in doctoral_keywords)

    return int(undergraduate), int(postgraduate), int(doctoral)

def extract_amount(award_str):
    """Extract amount, currency, and periodicity from award string"""
    
    # Check for non-numeric cases
    if 'full tuition' in award_str.lower():
        return None, None, None, 'full'
    if any(phrase in award_str.lower() for phrase in ['variable amount', 'scholarships, prizes']):
        return None, None, None, 'variable'
    
    # Normalize string: preserve commas and reduce extra spaces
    cleaned_str = re.sub(r'\s+', ' ', award_str).strip()

    # Regex to match INR equivalent in parentheses
    inr_pattern = r'\(approximately\s*₹\s*([\d,]+)(?:\.\d{2})?\)'
    inr_match = re.search(inr_pattern, cleaned_str)

    amount = None
    currency = None
    periodicity = 'annual'  # Default to annual
    award_type = None

    if inr_match:
        # Use INR equivalent if provided
        amount_str = inr_match.group(1).replace(',', '')
        try:
            amount = float(amount_str)
            currency = 'INR'
        except ValueError:
            print(f"Failed to parse INR equivalent: {amount_str}")
    else:
        # Regex to match amounts with commas
        amount_pattern = r'(?:₹|USD|GBP|EUR|JPY|RM|NZD|£|\$|€)?\s*([\d,]+)(?:\.\d{2})?\s*(?:₹|USD|GBP|EUR|JPY|RM|NZD)?'
        match = re.search(amount_pattern, cleaned_str)

        if match:
            amount_str = match.group(1).replace(',', '')
            try:
                amount = float(amount_str)
            except ValueError:
                print(f"Failed to parse amount: {amount_str}")
                return None, None, None, 'variable'

            # Determine currency
            if '₹' in award_str:
                currency = 'INR'
            elif '£' in award_str or 'GBP' in award_str:
                currency = 'GBP'
            elif '$' in award_str or 'USD' in award_str:
                currency = 'USD'
            elif '€' in award_str or 'EUR' in award_str:
                currency = 'EUR'
            elif 'JPY' in award_str:
                currency = 'JPY'
            elif 'RM' in award_str:
                currency = 'RM'
            elif 'NZD' in award_str:
                currency = 'NZD'

    # Determine periodicity
    if 'monthly' in award_str.lower():
        periodicity = 'monthly'
    elif 'one-time' in award_str.lower():
        periodicity = 'one-time'
    elif 'per day' in award_str.lower() or 'daily' in award_str.lower():
        periodicity = 'daily'
    elif 'one-year' in award_str.lower() or 'per year' in award_str.lower():
        periodicity = 'annual'

    return amount, currency, periodicity, award_type

def process_award_amount(award_str):
    """Process award string and return processed amount and periodicity"""
    amount, currency, periodicity, award_type = extract_amount(award_str)

    if award_type is not None:
        return award_type, 'None'
    else:
        if amount is None or currency is None:
            return 'variable', 'None'
        else:
            if currency == 'INR':
                inr_amount = amount
            else:
                inr_amount = amount * exchange_rates.get(currency, 1)
                if periodicity == 'monthly':
                    inr_amount *= 12  # Convert monthly to annual

            return round(inr_amount, 2), periodicity

def scrape_buddy4study():
    """Scrape scholarships from Buddy4Study"""
    print("Starting Buddy4Study scraping...")
    
    # Page 1
    url = "https://www.buddy4study.com/scholarships"
    #print(f"Opening: {url}")
    driver.get(url)
    WebDriverWait(driver, 10).until(
        EC.presence_of_all_elements_located((By.XPATH, "//h4"))
    )

    html = driver.page_source
    soup = BeautifulSoup(html, "html.parser")
    cards = soup.find("div", class_=re.compile(r"^Listing_categoriesCard"))
    a_tags = cards.find_all("a", class_=re.compile(r"^Listing_categoriesBox"))
    hrefs = [a['href'] for a in a_tags if a.has_attr('href')]
    base_url = "https://www.buddy4study.com"
    full_links = [base_url + href for href in hrefs]

    # Page 2
    url2 = "https://www.buddy4study.com/scholarships?filter=eyJSRUxJR0lPTiI6W10sIkdFTkRFUiI6W10sIkVEVUNBVElPTiI6W10sIkNPVU5UUlkiOltdLCJDT1VSU0UiOltdLCJTVEFURSI6W10sIkZPUkVJR04iOltdLCJzb3J0T3JkZXIiOiJERUFETElORSJ9&page=2"
    #print(f"Opening: {url2}")
    driver.get(url2)
    WebDriverWait(driver, 10).until(
        EC.presence_of_all_elements_located((By.XPATH, "//h4"))
    )

    html2 = driver.page_source
    soup2 = BeautifulSoup(html2, "html.parser")
    cards2 = soup2.find("div", class_=re.compile(r"^Listing_categoriesCard"))
    a_tags2 = cards2.find_all("a", class_=re.compile(r"^Listing_categoriesBox"))
    hrefs2 = [a['href'] for a in a_tags2 if a.has_attr('href')]
    full_links2 = [base_url + href for href in hrefs2]

    all_links = full_links + full_links2
    print(f"Found {len(all_links)} links from Buddy4Study")

    # Process each scholarship
    for i, link in enumerate(all_links):
        try:
            #print(f"Processing scholarship {i+1}/{len(all_links)}: {link}")
            driver.get(link)
            WebDriverWait(driver, 10).until(
                EC.presence_of_all_elements_located((By.XPATH, "//h4"))
            )
            
            link_html = driver.page_source
            link_soup = BeautifulSoup(link_html, 'html.parser')
            scholarship_title = link_soup.find("h1", class_=re.compile(r"^scholarshipHeader_mainTitle")).text.strip()
            
            list_items = link_soup.find_all("div", class_=re.compile(r"^ScholarshipDetails_eligibilityDetailsBox"))
            h5tag = link_soup.find("h5", string='Important Links')
            article_tag = h5tag.find_next_sibling('article') if h5tag else None
            lt = article_tag.find('a', string='Apply online link') if article_tag else None
            s_link = lt.get('href') if lt else None

            details = []
            for l in list_items:
                eq = l.find("p").text
                details.append(eq)

            eligibility = details[0]
            country = details[1]
            award = details[2]
            deadline = details[3]
            
            undergraduate, postgraduate, doctoral = extract_study_levels(eligibility)
            award_amount, periodicity = process_award_amount(award)

            scholarship_data = {
                "title": scholarship_title,
                "eligibility": eligibility,
                "country": country,
                "award": award,
                "deadline": deadline,
                "undergraduate": undergraduate,
                "postgraduate": postgraduate,
                "doctoral": doctoral,
                "url": s_link,
                "award_amount": award_amount,
                "periodicity": periodicity
            }

            collection.insert_one(scholarship_data)
            #print(f"Successfully added: {scholarship_title}")

        except Exception as e:
            print(f'Error processing {link}: {e}')

def scrape_college_dunia():
    """Scrape scholarships from College Dunia"""
    print("Starting College Dunia scraping...")
    
    url = "https://collegedunia.com/scholarship"
    print(f"Opening: {url}")
    driver.get(url)

    WebDriverWait(driver, 20).until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, "[class*='scholarship-card']"))
    )
    
    html = driver.page_source
    soup = BeautifulSoup(html, "html.parser")
    bar = soup.find("div", class_=re.compile(r".*country-container.*"))
    countries = bar.find_all("a", class_=re.compile(r".*country-links.*"))
    countries = [c.text.strip() for c in countries][2:]
    print(f"Found countries: {countries}")

    for country in countries:
        country_url = country.lower().replace(' ', '-')
        if country == 'New Zealand':
            country_url = 'new-zealand'
        elif country == 'Hong Kong':
            country_url = 'hong-kong'
        elif country == 'Uae':
            country_url = 'uae'
        
        url = f'https://collegedunia.com/{country_url}/scholarship'
        
        try:
            #print(f"Opening {country} scholarships: {url}")
            driver.get(url)
            WebDriverWait(driver, 20).until(
                EC.presence_of_all_elements_located((By.CSS_SELECTOR, "[class*='scholarship-card']"))
            )
            
            html = driver.page_source
            soup = BeautifulSoup(html, "html.parser")
            pages_tag = soup.find("ul", class_=lambda c: c and "paginate" in c and "text-center" in c)

            if pages_tag:
                page_li_tags = pages_tag.find_all('li')
                no_of_pages = int(page_li_tags[-2].text.strip())
            else:
                no_of_pages = 1
            
            print(f"Processing {country}: {no_of_pages} pages")

            for p in range(1, no_of_pages + 1):
                if p == 1:
                    url_p = f'https://collegedunia.com/{country_url}/scholarship'
                else:
                    url_p = f'https://collegedunia.com/{country_url}/scholarship/page-{p}?user_currency=2'
                
                try:
                    #print(f"Opening {country} page {p}: {url_p}")
                    driver.get(url_p)
                    WebDriverWait(driver, 20).until(
                        EC.presence_of_all_elements_located((By.CSS_SELECTOR, "[class*='scholarship-card']"))
                    )
                    
                    html = driver.page_source
                    soup = BeautifulSoup(html, "html.parser")
                    cards = soup.find_all("div", class_=re.compile(r".*scholarship-card.*"))
                    
                    los = []
                    for card in cards:
                        li_tags = card.find_all("li", class_=re.compile(r'.*pb-3 text-lg*.'))
                        if len(li_tags) > 3:
                            li = li_tags[3].find('span').text.strip()
                            los.append(li)
                    
                    a_tags = [c.find("a") for c in cards]
                    links = [a['href'] for a in a_tags if a and a.has_attr('href')]
                    base_url2 = 'https://collegedunia.com'
                    full_links = [base_url2 + link for link in links]

                    for i in range(len(full_links)):
                        try:
                            #print(f"Processing scholarship {i+1}/{len(full_links)} from {country} page {p}")
                            driver.get(full_links[i])
                            WebDriverWait(driver, 10).until(
                                EC.presence_of_element_located((By.CSS_SELECTOR, "h1.scholarship-heading"))
                            )
                            
                            link_html = driver.page_source
                            link_soup = BeautifulSoup(link_html, 'html.parser')
                            scholarship_title = link_soup.find("h1", class_=re.compile(r".*text-black-heading*.")).text.strip()
                            
                            levelOfStudy = los[i] if i < len(los) else 'Unknown'
                            undergraduate, postgraduate, doctoral = 0, 0, 0
                            
                            if levelOfStudy == 'Bachelor':
                                undergraduate = 1
                            elif levelOfStudy == 'Master':
                                postgraduate = 1
                            elif levelOfStudy == 'Doctorate':
                                doctoral = 1

                            table = link_soup.find('table', class_=re.compile(r".*table-scholarship*."))
                            if table:
                                tr_tags = table.find_all('tr')
                                deadline = tr_tags[3].find('td', class_='text-wrap').text.strip() if len(tr_tags) > 3 else 'N/A'
                                amount = tr_tags[5].find('td', class_='text-wrap').text.strip() if len(tr_tags) > 5 else 'N/A'
                                link_tag = tr_tags[-1].find('a', class_='text-link') if tr_tags else None
                                link = link_tag.get('href') if link_tag else None
                            else:
                                deadline, amount, link = 'N/A', 'N/A', None

                            # Extract eligibility
                            h2_tag = link_soup.find('h2', string='Eligibility Criteria')
                            eligibility = 'N/A'
                            
                            if h2_tag:
                                parent_div = h2_tag.find_parent('div')
                                div_tag = parent_div.find_next_sibling('div') if parent_div else None
                                
                                if div_tag:
                                    p_text = div_tag.find("p")
                                    p_text = p_text.text.strip() if p_text else ''
                                    
                                    ul_tag = div_tag.find("ul")
                                    ul_text_list = []
                                    if ul_tag:
                                        ul_tag_list = ul_tag.find_all("li")
                                        ul_text_list = [li.text.strip() for li in ul_tag_list]
                                    
                                    eligibility = p_text + '#'
                                    for u in ul_text_list:
                                        eligibility = eligibility + '&' + u

                            award_amount, periodicity = process_award_amount(amount)

                            scholarship_data = {
                                "title": scholarship_title,
                                "eligibility": eligibility,
                                "country": country,
                                "award": amount,
                                "deadline": deadline,
                                "undergraduate": undergraduate,
                                "postgraduate": postgraduate,
                                "doctoral": doctoral,
                                "url": link,
                                "award_amount": award_amount,
                                "periodicity": periodicity
                            }

                            collection.insert_one(scholarship_data)
                            #print(f"Successfully added: {scholarship_title}")

                        except Exception as e:
                            print(f'Error processing {full_links[i]}: {e} ({country})')

                except Exception as e1:
                    print(f'Error loading {country} page {p}: {e1}')

        except Exception as E:
            print(f'Error loading {country} in collegedunia: {E}')

def main():
    """Main function to run the scraper"""
    try:
        print("Starting scholarship scraping process...")
        
        # Scrape from both sources
        scrape_buddy4study()
        scrape_college_dunia()
        
        # Final count
        total_count = collection.count_documents({})
        
        print(f"Total scholarships added to the database: {total_count}")
        
    except Exception as e:
        print(f"Error in main process: {e}")
    finally:
        driver.quit()
        print("Browser closed. Scraping completed.")

if __name__ == "__main__":
    main()