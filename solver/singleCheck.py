import hashlib
import sys

def hash_string(string):
    return hashlib.sha256(string.encode('utf-8')).hexdigest()[:5]



print(hash_string(sys.argv[1]))