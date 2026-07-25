import re

OFFICIAL_DOMAINS = [
    "sbi.co.in",
    "onlinesbi.sbi",
    "icicibank.com",
    "hdfcbank.com",
    "axisbank.com",
    "kotak.com",
    "paytm.com",
    "phonepe.com",
    "googlepay.com",
    "amazon.in"
]

def detect_fake_url(message):

    urls = re.findall(r'https?://[^\s]+', message)

    suspicious = []

    for url in urls:

        trusted = False

        for domain in OFFICIAL_DOMAINS:

            if domain in url:
                trusted = True
                break

        if not trusted:
            suspicious.append(url)

    return suspicious