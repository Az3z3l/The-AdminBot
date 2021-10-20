#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import webXtools
import hashlib
import string
import sys

# Find a string such that `hashlib.sha256("string".encode('utf-8')).hexdigest()[:5]` returns `3f6ac`

def main():
    try:
        hashster = sys.argv[1]
    except:
        print("Usage: ./webxtools.py the-hash-needed")
        exit()
    length = len(hashster)
    def check(string):
        if hashlib.sha256(string.encode('utf-8')).hexdigest()[:length] == hashster:
            return True
        else:
            return False

    # Returns the string that solves callback
    print(webXtools.bruteforce(minLength=1, maxLength=4, charSet=string.ascii_letters+string.digits, noOfThreads=4, callback=check))

if __name__ == "__main__":
    main()
