#!/home/jiawei/anaconda3/bin/python

import re
import pandas as pd

testString = "Damn1988aa2345Baa"
# "?" at the end renders non-greedy matching
print(re.sub("(?<=\d{4})[A-Za-z]{1,2}?", "punish", testString))

# Test dataframe in pandas
concepts=pd.read_csv("log/concepts.csv")
keylist=["methylation","rotamer","PTV","NMD","NMD failure","dN/dS","biallelic","MCC"]

# use list() for conversion
result1=list(concepts['explanation'].loc[concepts['word']=="missense"])
print("missense",result1)

# A more generic solution to deal with problems in widths of printing
pd.set_option('display.max_colwidth', None)
# Or to set a specific maximum by pd.options.display.max_colwidth = 150
result2=concepts[['word','explanation']].loc[concepts['word'].isin(keylist)]
print(result2)

# run the following bash statement to have a better view at terminal
# ./script/test.py|sed -r 's/\s{2,}/\t/g'|sed -r 's/^[0-9]+//g' #

# Test re.match().group() method
statements=("You love Mary","Du liebst Margot",
            "Tu aimes Marie","Amas Maria")
pats = [("You love (\w+)", "He used to love {0}" ),
("Du liebst (\w+)", "Er hatte {0} geliebt" ),
("Amas (\w+)", "El amaba a {0}")]

for statement in statements:
    for p1,p2 in pats:
        m=re.match(p1,statement)
        if m:
            print(p2.format(m.group()),"  ",p2.format(m.group(1)))
            break
