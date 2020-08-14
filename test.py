#!/home/jiaweizhao/anaconda3/bin/python

import re

testString = "Damn1988aa2345Baa"
print(re.sub("(?<=\d{4})[A-Za-z]{1,2}", "punish", testString))
