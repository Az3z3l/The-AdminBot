#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import string
import os
import hashlib
import sys

ALLOWED_CHARACTERS = string.ascii_lowercase+string.digits
NUMBER_OF_CHARACTERS = len(ALLOWED_CHARACTERS)
MINIMUM_LENGTH=1
MAXIMUM_LENGTH=2

def characterToIndex(char):
    return ALLOWED_CHARACTERS.index(char)

def indexToCharacter(index):
    if NUMBER_OF_CHARACTERS <= index:
        raise ValueError("Index out of range.")
    else:
        return ALLOWED_CHARACTERS[index]

def listToString(s):  
    # initialize an empty string 
    str1 = ""  
    
    # traverse in the string   
    for ele in s:  
        str1 += ele   
    
    # return string   
    return str1  


def next(string):
    if len(string) <= 0:
        string.append(indexToCharacter(0))
    else:
        string[0] = indexToCharacter((characterToIndex(string[0]) + 1) % NUMBER_OF_CHARACTERS)
        if characterToIndex(string[0]) == 0:
            return list(string[0]) + next(string[1:])
    return string

def minLength(length):
    chars="9"*(length-1)
    return ([char for char in chars])
    

def funcfunc(bf):
    return (hashlib.sha256(bf.encode('utf-8')).hexdigest()[:1])


def main():
    sequence = list()
    sequence = minLength(MINIMUM_LENGTH)
    status=True
    try:
        hashster = sys.argv[1]
    except:
        print("Usage: ./normie.py the-hash-needed")
        exit()
    while status:
        sequence = next(sequence)
        string=listToString(sequence)
        if len(string)>=MAXIMUM_LENGTH+1:
            break
        # print (string)
        if (funcfunc(string) == hashster):
            print(string)
            status = False



if __name__ == "__main__":
    main()
