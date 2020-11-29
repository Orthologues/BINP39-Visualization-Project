import sys, re

testString = "Damn198aa235Baa"
for line in sys.stdin:
    testString = ('/').join((testString, line))
# "?" at the end renders non-greedy matching
regex1 = "(?<=\d{2})[A-Za-z]{1,2}?"
convetedTestString = re.sub(regex1, 'RE', testString)
print("from \"{}\" to \"{}\" by regex \"{}\".".format(testString, convetedTestString, regex1))
