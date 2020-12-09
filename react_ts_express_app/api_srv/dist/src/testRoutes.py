import sys
import re
import json


def regexJsonOutput(oldStr: str, newStr: str, regex: str) -> dict:
    # JSON doesn't accept single quotes
    return {"oldString": oldStr, "newString": newStr, "regex": regex, "replacedBy": "RE"}


# # "?" at the end renders non-greedy matching
regex1 = "(?<=\d{2})[A-Za-z]{1,2}?"
prefix_str = "Damn198aa235Baa"
pyRegexOutput = []
for line in sys.stdin:
    pdbID = json.loads(line).split(":")[1].strip('}').strip('\"')
    prefix_pdbID = ("_").join((prefix_str, pdbID))
    strAfterRegex1 = re.sub(regex1, "RE", prefix_pdbID)
    outputObj = regexJsonOutput(prefix_pdbID, strAfterRegex1, regex1);
    pyRegexOutput.append(outputObj)

print(json.dumps(pyRegexOutput))
