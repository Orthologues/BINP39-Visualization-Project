#!/home/jiawei/anaconda3/bin/python

import re
import pandas as pd

testString = "Damn1988aa2345Baa"
# "?" at the end renders non-greedy matching
print(re.sub("(?<=\d{4})[A-Za-z]{1,2}?", "punish", testString))

# Test dataframe in pandas #
concepts=pd.read_csv("log/concepts.csv")
keylist=["methylation","sequence conservation","frameshift indels"]

# use list() for conversion #
result1=list(concepts['explanation'].loc[concepts['word']=="missense"])
print("missense",result1)

# A more generic solution to deal with problems in widths of printing #
pd.options.display.max_colwidth = 200
result2=concepts[['word','explanation']].loc[concepts['word'].isin(keylist)]
print(result2)
