import sys
p = r"c:\Users\rafin\Documents\Chinezlanches-main\Frontend\style.css"
with open(p, encoding='utf-8') as f:
    stack = []
    for i, line in enumerate(f, start=1):
        for ch in line:
            if ch == '{':
                stack.append(i)
            elif ch == '}':
                if stack:
                    stack.pop()
                else:
                    print(f"Unmatched closing brace '}}' at line {i}")
    if stack:
        for ln in stack:
            print(f"Unmatched opening brace '{{' at line {ln}")
    else:
        print('All braces are balanced.')
