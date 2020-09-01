#!/home/jiawei/anaconda3/bin/python

import re
import pandas as pd

testString = "Damn1988aa2345Baa"
print(re.sub("(?<=\d{4})[A-Za-z]{1,2}?", "punish", testString))

concepts=pd.read_csv("log/concepts.csv")
keylist=["methylation","germline"]
print(concepts['explanation'].loc[concepts['word']=="missense"])
print(concepts[['word','explanation']].loc[concepts['word'].isin(keylist)])
