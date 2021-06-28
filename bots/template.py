# Challenge Name Goes Here // TEMPLATE FOR FIREFOX
import os
import redis
import time
import threading
from selenium import webdriver
from selenium.webdriver.common.keys import Keys


queueName = os.path.basename(__file__).split(".py")[0]

challName = "Template for Firefox"

r = redis.Redis(host='0.0.0.0', port=6379)

host = "http://127.0.0.1:9999"
flag = "flag{this_is_the_admins_token}"
cooke = {"name": "fleg", "value": flag}

def url_visit(url):
    print(url)
    driver = webdriver.Firefox()
    driver.set_page_load_timeout(10)
    try:
        # driver.get(f"{host}/api/setcookie?flag={flag}")
        driver.get(host)
        driver.add_cookie(cooke)
        driver.get(url)
        time.sleep(10)  # 10 second timeout ?
        driver.quit()
        return True
    except:
        print ("Could not load the URL.")
        driver.quit()
        return False


def sendUrl():
    y = 0
    while True:
        y = y + 1
        print(y)
        try:
            x = popMe()
            url_visit(x)
        except:
            time.sleep(1)
            continue

def popMe():
    return (r.rpop('qid').decode('utf8'))



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
