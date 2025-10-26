export const detectIssues = (code, language) => {
  const issues = [];
  
  if (language === 'python') {
    // Base case issues
    if (code.includes('factorial') && code.includes('n == 1') && !code.includes('n <= 1')) {
      issues.push({
        type: 'logic',
        severity: 'high',
        line: code.split('\n').findIndex(l => l.includes('n == 1')) + 1,
        message: 'Incomplete base case in recursive function',
        explanation: 'Your base case only handles n=1, but what happens when n=0? The function will recurse infinitely.'
      });
    }
    
    // Indentation issues
    if (/^\S+\s+/.test(code) && code.includes('def ')) {
      const lines = code.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() && !lines[i].startsWith(' ') && !lines[i].startsWith('def') && !lines[i].startsWith('#')) {
          if (i > 0 && lines[i-1].trim().endsWith(':')) {
            issues.push({
              type: 'syntax',
              severity: 'high',
              line: i + 1,
              message: 'Indentation error',
              explanation: 'Python requires consistent indentation. Code inside a function or after a colon must be indented.'
            });
            break;
          }
        }
      }
    }
    
    // Infinite loop detection
    if (code.includes('while True') && !code.includes('break')) {
      issues.push({
        type: 'logic',
        severity: 'medium',
        line: code.split('\n').findIndex(l => l.includes('while True')) + 1,
        message: 'Potential infinite loop',
        explanation: 'You have a "while True" loop without a break statement. How will this loop ever stop?'
      });
    }
    
    // Off-by-one in range
    if (code.match(/range\(\w+\)/)) {
      issues.push({
        type: 'concept',
        severity: 'low',
        line: code.split('\n').findIndex(l => l.match(/range\(\w+\)/)) + 1,
        message: 'Potential off-by-one error',
        explanation: 'Remember: range(n) goes from 0 to n-1, not 0 to n. Is this what you intended?'
      });
    }
    
    // Unused variable
    const varMatch = code.match(/(\w+)\s*=\s*.+/g);
    if (varMatch) {
      varMatch.forEach(match => {
        const varName = match.split('=')[0].trim();
        const usageCount = (code.match(new RegExp(`\\b${varName}\\b`, 'g')) || []).length;
        if (usageCount === 1 && varName !== '_') {
          issues.push({
            type: 'style',
            severity: 'low',
            line: code.split('\n').findIndex(l => l.includes(match)) + 1,
            message: `Variable '${varName}' is assigned but never used`,
            explanation: 'Did you forget to use this variable, or is it unnecessary?'
          });
        }
      });
    }
    
    // Missing return statement
    if (code.includes('def ') && !code.includes('return') && !code.includes('print')) {
      issues.push({
        type: 'logic',
        severity: 'medium',
        line: code.split('\n').findIndex(l => l.includes('def ')) + 1,
        message: 'Function may not return a value',
        explanation: 'Your function does not have a return statement. Should it return something?'
      });
    }
  }
  
  if (language === 'c' || language === 'cpp') {
    // Missing semicolon
    const lines = code.split('\n');
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed && 
          !trimmed.endsWith(';') && 
          !trimmed.endsWith('{') && 
          !trimmed.endsWith('}') &&
          !trimmed.startsWith('#') &&
          !trimmed.startsWith('//') &&
          !trimmed.includes('if') &&
          !trimmed.includes('for') &&
          !trimmed.includes('while')) {
        issues.push({
          type: 'syntax',
          severity: 'high',
          line: idx + 1,
          message: 'Missing semicolon',
          explanation: 'In C/C++, most statements must end with a semicolon. Did you forget one here?'
        });
      }
    });

    // Array access without bounds checking
    if (code.match(/\w+\[\w+\]/) && !code.includes('if') && !code.includes('while')) {
      issues.push({
        type: 'logic',
        severity: 'medium',
        line: 1,
        message: 'Potential array bounds violation',
        explanation: 'Are you checking if the index is within valid bounds? Accessing outside array bounds causes undefined behavior in C/C++.'
      });
    }

    // Memory leak detection
    if ((code.includes('malloc') || code.includes('new')) && !code.includes('free') && !code.includes('delete')) {
      issues.push({
        type: 'logic',
        severity: 'high',
        line: code.split('\n').findIndex(l => l.includes('malloc') || l.includes('new')) + 1,
        message: 'Potential memory leak',
        explanation: 'You allocated memory but never freed it. Every malloc() needs a free(), and every new needs a delete.'
      });
    }

    // Uninitialized variable
    if (code.match(/int\s+\w+;/) || code.match(/float\s+\w+;/)) {
      issues.push({
        type: 'logic',
        severity: 'medium',
        line: 1,
        message: 'Potentially uninitialized variable',
        explanation: 'In C/C++, variables are not automatically initialized. Always assign a value before using it.'
      });
    }
  }

  if (language === 'csharp') {
    // Null reference
    if (code.includes('.') && !code.includes('if') && !code.includes('?.')) {
      issues.push({
        type: 'logic',
        severity: 'medium',
        line: 1,
        message: 'Potential null reference exception',
        explanation: 'Are you checking if the object is null before accessing its members? Consider using null-conditional operator (?.) or null checks.'
      });
    }

    // Missing using statement for IDisposable
    if ((code.includes('new StreamReader') || code.includes('new FileStream')) && !code.includes('using')) {
      issues.push({
        type: 'style',
        severity: 'medium',
        line: code.split('\n').findIndex(l => l.includes('StreamReader') || l.includes('FileStream')) + 1,
        message: 'Resource not properly disposed',
        explanation: 'Use a using statement to ensure resources are properly disposed. This prevents resource leaks.'
      });
    }

    // Catching generic Exception
    if (code.includes('catch (Exception')) {
      issues.push({
        type: 'style',
        severity: 'low',
        line: code.split('\n').findIndex(l => l.includes('catch (Exception')) + 1,
        message: 'Catching generic Exception',
        explanation: 'Consider catching more specific exception types. This makes your error handling more precise and maintainable.'
      });
    }
  }
  
  // If no specific issues found, provide general feedback
  if (issues.length === 0) {
    issues.push({
      type: 'success',
      severity: 'none',
      message: 'No obvious issues detected!',
      explanation: 'Your code structure looks good. Consider testing it with different inputs to verify it works as expected.'
    });
  }
  
  return issues;
};