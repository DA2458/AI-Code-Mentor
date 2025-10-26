export const generateFeedback = (issues, skillLevel) => {
  const feedback = {
    summary: '',
    teaching: [],
    questions: [],
    nextSteps: []
  };
  
  const highSeverity = issues.filter(i => i.severity === 'high').length;
  const hasLogicIssues = issues.some(i => i.type === 'logic');
  
  if (issues[0]?.type === 'success') {
    feedback.summary = skillLevel === 'beginner' 
      ? "Great work! Your code looks solid. Keep practicing!" 
      : "Code structure is sound. Consider edge cases and optimization.";
    feedback.nextSteps = [
      'Test your code with various inputs',
      'Think about edge cases (empty input, very large numbers, etc.)',
      'Consider time and space complexity'
    ];
    return feedback;
  }
  
  if (highSeverity > 0) {
    feedback.summary = skillLevel === 'beginner'
      ? `I found ${highSeverity} critical issue${highSeverity > 1 ? 's' : ''} that will prevent your code from running correctly. Let's work through them together!`
      : `${highSeverity} critical issue${highSeverity > 1 ? 's' : ''} detected. Review the base cases and control flow.`;
  } else {
    feedback.summary = "Your code runs, but there are some improvements we can make.";
  }
  
  // Generate teaching points based on skill level
  issues.forEach(issue => {
    if (issue.type === 'logic' && issue.message.includes('base case')) {
      if (skillLevel === 'beginner') {
        feedback.teaching.push({
          concept: 'Recursive Base Cases',
          explanation: 'Every recursive function needs a base case - a condition where it stops calling itself. Your base case should handle ALL stopping conditions, not just one value.',
          example: 'For factorial, both 0! and 1! equal 1, so use: if n <= 1: return 1'
        });
        feedback.questions.push('What would happen if someone calls factorial(0)? Walk through the steps.');
      } else {
        feedback.teaching.push({
          concept: 'Edge Case Handling',
          explanation: 'Your base case needs to handle edge cases. Consider: what are all the valid inputs that should stop the recursion?',
          example: 'n <= 1 covers both 0 and 1, preventing infinite recursion.'
        });
      }
    }
    
    if (issue.type === 'logic' && issue.message.includes('infinite loop')) {
      feedback.teaching.push({
        concept: 'Loop Termination',
        explanation: 'Every loop needs a way to exit. Without a break statement or a condition that becomes false, your loop will run forever.',
        example: 'Add a break statement when a certain condition is met, or use a condition that will eventually become false.'
      });
      feedback.questions.push('Under what condition should this loop stop? How can you express that in code?');
    }

    if (issue.type === 'logic' && issue.message.includes('memory leak')) {
      feedback.teaching.push({
        concept: 'Memory Management',
        explanation: 'In C/C++, memory you allocate must be manually freed. Failing to do so causes memory leaks.',
        example: 'int* ptr = new int[10]; // ... use it ... delete[] ptr;'
      });
      feedback.questions.push('Where in your code should you free the allocated memory?');
    }

    if (issue.type === 'syntax' && issue.message.includes('semicolon')) {
      if (skillLevel === 'beginner') {
        feedback.teaching.push({
          concept: 'Statement Terminators',
          explanation: 'In C/C++/Java/C#, most statements end with a semicolon. It tells the compiler where one statement ends and another begins.',
          example: 'int x = 5; // semicolon required'
        });
      }
    }

    if (issue.message.includes('null reference')) {
      feedback.teaching.push({
        concept: 'Null Safety',
        explanation: 'In C#, accessing members of a null object throws a NullReferenceException. Always check for null or use null-safe operators.',
        example: 'string result = myObject?.ToString() ?? "default";'
      });
      feedback.questions.push('What happens if the object is null when you try to access its properties?');
    }
  });
  
  // Next steps
  if (hasLogicIssues) {
    feedback.nextSteps = [
      'Fix the logical issues identified above',
      'Test your code with edge cases',
      'Add comments explaining your logic'
    ];
  } else {
    feedback.nextSteps = [
      'Run your code with test cases',
      'Consider code readability and style',
      'Think about performance optimization'
    ];
  }
  
  return feedback;
};

export const getSeverityColor = (severity) => {
  switch (severity) {
    case 'high': return 'text-red-600 bg-red-50 border-red-200';
    case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
    default: return 'text-green-600 bg-green-50 border-green-200';
  }
};