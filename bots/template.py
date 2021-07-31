#  Challenge Name Goes Here // TEMPLATE FOR FIREFOX
import os
import redis
import time
import threading
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver import FirefoxOptions


queueName = os.path.basename(__file__).split(".py")[0]

challName = "bot"

r = redis.Redis(host='0.0.0.0', port=6379)

host = "http://localhost"
cookie = {"name": "Token", "value": "1337", "httpOnly": True}

opts = FirefoxOptions()
opts.add_argument("--headless")

def url_visit(url):
    driver = webdriver.Firefox(firefox_options=opts)
    driver.set_page_load_timeout(10)
    try:
        driver.get(host)
        driver.add_cookie(cookie)
        driver.get(url)
        time.sleep(5)
        driver.quit()
        return True
    except:
        print ("Could not load the URL.")
        driver.quit()
        return False


def sendUrl():
    while True:
        try:
            x = popMe()
            print(x)
            url_visit(x)
        except:
            time.sleep(1)
            continue
        

def popMe():
    return (r.rpop(queueName).decode('utf8'))


print(f"Started bot for chall {challName} with id {queueName}")

# sendUrl()
t1 = threading.Thread(target=sendUrl)
t2 = threading.Thread(target=sendUrl)
t3 = threading.Thread(target=sendUrl)

t1.start()
time.sleep(1.1)
t2.start()
time.sleep(2.3)
t3.start()

t1.join()
t2.join()
t3.join()
