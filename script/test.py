#!/home/jiawei/anaconda3/bin/python

import re
import pandas as pd

testString = "Damn1988aa2345Baa"
# "?" at the end renders non-greedy matching
print(re.sub("(?<=\d{4})[A-Za-z]{1,2}?", "punish", testString))

# Test dataframe in pandas
concepts=pd.read_csv("log/concepts.csv")
keylist=["methylation","sequence conservation","PTV","NMD","NMD failure","dN/dS","biallelic","MCC"]

# use list() for conversion
result1=list(concepts['explanation'].loc[concepts['word']=="missense"])
print("missense",result1)

# A more generic solution to deal with problems in widths of printing
pd.set_option('display.max_colwidth', None)
# Or to set a specific maximum
# pd.options.display.max_colwidth = 150 #
result2=concepts[['word','explanation']].loc[concepts['word'].isin(keylist)]
print(result2)

# run the following bash statement to have a better view at terminal
# ./script/test.py|sed -r 's/\s{2,}/\t/g'|sed -r 's/^[0-9]+//g' #
